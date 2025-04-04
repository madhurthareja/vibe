#!/usr/bin/env python3
import sys
import subprocess
import shutil
import platform
import os
import urllib.request
import tempfile
import re

# Ensure required Python packages
def install_package(package):
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {package}. Please install manually.")
        sys.exit(1)

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.text import Text
    from rich.align import Align
    from rich import box
    from rich.markdown import Markdown
except ImportError:
    install_package("rich")
    from rich.console import Console
    from rich.panel import Panel
    from rich.text import Text
    from rich.align import Align
    from rich import box
    from rich.markdown import Markdown

try:
    import questionary
except ImportError:
    install_package("questionary")
    import questionary

console = Console()

# ------------------ UI ------------------

def show_welcome():
    console.clear()
    title = Text("🚀 ViBe Setup Wizard 🚀", style="bold white on blue", justify="center")
    console.print(Align.center(title))

    welcome_text = (
        "[green]ViBe[/green] is an [bold]innovative educational platform[/bold].\n\n"
        "👋 Use [bold]arrow keys[/bold] and [bold]Enter[/bold] to navigate options."
    )
    panel = Panel.fit(welcome_text, title="[bold cyan]Welcome[/bold cyan]", border_style="green", box=box.ROUNDED)
    console.print("\n")
    console.print(panel)
    console.print("\n")


def get_main_choice():
    return questionary.select(
        "Choose the setup mode:",
        choices=["Development", "Production"]
    ).ask()


def get_dev_choice():
    return questionary.select(
        "Choose the development setup:",
        choices=["Backend", "Frontend", "Both"]
    ).ask()


def setup_message(mode, sub=None):
    if mode == "Development":
        console.print(f"\n:hammer_and_wrench: [bold green]Development Setup: {sub}[/bold green]")
    else:
        console.print(f"\n:rocket: [bold green]Production Setup Selected[/bold green]")

    console.print("\n[bold magenta]⚙️  Setting up the environment...[/bold magenta]\n")

# ------------------ TOOLCHAIN CHECK ------------------

def check_command_exists(command):
    return shutil.which(command) is not None


def install_nodejs():
    system = platform.system()
    console.print("[yellow]Installing Node.js...[/yellow]")

    if system == "Windows":
        url = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
        installer = os.path.join(tempfile.gettempdir(), "node-installer.msi")
        urllib.request.urlretrieve(url, installer)
        subprocess.run(["msiexec", "/i", installer, "/quiet", "/norestart"], check=True)
    elif system == "Darwin":
        if not check_command_exists("brew"):
            console.print("[red]Install Homebrew to continue.[/red]")
            sys.exit(1)
        subprocess.run(["brew", "install", "node"], check=True)
    elif system == "Linux":
        if check_command_exists("apt"):
            subprocess.run(["sudo", "apt", "update"], check=True)
            subprocess.run(["sudo", "apt", "install", "-y", "nodejs", "npm"], check=True)
        else:
            console.print("[red]Unsupported Linux distribution.[/red]")
            sys.exit(1)
    else:
        console.print("[red]Unsupported OS.[/red]")
        sys.exit(1)


def install_pnpm():
    subprocess.run(["npm", "install", "-g", "pnpm"], check=True)


def ensure_node_tools():
    console.rule("[bold blue]Checking Prerequisites[/bold blue]")

    if not check_command_exists("node"):
        console.print(":warning: [yellow]Node.js not found.[/yellow]")
        install_nodejs()
    else:
        console.print(":white_check_mark: [green]Node.js is installed.[/green]")

    if not check_command_exists("npm"):
        console.print(":warning: [yellow]npm not found.[/yellow]")
        sys.exit(1)
    else:
        console.print(":white_check_mark: [green]npm is installed.[/green]")

    if not check_command_exists("pnpm"):
        console.print(":warning: [yellow]pnpm not found.[/yellow]")
        install_pnpm()
    else:
        console.print(":white_check_mark: [green]pnpm is installed.[/green]")

# ------------------ MongoDB Memory Server Support ------------------

def ensure_mongodb_binaries():
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
        subprocess.run(["node", "-e", script], check=True)
        console.print(":white_check_mark: [green]MongoDB binaries downloaded and ready.[/green]")
    except subprocess.CalledProcessError:
        console.print(":x: [red]Failed to download MongoDB binaries. Please check your internet or proxy settings.[/red]")
        sys.exit(1)

