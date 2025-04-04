import sys
import subprocess
import shutil
import platform
import os
import urllib.request
import tempfile
import json
from pathlib import Path
from typing import List, Dict, Optional

# Install third-party packages if missing
for pkg in ["rich", "questionary"]:
    try:
        __import__(pkg)
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", pkg])

from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.align import Align
from rich import box
from rich.markdown import Markdown
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
import questionary

console = Console()

STATE_FILE = ".vibe_setup_state.json"
FIREBASE_CLI = "firebase.cmd" if platform.system() == "Windows" else "firebase"
NPM_CLI = "npm.cmd" if platform.system() == "Windows" else "npm"

def clear_screen():
    if platform.system() == "Windows":
        subprocess.run(["cls"], shell=True)
    else:
        subprocess.run(["clear"], shell=True)

# ------------------ Pipeline State Manager ------------------

class SetupState:
    def __init__(self):
        self.state = {}
        self.load()

    def load(self):
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as f:
                self.state = json.load(f)

    def save(self):
        with open(STATE_FILE, "w") as f:
            json.dump(self.state, f, indent=2)

    def update(self, key: str, value):
        self.state[key] = value
        self.save()

    def get(self, key: str, default=None):
        return self.state.get(key, default)

    def show_summary(self):
        console.print("\n[bold cyan]Setup Summary[/bold cyan]")
        self.print_final_progress_table()

    def print_final_progress_table(self):
        table = Table(title="ViBe Setup Progress", box=box.ROUNDED)
        table.add_column("#", justify="center")
        table.add_column("Step", justify="left")
        table.add_column("Description", justify="left")
        table.add_column("Status", justify="center")

        steps = [
            WelcomeStep(),
            ToolchainCheckStep(),
            FirebaseLoginStep(),
            FirebaseEmulatorsStep(os.path.join(os.getcwd(), "backend")),
            EnvFileStep(os.path.join(os.getcwd(), "backend")),
            PackageInstallStep(os.path.join(os.getcwd(), "backend")),
            MongoDBBinaryStep(os.path.join(os.getcwd(), "backend")),
            TestStep(os.path.join(os.getcwd(), "backend"))
        ]

        for index, step in enumerate(steps, 1):
            if self.get(step.name):
                status = "✅"
            else:
                status = "❌"
            table.add_row(str(index), step.name, step.description, status)

        console.print(table)


# ------------------ Base Step Class ------------------

class PipelineStep:
    def __init__(self, name: str, description: str, instructions: Optional[str] = None):
        self.name = name
        self.description = description
        self.instructions = instructions

    def should_run(self, state: SetupState) -> bool:
        return not state.get(self.name)

    def run(self, state: SetupState):
        raise NotImplementedError("Each step must implement a run method")

    def display_instructions(self):
        if self.instructions:
            console.print(Panel(self.instructions, title=f"[bold cyan]{self.name} - Instructions[/bold cyan]"))

# ------------------ Step Implementations ------------------

class WelcomeStep(PipelineStep):
    def __init__(self):
        super().__init__("welcome", "Show welcome message and select environment/setup")

    def run(self, state):
        title = Text("🚀 ViBe Setup Wizard 🚀", style="bold white on blue", justify="center")
        console.print(Align.center(title))
        panel = Panel("[green]Welcome to the ViBe backend setup process![/green]", title="[bold cyan]Welcome[/bold cyan]", border_style="green", box=box.ROUNDED)
        console.print("\n")
        console.print(panel)
        console.print("\n")
        environment = questionary.select("Choose environment:", choices=["Development", "Production"]).ask()
        setup_type = questionary.select("What do you want to setup?", choices=["Backend", "Frontend", "Both"]).ask()
        state.update("environment", environment)
        state.update("setup_type", setup_type)
        state.update(self.name, True)


class ToolchainCheckStep(PipelineStep):
    def __init__(self):
        super().__init__("toolchain", "Verify Node.js, npm, pnpm, and firebase-tools are installed")

    def run(self, state):
        def check_command_exists(command):
            return shutil.which(command) is not None

        if not check_command_exists("node"):
            console.print("[yellow]⚠ Node.js is not installed. Installing using fnm...[/yellow]")
            try:
                if platform.system() == "Windows":
                    subprocess.run(["winget", "install", "Schniz.fnm"], check=True)
                else:
                    subprocess.run(["curl", "-o-", "https://fnm.vercel.app/install", "|", "bash"], check=True, shell=True)
                subprocess.run(["fnm", "install", "22"], check=True)
            except subprocess.CalledProcessError as e:
                console.print(f"[red]❌ Failed to install Node.js: {e}[/red]")
                sys.exit(1)
            console.print("[green]✅ Node.js installed successfully.[/green]")
            
        if not check_command_exists("npm"):
            console.print("[red]❌ npm is not installed.")
            sys.exit(1)
        if not check_command_exists("pnpm"):
            console.print("[yellow]⚠ Installing pnpm...[/yellow]")
            subprocess.run([NPM_CLI, "install", "-g", "pnpm"], check=True, shell=(platform.system() == "Windows"))

        if not check_command_exists("firebase"):
            console.print("[yellow]⚠ Installing firebase-tools...[/yellow]")
            subprocess.run(["pnpm", "install", "-g", "firebase-tools"], check=True, shell=(platform.system() == "Windows"))

        console.print(":white_check_mark: [green]Toolchain verified.[/green]")
        state.update(self.name, True)

class FirebaseLoginStep(PipelineStep):
    def __init__(self):
        super().__init__("firebase_login", "Ensure Firebase CLI is logged in")

    def run(self, state):
        result = subprocess.run([FIREBASE_CLI, "login:list"], capture_output=True, text=True, shell=(platform.system() == "Windows"))
        if "No authorized accounts" in result.stdout:
            subprocess.run([FIREBASE_CLI, "login"], check=True, shell=(platform.system() == "Windows"))
        state.update(self.name, True)

