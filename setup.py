# ViBe Setup Wizard - Modular Pipeline-Based Architecture

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
        console.print_json(json.dumps(self.state, indent=2))

# ------------------ Base Step Class ------------------

class PipelineStep:
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    def should_run(self, state: SetupState) -> bool:
        return not state.get(self.name)

    def run(self, state: SetupState):
        raise NotImplementedError("Each step must implement a run method")

# ------------------ Step Implementations ------------------

class WelcomeStep(PipelineStep):
    def __init__(self):
        super().__init__("welcome", "Show welcome message and select environment/setup")

    def run(self, state):
        console.clear()
        title = Text("🚀 ViBe Setup Wizard 🚀", style="bold white on blue", justify="center")
        console.print(Align.center(title))
        panel = Panel.fit("[green]Welcome to the ViBe backend setup process![/green]", title="[bold cyan]Welcome[/bold cyan]", border_style="green", box=box.ROUNDED)
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
        super().__init__("toolchain", "Verify Node.js, npm, and pnpm are installed")

    def run(self, state):
        console.clear()
        def check_command_exists(command):
            return shutil.which(command) is not None

        if not check_command_exists("node"):
            console.print("[red]❌ Node.js is not installed.")
            sys.exit(1)
        if not check_command_exists("npm"):
            console.print("[red]❌ npm is not installed.")
            sys.exit(1)
        if not check_command_exists("pnpm"):
            console.print("[yellow]⚠ Installing pnpm...[/yellow]")
            subprocess.run([NPM_CLI, "install", "-g", "pnpm"], check=True, shell=(platform.system() == "Windows"))

        console.print(":white_check_mark: [green]Toolchain verified.[/green]")
        state.update(self.name, True)

class FirebaseLoginStep(PipelineStep):
    def __init__(self):
        super().__init__("firebase_login", "Ensure Firebase CLI is logged in")

    def run(self, state):
        console.clear()
        result = subprocess.run([FIREBASE_CLI, "login:list"], capture_output=True, text=True, shell=(platform.system() == "Windows"))
        if "No authorized accounts" in result.stdout:
            subprocess.run([FIREBASE_CLI, "login"], check=True, shell=(platform.system() == "Windows"))
        state.update(self.name, True)

class FirebaseEmulatorsStep(PipelineStep):
    def __init__(self, backend_dir):
        super().__init__("emulators", "Initialize Firebase emulators")
        self.backend_dir = backend_dir

    def run(self, state):
        console.clear()
        console.print(Panel("[bold yellow]Please choose ONLY the following emulators when prompted:[/bold yellow]\n\n✔ Authentication Emulator\n✔ Functions Emulator\n✔ Emulator UI [optional but recommended]", title="[bold cyan]Firebase Emulator Setup Instructions[/bold cyan]"))

        subprocess.run([FIREBASE_CLI, "init", "emulators"], cwd=self.backend_dir, check=True, shell=(platform.system() == "Windows"))
        state.update(self.name, True)

class EnvFileStep(PipelineStep):
    def __init__(self, backend_dir):
        super().__init__("env", "Create .env file and set MongoDB URI")
        self.backend_dir = backend_dir

    def run(self, state):
        console.clear()
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
        console.clear()
        subprocess.run(["pnpm", "install"], cwd=self.backend_dir, check=True, shell=(platform.system() == "Windows"))
        state.update(self.name, True)

class TestStep(PipelineStep):
    def __init__(self, backend_dir):
        super().__init__("tests", "Run backend tests")
        self.backend_dir = backend_dir

    def run(self, state):
        console.clear()
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
        table.add_column("Step", justify="left")
        table.add_column("Description", justify="left")
        table.add_column("Status", justify="center")

        for step in self.steps:
            if self.state.get(step.name):
                status = "✅"
            elif step.name == current_step_name:
                status = "🔄"
            else:
                status = "⏳"
            table.add_row(step.name, step.description, status)

        console.clear()
        console.print(table)

    def run(self):
        for step in self.steps:
            self.print_progress_table(step.name)
            if step.should_run(self.state):
                step.run(self.state)
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
        TestStep(backend_dir)
    ]

    pipeline = SetupPipeline(steps, state)
    pipeline.run()

if __name__ == "__main__":
    main()