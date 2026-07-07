<div align="center">

# 🟦 Ren Programming Language

### *Simple enough for a 12-year-old. Powerful enough for professionals.*

[![Live Website](https://img.shields.io/badge/🌐%20Live%20Website-renlang.vercel.app-blue?style=for-the-badge)](https://renlang.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-priyansx2233%2Frenlang-181717?style=for-the-badge&logo=github)](https://github.com/priyansx2233/renlang)
[![Language](https://img.shields.io/badge/Built%20With-Python%203-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-v0.2.0--alpha-orange?style=for-the-badge)]()

```
  ██████╗ ███████╗███╗   ██╗
  ██╔══██╗██╔════╝████╗  ██║
  ██████╔╝█████╗  ██╔██╗ ██║
  ██╔══██╗██╔══╝  ██║╚██╗██║
  ██║  ██║███████╗██║ ╚████║
  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝
```

**Ren** is a fully custom, interpreted programming language built from scratch in Python.  
No libraries. No frameworks. Pure language engineering — Lexer, Parser, AST, and Interpreter all hand-written.

[🌐 Try it Live](https://renlang.vercel.app/) · [📖 Docs](#-language-examples) · [⚡ Quick Start](#-quick-start) · [🏗️ Architecture](#️-architecture--how-it-works)

</div>

---

## 🎯 Motive & Vision

> **Why build a programming language from scratch?**

Most beginners hit a wall when they first encounter code. Syntax errors, cryptic symbols, semicolons, curly braces — it's overwhelming before they've even *thought* about logic. Ren was born from a simple idea:

**What if learning to code felt as natural as writing in English?**

### The Goals Behind Ren

| Goal | How Ren Achieves It |
|------|---------------------|
| 🧒 **Beginner-Friendly** | No semicolons, no braces — just indentation and `end` keywords |
| 📖 **Readable Syntax** | `number age = 16` reads like plain English |
| 🔬 **Educational** | Built to teach *how* programming languages actually work |
| 🛠️ **Feature-Complete** | Functions, classes, recursion, error handling, modules |
| 🌐 **Accessible** | Interactive browser playground — no installation needed |
| 📦 **Zero Dependencies** | Runs on any machine with Python 3.8+ — nothing else |

This project is also a **deep dive into compiler theory** — understanding how a computer turns human-written text into executed instructions, one stage at a time.

---

## 🌐 Live Website

> **Try Ren right in your browser — no installation needed!**

### 🔗 [renlang.vercel.app](https://renlang.vercel.app/)

#### ✨ New in v0.2.0-alpha (The Ren IDE Update)
The website has been completely redesigned into a full-fledged IDE experience:
- 🔭 **Focus Mode**: Zen-like distraction-free coding layout.
- 🔍 **In-Editor Search**: Find and highlight text across your code (`Ctrl+F`).
- 🌙 **Dark/Light Mode**: Toggleable themes.
- 📄 **Examples Dropdown**: Instantly load 10+ example programs.
- 📚 **Embedded Docs & Shortcuts**: Overlays for language reference and hotkeys.
- 🌐 **Live Browser Panel**: Included iframe panel with functional navigation.
- ⌨️ **Keyboard Shortcuts**: `F5` to run, `Ctrl+F` to find, `Esc` to close modals.

*(Previous Version v0.1.0 included a basic CodeMirror editor and standard output panel).*

The entire browser runtime is compiled from the Python interpreter into a self-contained JavaScript engine (`ren_app.js`), giving users the authentic Ren experience without installing anything.

---

## ⚡ Quick Start

```bash
# 1. Make sure Python 3.8+ is installed
python --version

# 2. Clone the repo
git clone https://github.com/CodeAurelius0/renlang.git
cd renlang

# 3. Run a Ren program
python main.py examples/hello.ren

# 4. Start the interactive REPL
python main.py
```

That's it. **No pip install. No dependencies. Zero setup.**

---

## 💻 Installation

### Requirements
- **Python 3.8 or newer** — [Download Python](https://www.python.org/downloads/)
- No other dependencies needed

### Step 1: Clone or Download

```bash
git clone https://github.com/CodeAurelius0/renlang.git
```

Or download the ZIP from the [GitHub releases page](https://github.com/CodeAurelius0/renlang).

### Step 2: Verify it works

```bash
python main.py examples/hello.ren
```

Expected output:
```
Hello, World!
Welcome to the Ren programming language.
Made for beginners. Powerful for experts.
```

---

## 🚀 How to Run

### Option 1: Run a `.ren` file
```bash
python main.py myprogram.ren
```

### Option 2: Interactive REPL
```bash
python main.py
```
```
ren> print "Hello!"
Hello!
ren> number x = 5 + 3
ren> print x
8
ren> exit
```

### Option 3: Windows Launcher
```bash
ren myprogram.ren
```

### Option 4: Debug Tools
```bash
python main.py --tokens myprogram.ren   # Show all lexer tokens
python main.py --ast myprogram.ren      # Show the full AST
python main.py --version                # Show Ren version
```

---

## 👋 Your First Program

Create `hello.ren`:

```ren
print "Hello, World!"
```

Run it:
```bash
python main.py hello.ren
```

Done. One line. No boilerplate.

---

## 📚 Language Examples

### Variables
```ren
number age = 16
text name = "Alice"
bool isStudent = true
const PI = 3.14159

print name       -- Alice
print age        -- 16
```

### Math & Operators
```ren
number x = 10
number y = 3
print x + y    -- 13
print x - y    -- 7
print x * y    -- 30
print x / y    -- 3.333...
print x % y    -- 1  (remainder)
print x ^ 2    -- 100 (power)
```

### User Input
```ren
text name = input "What is your name? "
print "Hello, " + name + "!"
```

### Conditions
```ren
number score = 85

if score >= 90
    print "Grade: A"
elseif score >= 80
    print "Grade: B"
elseif score >= 70
    print "Grade: C"
else
    print "Grade: F"
end
```

### Loops
```ren
-- Counted for loop
for i = 1 to 5
    print i
end

-- While loop
number count = 0
while count < 3
    count = count + 1
    print count
end

-- Repeat N times
repeat 3
    print "Hello!"
end

-- For-in loop over a list
list fruits = ["apple", "banana", "cherry"]
for fruit in fruits
    print fruit
end
```

### Functions & Recursion
```ren
function greet(name)
    print "Hello, " + name + "!"
end

greet("Alice")

function factorial(n)
    if n <= 1
        return 1
    end
    return n * factorial(n - 1)
end

print factorial(10)   -- 3628800
```

### Error Handling
```ren
try
    raise "Something went wrong!"
catch err
    print "Caught: " + err
end
```

### Pattern Matching
```ren
number day = 3

match day
    case 1
        print "Monday"
    case 2
        print "Tuesday"
    case 3
        print "Wednesday"
    default
        print "Other day"
end
```

### Classes & Inheritance
```ren
class Animal
    function init(name, sound)
        self.name = name
        self.sound = sound
    end

    function speak()
        print self.name + " says " + self.sound
    end
end

class Dog extends Animal
    function fetch()
        print self.name + " fetches the ball!"
    end
end

Animal cat = new Animal("Cat", "Meow")
cat.speak()           -- Cat says Meow

Dog rex = new Dog("Rex", "Woof")
rex.speak()           -- Rex says Woof
rex.fetch()           -- Rex fetches the ball!
```

### Modules & Math
```ren
import math
print math.pi               -- 3.14159...

from math import sqrt
print sqrt(144)             -- 12.0
```

### Lists
```ren
list numbers = [5, 2, 8, 1, 9]
print len(numbers)
print sort(numbers)
append(numbers, 42)
print numbers
```

---

## 🔤 Syntax Summary

| Feature | Ren Syntax |
|---------|-----------|
| Print | `print "Hello"` |
| Number | `number x = 5` |
| Text | `text name = "Alice"` |
| Bool | `bool done = false` |
| Constant | `const PI = 3.14` |
| If | `if x > 5 ... end` |
| Else if | `elseif x > 3 ... end` |
| Else | `else ... end` |
| For loop | `for i = 1 to 10 ... end` |
| For-in | `for item in list ... end` |
| While | `while x > 0 ... end` |
| Repeat | `repeat 5 ... end` |
| Function | `function add(a, b) ... end` |
| Return | `return value` |
| Class | `class Dog extends Animal ... end` |
| New object | `Dog rex = new Dog("Rex", "Woof")` |
| Try/Catch | `try ... catch err ... end` |
| Match | `match x ... case 1 ... default ... end` |
| Import | `import math` |
| From import | `from math import sqrt` |
| Comment | `-- this is a comment` |
| Raise error | `raise "Error message"` |
| Input | `text x = input "Prompt: "` |

---

## 🏗️ Architecture — How It Works

Ren follows the **classic compiler pipeline**, implemented entirely from scratch:

```
Source Code (.ren)
        │
        ▼
  ┌─────────────┐
  │   LEXER     │  lexer.py      — Tokenizer: text → token stream
  │             │  327 lines     — Identifies keywords, numbers, strings, operators
  └──────┬──────┘
         │  Token[]
         ▼
  ┌─────────────┐
  │   PARSER    │  parser.py     — Syntactic analysis: tokens → AST
  │             │  700+ lines    — Recursive descent parser
  └──────┬──────┘
         │  AST (Abstract Syntax Tree)
         ▼
  ┌─────────────┐
  │  AST NODES  │  ast_nodes.py  — Node definitions for every language construct
  │             │  8874 bytes    — ~40 node types
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │ INTERPRETER │  interpreter.py — Tree-walking execution engine
  │             │  719 lines      — Evaluates AST nodes recursively
  └─────────────┘
         │
         ▼
   Program Output
```

### Stage 1 — Lexer (`lexer.py`)
- Reads raw `.ren` source character-by-character
- Emits a flat list of **Token** objects (type + value + line number)
- Handles: keywords, identifiers, strings, numbers, booleans, operators, comments (`--`)
- Token types: `KEYWORD`, `IDENTIFIER`, `NUMBER`, `STRING`, `BOOL`, `NEWLINE`, `EOF`, and 20+ operator types

### Stage 2 — Parser (`parser.py`)
- Implements a **Recursive Descent Parser** — one of the cleanest parsing techniques
- Consumes the token stream and builds an **Abstract Syntax Tree (AST)**
- Handles operator precedence, function calls, class definitions, all control flow
- Produces clean, structured parse errors with line numbers

### Stage 3 — AST Nodes (`ast_nodes.py`)
- Defines ~40 Python dataclasses representing every language construct
- Examples: `IfNode`, `FunctionDefNode`, `ClassDefNode`, `BinaryOpNode`, `CallNode`
- Each node carries exactly the data the interpreter needs — nothing more

### Stage 4 — Interpreter (`interpreter.py`)
- **Tree-walking interpreter** — traverses the AST and executes each node
- Manages **scoped environments** (symbol tables) for variable/function lookup
- Implements: first-class functions, closures, class instantiation, inheritance
- Built-in functions: `print`, `input`, `len`, `sort`, `append`, `type`, math operations
- Proper error propagation using Python exceptions as control signals

### The Website Runtime
- The Python interpreter is **transpiled/ported to JavaScript** in `ren_app.js`
- This 86 KB file is a full Ren runtime running entirely in the browser
- Built using: HTML5, Vanilla CSS, Vanilla JavaScript — **no frameworks**

---

## 🛠️ Skills & Technologies Used

### Language & Compiler Theory
| Skill | Details |
|-------|---------|
| **Lexical Analysis** | Hand-written tokenizer, character-by-character processing |
| **Recursive Descent Parsing** | Top-down parser, grammar-driven, handles operator precedence |
| **Abstract Syntax Trees** | Designed and implemented ~40 AST node types |
| **Tree-Walking Interpretation** | Direct AST execution without bytecode or machine code |
| **Scope & Environment Design** | Lexical scoping, nested environments, variable shadowing |
| **OOP in an Interpreter** | `self`, inheritance (`extends`), method dispatch |
| **Error Handling Design** | Custom exception classes, line-aware error messages |

### Python Engineering
| Skill | Details |
|-------|---------|
| **Python 3** | Core language, zero external dependencies |
| **OOP Design Patterns** | Visitor-like dispatch, class hierarchies for AST nodes |
| **Exception-as-Control-Flow** | `ReturnSignal`, `BreakSignal`, `ContinueSignal` for clean unwinding |
| **PyInstaller** | Packages the interpreter into a standalone `.exe` |

### Web Development
| Skill | Details |
|-------|---------|
| **HTML5** | Semantic structure, accessibility |
| **Vanilla CSS** | Glassmorphism, dark theme, responsive layout, animations |
| **Vanilla JavaScript** | Full Ren runtime ported to JS, DOM manipulation, event handling |
| **GitHub Pages** | Static site hosting via `gh-pages` branch |

### DevOps & Tooling
| Skill | Details |
|-------|---------|
| **Git** | Version control, branching strategy (`main` + `gh-pages`) |
| **GitHub API** | Automated repo creation via REST API |
| **GitHub Pages** | Continuous deployment from `gh-pages` branch |
| **Cross-platform scripts** | `ren.bat` (Windows), `ren.sh` (Linux/macOS) |

---

## 📁 Project Structure

```
renlang/
├── main.py              ← Entry point: REPL + file runner + debug tools
├── lexer.py             ← Stage 1: Source code → Token stream (327 lines)
├── ast_nodes.py         ← AST node class definitions (~40 node types)
├── parser.py            ← Stage 2: Token stream → AST (700+ lines)
├── interpreter.py       ← Stage 3: AST → Execution (719 lines)
├── build_exe.py         ← Builds standalone ren.exe via PyInstaller
├── ren.bat              ← Windows shell launcher
├── ren.sh               ← Linux/macOS shell launcher
├── README.md            ← This file
├── examples/
│   ├── hello.ren        ← Hello World
│   ├── variables.ren    ← Variables & math
│   ├── conditions.ren   ← If/elseif/else
│   ├── loops.ren        ← For, while, repeat, for-in
│   ├── functions.ren    ← Functions & recursion
│   └── advanced.ren     ← Classes, error handling, modules
└── website/
    ├── index.html       ← Interactive playground (single-page app)
    ├── style.css        ← Dark theme UI with glassmorphism
    ├── ren_app.js       ← Full Ren runtime in JavaScript (86 KB)
    └── write_html.py    ← Generator script for the HTML page
```

---

## 📦 Build Standalone Executable

Share Ren with anyone — even if they don't have Python:

```bash
# Install PyInstaller (one-time)
pip install pyinstaller

# Build the executable
python build_exe.py
```

This creates `dist/ren.exe` — a **self-contained Windows executable**.  
Send it to anyone. Run it anywhere.

```bash
ren.exe hello.ren
```

---

## 🗺️ Roadmap

- [x] Core language (variables, functions, loops, conditions)
- [x] OOP support (classes, inheritance, `self`)
- [x] Error handling (`try`/`catch`/`raise`)
- [x] Pattern matching (`match`/`case`)
- [x] Module system (`import`, `from ... import`)
- [x] Interactive REPL
- [x] Browser-based playground
- [x] Standalone `.exe` build
- [ ] Standard library expansion
- [ ] Dictionaries / maps
- [ ] File I/O (`open`, `read`, `write`)
- [ ] List comprehensions
- [ ] Ren-to-bytecode compiler
- [ ] Package manager (`ren install`)

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source under the **MIT License** — free to use, modify, and distribute.

---

## 👤 Author

**CodeAurelius0**  
GitHub: [@CodeAurelius0](https://github.com/CodeAurelius0)  
Email: codeaurelius0@gmail.com

---

<div align="center">

*Ren v0.2.0-alpha — The language that grows with you.*

⭐ **If you find this project interesting, give it a star!** ⭐

[![Live Demo](https://img.shields.io/badge/🚀%20Try%20Ren%20Now-Live%20Demo-brightgreen?style=for-the-badge)](https://renlang.vercel.app/)

</div>