class FirebaseEmulatorsStep(PipelineStep):
    def __init__(self, backend_dir):
        super().__init__("emulators", "Initialize Firebase emulators",
                                    instructions="Please choose ONLY the following emulators when prompted:\n\n✔ Authentication Emulator\n✔ Functions Emulator\n✔ Emulator UI [optional but recommended]")
        self.backend_dir = backend_dir

    def run(self, state):
        subprocess.run([FIREBASE_CLI, "init", "emulators"], cwd=self.backend_dir, check=True, shell=(platform.system() == "Windows"))
        state.update(self.name, True)

class EnvFileStep(PipelineStep):
    def __init__(self, backend_dir):
        super().__init__("env", "Create .env file and set MongoDB URI",
                                    instructions="""
                                    [bold]MongoDB URI Instructions:[/bold]

                                    1.  Go to [link=https://www.mongodb.com/atlas/database]MongoDB Atlas[/link] and sign up or log in.
                                    2.  Create a new project and cluster.
                                    3.  Navigate to the 'Database Access' section in your project.
                                    4.  Create a new database user with appropriate permissions.
                                    5.  Go to the 'Clusters' section and click 'Connect' on your cluster.
                                    6.  Select 'Connect your application'.
                                    7.  Copy the connection string.
                                    8.  [bold red]Replace '<password>' in the copied string with the actual password[/bold red] you created for the database user.
                                    9.  Paste the modified connection string below.
                                    """)
        self.backend_dir = backend_dir

    def run(self, state):
        env_path = os.path.join(self.backend_dir, ".env")
        if not os.path.exists(env_path):
            uri = questionary.text("Paste your MongoDB URI:").ask()
            with open(env_path, "w") as f:
                f.write(f"DB_URL=\"{uri}\"\n")
        state.update(self.name, True)

class PackageInstallStep(PipelineStep):
    def __init__(self, backend_dir):
        super().__init__("packages", "Install backend dependencies")
        self.backend_dir = backend_dir

    def run(self, state):
        with console.status("Installing backend dependencies..."):
            subprocess.run(["pnpm", "install"], cwd=self.backend_dir, check=True, shell=(platform.system() == "Windows"))
            state.update(self.name, True)

class MongoDBBinaryStep(PipelineStep):
    def __init__(self, backend_dir):
        super().__init__("mongodb_binaries", "Ensure MongoDB binaries are downloaded")
        self.backend_dir = backend_dir

    def run(self, state):
        console.print("[cyan]Ensuring MongoDB binaries are downloaded for mongodb-memory-server...[/cyan]")
        script = """
        import { MongoMemoryServer } from 'mongodb-memory-server';

        (async () => {
            const mongod = await MongoMemoryServer.create();
            await mongod.getUri();
            await mongod.stop();
        })();
        """
        try:
            subprocess.run(["pnpm", "ts-node", "-e", script], check=True, cwd=self.backend_dir, shell=(platform.system() == "Windows"))
            state.update(self.name, True)
        except subprocess.CalledProcessError as e:
            console.print(f"[red]❌ Failed to download MongoDB binaries: {e}[/red]")
            sys.exit(1)

class TestStep(PipelineStep):
    def __init__(self, backend_dir):
        super().__init__("tests", "Run backend tests")
        self.backend_dir = backend_dir

    def run(self, state):
        with console.status("Running backend tests..."):
            result = subprocess.run(["pnpm", "run", "test:ci"], cwd=self.backend_dir, shell=(platform.system() == "Windows"))
            if result.returncode == 0:
                console.print("[green]✅ All tests passed! Backend setup complete.")
                console.print("[bold blue]👉 Run `pnpm run dev` inside the backend folder to start the server.[/bold blue]")
                state.update(self.name, True)
            else:
                console.print("[red]❌ Tests failed. Please fix and re-run the setup.")
                sys.exit(1)

# ------------------ Pipeline Manager ------------------

class SetupPipeline:
    def __init__(self, steps: List[PipelineStep], state: SetupState):
        self.steps = steps
        self.state = state

    def print_progress_table(self, current_step_name):
        table = Table(title="ViBe Setup Progress", box=box.ROUNDED)
        table.add_column("#", justify="center")
        table.add_column("Step", justify="left")
        table.add_column("Description", justify="left")
        table.add_column("Status", justify="center")

        for index, step in enumerate(self.steps, 1):
            if self.state.get(step.name):
                status = "✅"
            elif step.name == current_step_name:
                status = "🔄"
            else:
                status = "⏳"
            table.add_row(str(index), step.name, step.description, status)

        console.print(table)

    def run(self):
        for step in self.steps:
            if step.should_run(self.state):
                clear_screen()
                self.print_progress_table(step.name)
                if step.instructions:
                    step.display_instructions()
                step.run(self.state)
        clear_screen()
        self.print_progress_table("done")
        console.print("\n[bold green]🎉 Setup completed![/bold green]")

# ------------------ Main ------------------

def main():
    if len(sys.argv) > 1 and sys.argv[1] == "--summary":
        SetupState().show_summary()
        return

    backend_dir = os.path.join(os.getcwd(), "backend")
    state = SetupState()

    steps = [
        WelcomeStep(),
        ToolchainCheckStep(),
        FirebaseLoginStep(),
        FirebaseEmulatorsStep(backend_dir),
        EnvFileStep(backend_dir),
        PackageInstallStep(backend_dir),
        MongoDBBinaryStep(backend_dir),
        TestStep(backend_dir)
    ]

    pipeline = SetupPipeline(steps, state)
    pipeline.run()

if __name__ == "__main__":
    main()