# ------------------ Utility ------------------

def add_or_update_env_variable(key, value, env_path=".env"):
    lines = []
    if os.path.exists(env_path):
        with open(env_path, "r") as f:
            lines = f.read().splitlines()

    existing = {line.split("=")[0]: line for line in lines if "=" in line}
    existing[key] = f'{key}="{value}"'

    with open(env_path, "w") as f:
        for line in existing.values():
            f.write(line + "\n")

    console.print(f":pencil: [blue]{key}[/blue] updated in {env_path}")

# ------------------ Backend Setup ------------------

def prompt_for_db_uri_if_needed():
    env_file = ".env"
    uri = ""
    if os.path.exists(env_file):
        with open(env_file, "r") as f:
            content = f.read()
            match = re.search(r'^DB_URL=(.*)', content, re.MULTILINE)
            if match:
                uri = match.group(1).strip()
    if not uri:
        console.print(Panel.fit("🌐 DB_URL is not set. Let's help you set it up!", style="bold yellow"))
        md = Markdown("""
### How to Get Your MongoDB Atlas URI:
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster.
3. Choose "Connect", then "Connect Your Application".
4. Copy the MongoDB URI string (e.g. `mongodb+srv://...`).
5. Paste it below.
""")
        console.print(md)
        uri = questionary.text("Paste your MongoDB URI").ask()
        add_or_update_env_variable("DB_URL", uri)

def validate_env_file(required_keys):
    if not os.path.exists(".env"):
        console.print(":x: [red].env not found for validation.[/red]")
        return
    with open(".env", "r") as f:
        lines = f.read().splitlines()
    keys_present = {line.split("=")[0] for line in lines if "=" in line}
    missing = [key for key in required_keys if key not in keys_present]
    if missing:
        console.print(f":x: [red]Missing keys in .env: {', '.join(missing)}[/red]")
    else:
        console.print(":white_check_mark: [green].env has all required keys.[/green]")

def rename_backend_files(is_dev=True):
    env_example = ".env.example"
    env_file = ".env"
    sentry_example = ".sentryclirc.example"
    sentry_file = ".sentryclirc"

    if os.path.exists(env_example):
        os.rename(env_example, env_file)
        console.print(":white_check_mark: [green].env.example → .env[/green]")

    if not is_dev and os.path.exists(sentry_example):
        os.rename(sentry_example, sentry_file)
        console.print(":white_check_mark: [green].sentryclirc.example → .sentryclirc[/green]")
    elif is_dev:
        console.print(":information_source: [blue].sentryclirc not needed in development.[/blue]")

    validate_env_file(["DB_URL"])

def run_backend_setup():
    backend_dir = os.path.join(os.getcwd(), "backend")
    os.chdir(backend_dir)

    rename_backend_files(is_dev=True)
    prompt_for_db_uri_if_needed()

    console.print("[cyan]Installing packages with pnpm...[/cyan]")
    subprocess.run(["pnpm", "install"])

    run_tests = questionary.confirm("Do you want to run tests?").ask()
    if run_tests:
        ensure_mongodb_binaries()
    tests_passed = False

    if run_tests:
        console.print("[bold]Running tests...[/bold]")
        result = subprocess.run(["pnpm", "run", "test:ci"])
        if result.returncode == 0:
            console.print(":white_check_mark: [green]All tests passed![/green]")
            tests_passed = True
        else:
            console.print(":x: [red]Tests failed. Please fix the issues before starting the server.[/red]")
    else:
        tests_passed = True

    if tests_passed:
        if questionary.confirm("Do you want to start the backend server now?").ask():
            subprocess.run(["pnpm", "run", "dev"])

# ------------------ Main ------------------

def main():
    show_welcome()
    ensure_node_tools()
    mode = get_main_choice()

    if mode == "Development":
        sub = get_dev_choice()
        setup_message(mode, sub)
        if sub in ["Backend", "Both"]:
            run_backend_setup()
        else:
            console.print("[yellow]Frontend setup is not implemented yet.[/yellow]")
    else:
        setup_message(mode)
        console.print(Panel.fit("[red]⚠ Production setup is not yet implemented.[/red]\nComing soon with a full CI/CD pipeline.", style="bold red"))

if __name__ == "__main__":
    main()
