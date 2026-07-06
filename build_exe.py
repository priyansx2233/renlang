# ============================================================
#  build_exe.py — Package Ren into a standalone .exe
#  Uses PyInstaller (no Python needed to run the output)
#
#  Run this once:
#    pip install pyinstaller
#    python build_exe.py
#
#  Output: dist/ren.exe
# ============================================================

import subprocess
import sys
import os

print("Building Ren compiler into a standalone .exe ...")
print("This may take 1-2 minutes.\n")

result = subprocess.run([
    sys.executable, "-m", "PyInstaller",
    "--onefile",              # single .exe file
    "--name", "ren",          # output filename: ren.exe
    "--console",              # keep the terminal window
    "main.py"
])

if result.returncode == 0:
    print("\n" + "="*50)
    print("  SUCCESS!")
    print("  Your standalone ren.exe is in:  dist/ren.exe")
    print("  Share that .exe with anyone — no Python needed!")
    print("="*50)
else:
    print("\nBuild failed. Make sure PyInstaller is installed:")
    print("  pip install pyinstaller")
