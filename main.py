#!/usr/bin/env python3
# ============================================================
#  Ren Language — Main Entry Point
#  Usage:
#    python main.py hello.ren        → run a .ren file
#    python main.py                  → start the REPL
#    python main.py --tokens file.ren → show tokens (debug)
#    python main.py --ast file.ren   → show AST (debug)
# ============================================================

import sys
import os

from lexer       import Lexer, LexerError
from parser      import Parser, ParseError
from interpreter import Interpreter, RenRuntimeError


# ------------------------------------------------------------------
# BANNER
# ------------------------------------------------------------------
BANNER = r"""
  ██████╗ ███████╗███╗   ██╗
  ██╔══██╗██╔════╝████╗  ██║
  ██████╔╝█████╗  ██╔██╗ ██║
  ██╔══██╗██╔══╝  ██║╚██╗██║
  ██║  ██║███████╗██║ ╚████║
  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝

  The Ren Programming Language  v0.1.0
  Type 'exit' or 'quit' to leave.
  Type 'help' for a quick guide.
"""

HELP_TEXT = """
  Quick Guide to Ren
  ──────────────────
  print "Hello"           → output text
  number x = 10           → declare a number
  text name = "Alice"     → declare a string
  bool done = false        → declare a boolean
  const PI = 3.14          → declare a constant

  if x > 5
      print "Big"
  end

  for i = 1 to 5
      print i
  end

  function add(a, b)
      return a + b
  end
  print add(3, 4)

  Type any expression to evaluate it instantly.
"""


# ------------------------------------------------------------------
# PIPELINE  (lex → parse → interpret)
# ------------------------------------------------------------------

def run_source(source: str, interpreter: Interpreter, filename='<stdin>'):
    """
    Full pipeline: source string → executed result.
    Returns True on success, False on error.
    """
    try:
        tokens = Lexer(source).tokenize()
        ast    = Parser(tokens).parse()
        interpreter.run(ast)
        return True

    except LexerError as e:
        print(e)
    except ParseError as e:
        print(e)
    except RenRuntimeError as e:
        print(e)
    except KeyboardInterrupt:
        print("\n  (interrupted)")
    return False


# ------------------------------------------------------------------
# DEBUG: show tokens
# ------------------------------------------------------------------

def show_tokens(source: str):
    try:
        tokens = Lexer(source).tokenize()
        print(f"\n  {'TYPE':<15} {'VALUE':<25} LINE")
        print('  ' + '-' * 45)
        for tok in tokens:
            print(f"  {tok.type:<15} {repr(tok.value):<25} {tok.line}")
    except LexerError as e:
        print(e)


# ------------------------------------------------------------------
# DEBUG: show AST
# ------------------------------------------------------------------

def show_ast(source: str):
    try:
        tokens = Lexer(source).tokenize()
        ast    = Parser(tokens).parse()
        _print_ast(ast, indent=0)
    except (LexerError, ParseError) as e:
        print(e)


def _print_ast(node, indent):
    prefix = '  ' * indent
    name   = type(node).__name__
    # Print simple attributes on the same line
    attrs = {k: v for k, v in vars(node).items()
             if not isinstance(v, (list, object.__class__))
             or isinstance(v, (str, int, float, bool, type(None)))}
    simple = ', '.join(f"{k}={repr(v)}" for k, v in attrs.items()
                       if not hasattr(v, '__dict__'))
    print(f"{prefix}{name}({simple})")
    for k, v in vars(node).items():
        if hasattr(v, '__dict__'):
            _print_ast(v, indent + 1)
        elif isinstance(v, list):
            for item in v:
                if hasattr(item, '__dict__'):
                    _print_ast(item, indent + 1)
                elif isinstance(item, tuple):
                    for sub in item:
                        if hasattr(sub, '__dict__'):
                            _print_ast(sub, indent + 1)


# ------------------------------------------------------------------
# REPL
# ------------------------------------------------------------------

def run_repl():
    print(BANNER)
    interpreter = Interpreter()
    history = []

    while True:
        try:
            line = input('ren> ').strip()
        except (EOFError, KeyboardInterrupt):
            print('\n  Goodbye!')
            break

        if not line:
            continue

        if line in ('exit', 'quit'):
            print('  Goodbye!')
            break

        if line == 'help':
            print(HELP_TEXT)
            continue

        if line == 'clear':
            os.system('cls' if os.name == 'nt' else 'clear')
            continue

        if line == 'history':
            for i, h in enumerate(history, 1):
                print(f"  {i}: {h}")
            continue

        history.append(line)

        # Multi-line input: if line ends in a block opener, collect more
        full = line
        block_openers = ('main', 'if', 'else', 'elseif', 'while',
                         'for', 'repeat', 'function', 'try', 'class', 'match')
        
        needs_more = any(full.strip().startswith(kw) for kw in block_openers)
        while needs_more:
            try:
                continuation = input('... ').rstrip()
            except (EOFError, KeyboardInterrupt):
                break
            full += '\n' + continuation
            if continuation.strip() == 'end':
                needs_more = False

        run_source(full, interpreter, '<repl>')


# ------------------------------------------------------------------
# FILE RUNNER
# ------------------------------------------------------------------

def run_file(path: str):
    if not os.path.exists(path):
        print(f"\n  ERROR: File not found: '{path}'")
        sys.exit(1)

    if not path.endswith('.ren'):
        print(f"\n  WARNING: '{path}' does not have a .ren extension.")

    with open(path, 'r', encoding='utf-8') as f:
        source = f.read()

    interpreter = Interpreter()
    ok = run_source(source, interpreter, path)
    if not ok:
        sys.exit(1)


# ------------------------------------------------------------------
# ENTRY POINT
# ------------------------------------------------------------------

def main():
    args = sys.argv[1:]

    # No arguments → REPL
    if not args:
        run_repl()
        return

    # Debug flags
    if args[0] == '--tokens' and len(args) >= 2:
        source = open(args[1], 'r', encoding='utf-8').read()
        show_tokens(source)
        return

    if args[0] == '--ast' and len(args) >= 2:
        source = open(args[1], 'r', encoding='utf-8').read()
        show_ast(source)
        return

    if args[0] == '--version':
        print('Ren v0.1.0')
        return

    if args[0] == '--help':
        print(HELP_TEXT)
        return

    # Run a .ren file
    run_file(args[0])


if __name__ == '__main__':
    main()
