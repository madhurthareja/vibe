#!/usr/bin/env python3
import sys
import subprocess

# ---------------------------------------------
# Attempt to install missing packages
# ---------------------------------------------
def install_package(package):
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    except subprocess.CalledProcessError:
        print(f"❌ Failed to install {package}. Please install manually.")
        sys.exit(1)

# Check and install required packages
try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.text import Text
    from rich.align import Align
    from rich import box
except ImportError:
    print("'rich' not found. Installing...")
    install_package("rich")
    from rich.console import Console
    from rich.panel import Panel
    from rich.text import Text
    from rich.align import Align
    from rich import box

try:
    import questionary
except ImportError:
    print("'questionary' not found. Installing...")
    install_package("questionary")
    import questionary

# ---------------------------------------------
# Setup UI
# ---------------------------------------------
console = Console()


def show_welcome():
    console.clear()
    title = Text("🚀 ViBe Setup Wizard 🚀", style="bold white on blue", justify="center")
    console.print(Align.center(title))

    welcome_text = (
        "[green]ViBe[/green] is an [bold]innovative educational platform[/bold] that enhances learning "
        "through continuous assessment and interactive challenges.\n\n"
        "👋 Use [bold]arrow keys[/bold] and [bold]Enter[/bold] to make selections below."
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
        console.print(f"\n:hammer_and_wrench: [bold green]You selected Development Setup: {sub}[/bold green]")
    else:
        console.print(f"\n:rocket: [bold green]You selected Production Setup[/bold green]")

    console.print("\n[bold magenta]⚙️  Setup process starting... Please wait...[/bold magenta]\n")


def main():
    show_welcome()
    mode = get_main_choice()

    if mode == "Development":
        sub = get_dev_choice()
        setup_message(mode, sub)
        # Insert development setup logic here
    else:
        setup_message(mode)
        # Insert production setup logic here


if __name__ == "__main__":
    main()
