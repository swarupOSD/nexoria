import sys
import time
import os
import random

# Enable ANSI escape codes and UTF-8 in Windows CMD/PowerShell
if os.name == 'nt':
    os.system('')
    os.system('chcp 65001 >nul 2>&1')

# Windows emoji support
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding='utf-8')

# ANSI Color Codes
class Colors:
    CYAN = '\033[96m'
    PURPLE = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    RESET = '\033[0m'
    
    # Custom 256 colors for gradient effect
    PINK = '\033[38;5;213m'
    ORANGE = '\033[38;5;208m'
    LIGHT_CYAN = '\033[38;5;123m'

def clear():
    os.system('cls' if os.name == 'nt' else 'clear')

def type_text(text, color, min_delay=0.03, max_delay=0.1):
    """Types out text character by character with random human-like delays."""
    sys.stdout.write(f"{Colors.BOLD}{color}")
    for char in text:
        sys.stdout.write(char)
        sys.stdout.flush()
        # Randomize typing speed slightly
        time.sleep(random.uniform(min_delay, max_delay))
    sys.stdout.write(f"{Colors.RESET}")

def loading_animation():
    """Shows a professional loading spinner."""
    spinner = ['|', '/', '-', '\\']
    sys.stdout.write(f"{Colors.DIM}Initializing Audio Engine... {Colors.RESET}")
    for i in range(20):
        sys.stdout.write(f"\r{Colors.CYAN}{spinner[i % len(spinner)]}{Colors.RESET} {Colors.DIM}Loading tracks...{Colors.RESET}")
        sys.stdout.flush()
        time.sleep(0.1)
    print(f"\r{Colors.GREEN}✔ Ready to Play!{Colors.RESET}                  \n")
    time.sleep(0.5)

def print_music_player():
    """Prints a styled music player UI."""
    print(f"{Colors.PINK}╭────────────────────────────────────────────────────────╮{Colors.RESET}")
    print(f"{Colors.PINK}│{Colors.RESET}  {Colors.BOLD}{Colors.WHITE}▶ NOW PLAYING{Colors.RESET}                                       {Colors.PINK}│{Colors.RESET}")
    print(f"{Colors.PINK}│{Colors.RESET}  {Colors.ORANGE}Barbaad{Colors.RESET} - {Colors.DIM}Jubin Nautiyal{Colors.RESET}                           {Colors.PINK}│{Colors.RESET}")
    print(f"{Colors.PINK}│{Colors.RESET}  {Colors.CYAN}0:45 ━━━━━━●───────────── 3:20{Colors.RESET}                     {Colors.PINK}│{Colors.RESET}")
    print(f"{Colors.PINK}│{Colors.RESET}  {Colors.WHITE}  ⇆      ◁      ❚❚      ▷      ↻{Colors.RESET}                   {Colors.PINK}│{Colors.RESET}")
    print(f"{Colors.PINK}╰────────────────────────────────────────────────────────╯{Colors.RESET}\n")

def play_lyrics():
    clear()
    loading_animation()
    clear()
    
    print_music_player()
    time.sleep(1)

    # Lyrics Data: (Text, Color, Delay between chars, Pause after line)
    lyrics = [
        ("Tujhe chhoo loon toh kuch mujhe ho jaayega...", Colors.LIGHT_CYAN, 0.06, 1.2),
        ("Jo main chahta na ho mujhko...", Colors.CYAN, 0.07, 1.5),
        ("Tujhe mil ke yeh dil mera beh jaayega...", Colors.PURPLE, 0.06, 1.3),
        ("Issi baat ka darr hai mujhko...", Colors.PINK, 0.08, 1.8),
        ("", Colors.RESET, 0, 0.5), # Brief pause before chorus
        ("Ke ho na jaaye pyaar tumse mujhe...", Colors.ORANGE, 0.05, 1.0),
        ("Kar dega barbaad ishq mujhe...", Colors.RED, 0.07, 1.5),
        ("Ho na jaaye pyaar tumse mujhe...", Colors.YELLOW, 0.05, 1.0),
        ("Behadd beshumaar tumse, tumse... 💔", Colors.WHITE, 0.09, 2.0)
    ]

    for line, color, speed, end_pause in lyrics:
        if line == "":
            print()
            time.sleep(end_pause)
        else:
            type_text(line + "\n\n", color, min_delay=speed-0.02, max_delay=speed+0.02)
            time.sleep(end_pause)

    print(f"{Colors.DIM}────────────────────────────────────────────────────────{Colors.RESET}")
    type_text("Thanks for listening! ❤️\n", Colors.PINK, 0.05, 0.08)

if __name__ == "__main__":
    try:
        play_lyrics()
    except KeyboardInterrupt:
        print(f"\n{Colors.RED}Playback Stopped.{Colors.RESET}")
    
    # Keep the window open if double-clicked
    print("\n")
    input("Press Enter to exit...")
