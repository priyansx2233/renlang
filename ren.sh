#!/bin/bash
# ============================================================
#  Ren Language Launcher for Linux / macOS
#  Usage:
#    chmod +x ren.sh
#    ./ren.sh hello.ren
#  Or add to PATH:
#    sudo cp ren.sh /usr/local/bin/ren && sudo chmod +x /usr/local/bin/ren
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "$SCRIPT_DIR/main.py" "$@"
