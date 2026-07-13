import tkinter as tk
from tkinter import filedialog
import ctypes

def pick():
    try:
        # Make the dialog DPI aware to look modern on Windows
        ctypes.windll.shcore.SetProcessDpiAwareness(1)
    except Exception:
        pass
        
    root = tk.Tk()
    root.overrideredirect(True)
    root.attributes('-alpha', 0)
    root.attributes("-topmost", True)
    root.lift()
    root.focus_force()
    
    path = filedialog.askdirectory(parent=root, title="Select Download Directory")
    
    root.destroy()
    return path

if __name__ == '__main__':
    print(pick())
