# 🟦 Ren Programming Language

> **Simple enough for a 12-year-old. Powerful enough for professionals.**

Ren is a new programming language that combines the simplicity of Python with the structure of C.  
No curly braces. No semicolons. No confusing symbols. Just clean, readable code.

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [How to Run](#-how-to-run)
- [Your First Program](#-your-first-program)
- [Language Examples](#-language-examples)
- [Run Without Python (exe)](#-run-without-python-exe)
- [Project Structure](#-project-structure)

---

## ⚡ Quick Start

```bash
# 1. Make sure Python 3.8+ is installed
python --version

# 2. Run a Ren program
python main.py examples/hello.ren

# 3. Start the interactive REPL
python main.py
```

That's it. No installation. No packages. Just Python.

---

## 💻 Installation

### Requirements
- **Python 3.8 or newer** — [Download Python](https://www.python.org/downloads/)
- No other dependencies needed

### Step 1: Download Ren
Either:
- Download and unzip this folder anywhere on your computer
- Or clone: `git clone https://github.com/yourname/renlang`

### Step 2: Test it works
Open a terminal in the `renlang` folder and run:
```bash
python main.py examples/hello.ren
```

You should see:
```
Hello, World!
Welcome to the Ren programming language.
Made for beginners. Powerful for experts.
```

---

## 🚀 How to Run

### Option 1: Run a .ren file
```bash
python main.py myprogram.ren
```

### Option 2: Interactive REPL (type and run instantly)
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

### Option 3: Use the launcher (Windows)
Double-click `ren.bat` or type in terminal:
```bash
ren myprogram.ren
```

### Option 4: Debug tools
```bash
# See all tokens the lexer produces
python main.py --tokens myprogram.ren

# See the full AST (syntax tree)
python main.py --ast myprogram.ren

# Show version
python main.py --version
```

---

## 👋 Your First Program

Create a file called `hello.ren`:

```ren
print "Hello, World!"
```

Run it:
```bash
python main.py hello.ren
```

Done. That's the entire program — one line.

---

## 📚 Language Examples

### Variables
```ren
number age = 16
text name = "Alice"
bool isStudent = true
const PI = 3.14159

print name
print age
```

### Math
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

### Input from User
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
-- Count 1 to 5
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

-- Loop over a list
list fruits = ["apple", "banana", "cherry"]
for fruit in fruits
    print fruit
end
```

### Functions
```ren
function greet(name)
    print "Hello, " + name + "!"
end

greet("Alice")

function add(a, b)
    return a + b
end

print add(10, 20)
```

### Recursion
```ren
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

### Classes
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
cat.speak()

Dog rex = new Dog("Rex", "Woof")
rex.speak()
rex.fetch()
```

### Import Modules
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

## 📦 Run Without Python (exe)

To share Ren with someone who doesn't have Python:

```bash
# Install PyInstaller (one time)
pip install pyinstaller

# Build the exe
python build_exe.py
```

This creates `dist/ren.exe` — a **standalone executable**.  
Send `ren.exe` to anyone. They can run it without installing Python.

```bash
ren.exe hello.ren
```

---

## 📁 Project Structure

```
renlang/
├── main.py          ← Entry point (run this)
├── lexer.py         ← Stage 1: Source code → Tokens
├── ast_nodes.py     ← AST node definitions
├── parser.py        ← Stage 2: Tokens → Syntax Tree
├── interpreter.py   ← Stage 3: Execute the program
├── ren.bat          ← Windows launcher
├── ren.sh           ← Linux/macOS launcher
├── build_exe.py     ← Build standalone .exe
├── README.md        ← This file
└── examples/
    ├── hello.ren        ← Hello World
    ├── variables.ren    ← Variables & math
    ├── conditions.ren   ← If/else
    ├── loops.ren        ← All loop types
    ├── functions.ren    ← Functions & recursion
    └── advanced.ren     ← Classes, errors, modules
```

---

## 🔤 Syntax Summary

| Feature | Ren Syntax |
|---------|-----------|
| Print | `print "Hello"` |
| Variable | `number x = 5` |
| Constant | `const PI = 3.14` |
| If | `if x > 5 ... end` |
| Else | `else ... end` |
| For loop | `for i = 1 to 10 ... end` |
| For-in | `for item in list ... end` |
| While | `while x > 0 ... end` |
| Repeat | `repeat 5 ... end` |
| Function | `function add(a,b) ... end` |
| Return | `return value` |
| Class | `class Dog extends Animal ... end` |
| Try/Catch | `try ... catch err ... end` |
| Import | `import math` |
| Comment | `-- this is a comment` |

---

## 🛠️ Built With

- **Language**: Python 3
- **Architecture**: Tree-walking interpreter
- **Pipeline**: Lexer → Parser → AST → Interpreter

---

## 📄 License

Open Source — MIT License.  
Free to use, modify, and share.

---

*Ren v0.1.0 — The language that grows with you.*
