# ============================================================
#  Ren Language — Interpreter
#  Stage 3 (for the tree-walking interpreter phase).
#
#  Walks the AST produced by the Parser and executes every
#  node directly — no machine code generation needed yet.
#  This lets us run .ren programs immediately.
# ============================================================

import math
import time
import os
import sys

from ast_nodes import *


# ------------------------------------------------------------------
# REN RUNTIME ERROR  — shown to the user when a program crashes
# ------------------------------------------------------------------
class RenRuntimeError(Exception):
    def __init__(self, message, line=None):
        self.message = message
        self.line    = line

    def __str__(self):
        location = f"line {self.line}" if self.line else "unknown line"
        border = '=' * 50
        return (
            f"\n{border}\n"
            f"  RUNTIME ERROR  ({location})\n"
            f"  {self.message}\n"
            f"{border}"
        )


# ------------------------------------------------------------------
# RETURN / BREAK / CONTINUE signals
# Used to unwind the call stack cleanly.
# ------------------------------------------------------------------
class ReturnSignal(Exception):
    def __init__(self, value): self.value = value

class BreakSignal(Exception): pass
class ContinueSignal(Exception): pass


# ------------------------------------------------------------------
# ENVIRONMENT (Scope / Symbol Table)
# Stores variables for one scope level.
# Outer scopes are chained via the 'parent' pointer.
# ------------------------------------------------------------------
class Environment:
    def __init__(self, parent=None):
        self.vars   = {}          # name → value
        self.consts = set()       # names that cannot be reassigned
        self.parent = parent

    def get(self, name, line=None):
        if name in self.vars:
            return self.vars[name]
        if self.parent:
            return self.parent.get(name, line)
        raise RenRuntimeError(
            f"Variable '{name}' does not exist.\n"
            f"  Did you declare it with 'number', 'text', or 'bool'?",
            line
        )

    def set(self, name, value, line=None):
        """Assign to an existing variable (searches up the chain)."""
        if name in self.vars:
            if name in self.consts:
                raise RenRuntimeError(
                    f"Cannot change '{name}' — it is a constant.\n"
                    f"  Constants are declared with 'const'.",
                    line
                )
            self.vars[name] = value
            return
        if self.parent:
            self.parent.set(name, value, line)
            return
        raise RenRuntimeError(
            f"Variable '{name}' has not been declared.\n"
            f"  Declare it first:  number {name} = ...",
            line
        )

    def define(self, name, value, is_const=False):
        """Create a new variable in the current scope."""
        self.vars[name] = value
        if is_const:
            self.consts.add(name)

    def set_or_define(self, name, value):
        """Used for loop variables — define or overwrite locally."""
        self.vars[name] = value


# ------------------------------------------------------------------
# REN FUNCTION OBJECT
# ------------------------------------------------------------------
class RenFunction:
    def __init__(self, name, params, body, closure_env, is_async=False):
        self.name        = name
        self.params      = params        # [(name, type_hint), ...]
        self.body        = body          # Block node
        self.closure_env = closure_env  # captured environment
        self.is_async    = is_async

    def __repr__(self):
        return f"<function {self.name}>"


# ------------------------------------------------------------------
# REN CLASS & INSTANCE
# ------------------------------------------------------------------
class RenClass:
    def __init__(self, name, parent_class, methods):
        self.name         = name
        self.parent_class = parent_class
        self.methods      = methods   # dict: name → RenFunction

    def __repr__(self):
        return f"<class {self.name}>"

class RenInstance:
    def __init__(self, klass):
        self.klass      = klass
        self.attributes = {}

    def get_attr(self, name, line=None):
        if name in self.attributes:
            return self.attributes[name]
        # Check methods
        method = self._find_method(name)
        if method is not None:
            return method
        raise RenRuntimeError(
            f"'{self.klass.name}' has no attribute '{name}'.", line)

    def _find_method(self, name):
        klass = self.klass
        while klass:
            if name in klass.methods:
                return klass.methods[name]
            klass = klass.parent_class
        return None

    def __repr__(self):
        return f"<{self.klass.name} object>"


# ------------------------------------------------------------------
# STANDARD LIBRARY  (built-in functions available in every program)
# ------------------------------------------------------------------
def _make_stdlib():
    """Returns a dict of built-in function names → Python callables."""
    return {
        # Math
        'sqrt':  lambda args: math.sqrt(args[0]),
        'abs':   lambda args: abs(args[0]),
        'floor': lambda args: math.floor(args[0]),
        'ceil':  lambda args: math.ceil(args[0]),
        'round': lambda args: round(args[0], int(args[1]) if len(args) > 1 else 0),
        'pow':   lambda args: math.pow(args[0], args[1]),
        'log':   lambda args: math.log(args[0]) if len(args) == 1 else math.log(args[0], args[1]),
        'sin':   lambda args: math.sin(args[0]),
        'cos':   lambda args: math.cos(args[0]),
        'tan':   lambda args: math.tan(args[0]),
        'pi':    lambda args: math.pi,
        'random': lambda args: __import__('random').random(),
        'randint': lambda args: __import__('random').randint(int(args[0]), int(args[1])),

        # Type conversion
        'toNumber': lambda args: float(args[0]) if '.' in str(args[0]) else int(args[0]),
        'toText':   lambda args: ren_str(args[0]),
        'toBool':   lambda args: bool(args[0]),
        'toInt':    lambda args: int(args[0]),
        'toFloat':  lambda args: float(args[0]),

        # Type checking
        'isNumber': lambda args: isinstance(args[0], (int, float)),
        'isText':   lambda args: isinstance(args[0], str),
        'isBool':   lambda args: isinstance(args[0], bool),
        'isList':   lambda args: isinstance(args[0], list),
        'isNull':   lambda args: args[0] is None,

        # String functions
        'len':       lambda args: len(args[0]),
        'upper':     lambda args: args[0].upper(),
        'lower':     lambda args: args[0].lower(),
        'trim':      lambda args: args[0].strip(),
        'split':     lambda args: args[0].split(args[1]) if len(args) > 1 else args[0].split(),
        'join':      lambda args: args[1].join(str(x) for x in args[0]),
        'contains':  lambda args: args[1] in args[0],
        'startsWith': lambda args: args[0].startswith(args[1]),
        'endsWith':   lambda args: args[0].endswith(args[1]),
        'replace':   lambda args: args[0].replace(args[1], args[2]),
        'charAt':    lambda args: args[0][int(args[1])],
        'indexOf':   lambda args: args[0].index(args[1]) if args[1] in args[0] else -1,
        'substring': lambda args: args[0][int(args[1]):int(args[2])],
        'format':    lambda args: args[0].format(*args[1:]),

        # List functions
        'append':  lambda args: args[0].append(args[1]) or args[0],
        'remove':  lambda args: args[0].remove(args[1]) or args[0],
        'pop':     lambda args: args[0].pop() if len(args) == 1 else args[0].pop(int(args[1])),
        'insert':  lambda args: args[0].insert(int(args[1]), args[2]) or args[0],
        'sort':    lambda args: sorted(args[0]),
        'reverse': lambda args: list(reversed(args[0])),
        'first':   lambda args: args[0][0],
        'last':    lambda args: args[0][-1],
        'range':   lambda args: list(range(int(args[0]))) if len(args) == 1
                               else list(range(int(args[0]), int(args[1]))) if len(args) == 2
                               else list(range(int(args[0]), int(args[1]), int(args[2]))),

        # I/O
        'readFile':  lambda args: open(args[0], 'r').read(),
        'writeFile': lambda args: open(args[0], 'w').write(args[1]) and None,
        'fileExists': lambda args: os.path.exists(args[0]),

        # Time
        'now':   lambda args: time.time(),
        'sleep': lambda args: time.sleep(args[0]),

        # System
        'exit': lambda args: sys.exit(int(args[0]) if args else 0),
        'args': lambda _: sys.argv[1:],
        'env':  lambda args: os.environ.get(args[0], ''),
    }


def ren_str(value):
    """Convert a Ren value to its string representation."""
    if value is None:
        return 'null'
    if value is True:
        return 'true'
    if value is False:
        return 'false'
    if isinstance(value, float) and value == int(value):
        return str(int(value))
    if isinstance(value, list):
        return '[' + ', '.join(ren_str(v) for v in value) + ']'
    if isinstance(value, dict):
        pairs = ', '.join(f'{ren_str(k)}: {ren_str(v)}' for k, v in value.items())
        return '{' + pairs + '}'
    if isinstance(value, set):
        return '{' + ', '.join(ren_str(v) for v in sorted(value, key=str)) + '}'
    return str(value)


# ------------------------------------------------------------------
# INTERPRETER
# ------------------------------------------------------------------
class Interpreter:
    def __init__(self):
        # Global scope with all stdlib functions
        self.global_env = Environment()
        stdlib = _make_stdlib()
        for name, fn in stdlib.items():
            self.global_env.define(name, fn)

    # ── run a full program ────────────────────────────────────────

    def run(self, program: Program):
        self.execute_block(program.statements, self.global_env)

    # ── execute a list of statements ─────────────────────────────

    def execute_block(self, statements, env):
        for stmt in statements:
            self.execute(stmt, env)

    # ── execute one statement ─────────────────────────────────────

    def execute(self, node, env):
        t = type(node)

        if t == PrintStatement:
            value = self.evaluate(node.expr, env)
            end = '\n' if node.newline else ''
            print(ren_str(value), end=end)

        elif t == VarDeclaration:
            value = self.evaluate(node.value, env) if node.value else None
            env.define(node.name, value, is_const=node.is_const)

        elif t == Assignment:
            value = self.evaluate(node.value, env)
            if isinstance(node.target, Identifier):
                env.set(node.target.name, value, node.line)
            elif isinstance(node.target, IndexAccess):
                obj   = self.evaluate(node.target.obj, env)
                index = self.evaluate(node.target.index, env)
                obj[index] = value
            elif isinstance(node.target, MemberAccess):
                obj = self.evaluate(node.target.obj, env)
                if isinstance(obj, RenInstance):
                    obj.attributes[node.target.member] = value
                else:
                    raise RenRuntimeError(
                        f"Cannot set member on non-object.", node.line)

        elif t == Block:
            self.execute_block(node.statements, env)

        elif t == IfStatement:
            if self.evaluate(node.condition, env):
                self.execute(node.then_block, env)
            else:
                done = False
                for ei_cond, ei_body in node.elseifs:
                    if self.evaluate(ei_cond, env):
                        self.execute(ei_body, env)
                        done = True
                        break
                if not done and node.else_block:
                    self.execute(node.else_block, env)

        elif t == WhileLoop:
            while self.evaluate(node.condition, env):
                try:
                    inner = Environment(env)
                    self.execute(node.body, inner)
                except BreakSignal:
                    break
                except ContinueSignal:
                    continue

        elif t == ForLoop:
            if node.iterable is not None:
                # for item in collection
                collection = self.evaluate(node.iterable, env)
                for item in collection:
                    inner = Environment(env)
                    inner.set_or_define(node.var, item)
                    try:
                        self.execute(node.body, inner)
                    except BreakSignal:
                        break
                    except ContinueSignal:
                        continue
            else:
                # for i = start to end step s
                start = self.evaluate(node.start, env)
                end   = self.evaluate(node.end_expr, env)
                step  = self.evaluate(node.step, env) if node.step else 1
                i = start
                while (i <= end if step > 0 else i >= end):
                    inner = Environment(env)
                    inner.set_or_define(node.var, i)
                    try:
                        self.execute(node.body, inner)
                    except BreakSignal:
                        break
                    except ContinueSignal:
                        i += step
                        continue
                    i += step

        elif t == RepeatLoop:
            count = int(self.evaluate(node.count, env))
            for _ in range(count):
                inner = Environment(env)
                try:
                    self.execute(node.body, inner)
                except BreakSignal:
                    break
                except ContinueSignal:
                    continue

        elif t == BreakStatement:
            raise BreakSignal()

        elif t == ContinueStatement:
            raise ContinueSignal()

        elif t == FunctionDecl:
            fn = RenFunction(node.name, node.params, node.body, env, node.is_async)
            env.define(node.name, fn)

        elif t == ReturnStatement:
            value = self.evaluate(node.value, env) if node.value else None
            raise ReturnSignal(value)

        elif t == TryCatch:
            try:
                inner = Environment(env)
                self.execute(node.try_block, inner)
            except RenRuntimeError as e:
                catch_env = Environment(env)
                if node.error_var:
                    catch_env.define(node.error_var, e.message)
                self.execute(node.catch_block, catch_env)
            finally:
                if node.finally_block:
                    self.execute(node.finally_block, Environment(env))

        elif t == RaiseStatement:
            msg = ren_str(self.evaluate(node.expr, env))
            raise RenRuntimeError(msg, node.line)

        elif t == ImportStatement:
            self._handle_import(node, env)

        elif t == MatchStatement:
            subject = self.evaluate(node.subject, env)
            matched = False
            for case_val, case_body in node.cases:
                cv = self.evaluate(case_val, env)
                if subject == cv:
                    self.execute(case_body, Environment(env))
                    matched = True
                    break
            if not matched and node.default_block:
                self.execute(node.default_block, Environment(env))

        elif t == ClassDecl:
            parent_class = None
            if node.parent:
                parent_class = env.get(node.parent, node.line)
            methods = {}
            temp_env = Environment(env)
            for method_node in node.methods:
                fn = RenFunction(method_node.name, method_node.params,
                                 method_node.body, temp_env, method_node.is_async)
                methods[method_node.name] = fn
            klass = RenClass(node.name, parent_class, methods)
            env.define(node.name, klass)

        else:
            # Treat as expression statement (e.g., standalone function call)
            self.evaluate(node, env)

    # ── evaluate an expression ────────────────────────────────────

    def evaluate(self, node, env):
        t = type(node)

        if t == NumberLiteral: return node.value
        if t == StringLiteral: return node.value
        if t == BoolLiteral:   return node.value
        if t == NullLiteral:   return None

        if t == Identifier:
            return env.get(node.name, node.line)

        if t == ListLiteral:
            return [self.evaluate(e, env) for e in node.elements]

        if t == DictLiteral:
            return {self.evaluate(k, env): self.evaluate(v, env)
                    for k, v in node.pairs}

        if t == BinaryOp:
            return self._binary(node, env)

        if t == UnaryOp:
            operand = self.evaluate(node.operand, env)
            if node.op == '-':
                return -operand
            if node.op == 'not':
                return not operand

        if t == IndexAccess:
            obj   = self.evaluate(node.obj, env)
            index = self.evaluate(node.index, env)
            try:
                return obj[index]
            except (IndexError, KeyError):
                raise RenRuntimeError(
                    f"Index {ren_str(index)} is out of range.", node.line)

        if t == MemberAccess:
            obj = self.evaluate(node.obj, env)
            name = node.member
            # String methods
            if isinstance(obj, str):
                return self._str_method(obj, name, node.line)
            # List methods
            if isinstance(obj, list):
                return self._list_method(obj, name, node.line)
            # Dict: check if it's a module (has the name as a direct key)
            # or a user dict (use dict methods)
            if isinstance(obj, dict):
                if name in obj:
                    return obj[name]   # module attribute or dict value
                # Fall back to dict container methods
                return self._dict_method(obj, name, node.line)
            # Object instance
            if isinstance(obj, RenInstance):
                attr = obj.get_attr(name, node.line)
                # Bind self
                if isinstance(attr, RenFunction):
                    return ('bound', attr, obj)
                return attr
            raise RenRuntimeError(
                f"Cannot access member '{name}' on {ren_str(obj)}.", node.line)

        if t == FunctionCall:
            return self._call(node, env)

        if t == InputStatement:
            prompt = ren_str(self.evaluate(node.prompt, env))
            return input(prompt)

        if t == LambdaExpr:
            return RenFunction('<lambda>', [(p, None) for p in node.params],
                               Block([ReturnStatement(node.body, 0)]), env)

        raise RenRuntimeError(
            f"Cannot evaluate node of type {t.__name__}", None)

    # ── binary operations ─────────────────────────────────────────

    def _binary(self, node, env):
        op = node.op

        # Short-circuit logic
        if op == 'and':
            return bool(self.evaluate(node.left, env)) and bool(self.evaluate(node.right, env))
        if op == 'or':
            return bool(self.evaluate(node.left, env)) or bool(self.evaluate(node.right, env))

        left  = self.evaluate(node.left, env)
        right = self.evaluate(node.right, env)

        if op == '+':
            # String + anything = string concatenation
            if isinstance(left, str) or isinstance(right, str):
                return ren_str(left) + ren_str(right)
            if isinstance(left, list):
                return left + right
            return left + right
        if op == '-': return left - right
        if op == '*':
            if isinstance(left, str): return left * int(right)
            return left * right
        if op == '/':
            if right == 0:
                raise RenRuntimeError("Division by zero.", node.line)
            return left / right
        if op == '%': return left % right
        if op == '^': return left ** right
        if op == '==': return left == right
        if op == '!=': return left != right
        if op == '<':  return left < right
        if op == '<=': return left <= right
        if op == '>':  return left > right
        if op == '>=': return left >= right

        raise RenRuntimeError(f"Unknown operator: {op}", node.line)

    # ── function call ─────────────────────────────────────────────

    def _call(self, node, env):
        callee = self.evaluate(node.callee, env)
        args   = [self.evaluate(a, env) for a in node.args]

        # Bound method (instance.method)
        if isinstance(callee, tuple) and callee[0] == 'bound':
            _, fn, instance = callee
            return self._call_ren_function(fn, args, instance, node.line)

        # User-defined Ren function
        if isinstance(callee, RenFunction):
            return self._call_ren_function(callee, args, None, node.line)

        # Constructor call  Dog()  →  creates a RenInstance
        if isinstance(callee, RenClass):
            instance = RenInstance(callee)
            init = instance._find_method('init')  # search inherited init too
            if init:
                self._call_ren_function(init, args, instance, node.line)
            return instance

        # Built-in Python lambda (stdlib)
        if callable(callee):
            try:
                return callee(args)
            except Exception as e:
                raise RenRuntimeError(str(e), node.line)

        raise RenRuntimeError(
            f"'{ren_str(callee)}' is not a function.",
            node.line
        )

    def _call_ren_function(self, fn: RenFunction, args, self_instance, line):
        call_env = Environment(fn.closure_env)
        # Bind self if it's a method
        if self_instance is not None:
            call_env.define('self', self_instance)
        # Bind parameters
        params = fn.params
        for i, (p_name, _) in enumerate(params):
            val = args[i] if i < len(args) else None
            call_env.define(p_name, val)
        try:
            self.execute(fn.body, call_env)
            return None
        except ReturnSignal as r:
            return r.value

    # ── built-in member methods ───────────────────────────────────

    def _str_method(self, s, name, line):
        methods = {
            'upper':      lambda args: s.upper(),
            'lower':      lambda args: s.lower(),
            'trim':       lambda args: s.strip(),
            'len':        lambda args: len(s),
            'split':      lambda args: s.split(args[0]) if args else s.split(),
            'contains':   lambda args: args[0] in s,
            'startsWith': lambda args: s.startswith(args[0]),
            'endsWith':   lambda args: s.endswith(args[0]),
            'replace':    lambda args: s.replace(args[0], args[1]),
            'charAt':     lambda args: s[int(args[0])],
            'indexOf':    lambda args: s.index(args[0]) if args[0] in s else -1,
            'substring':  lambda args: s[int(args[0]):int(args[1])],
            'toNumber':   lambda args: float(s) if '.' in s else int(s),
        }
        if name in methods:
            return methods[name]
        raise RenRuntimeError(f"text has no method '{name}'.", line)

    def _list_method(self, lst, name, line):
        methods = {
            'append':  lambda args: lst.append(args[0]) or lst,
            'remove':  lambda args: lst.remove(args[0]) or lst,
            'pop':     lambda args: lst.pop() if not args else lst.pop(int(args[0])),
            'insert':  lambda args: lst.insert(int(args[0]), args[1]) or lst,
            'len':     lambda args: len(lst),
            'contains': lambda args: args[0] in lst,
            'sort':    lambda args: sorted(lst),
            'reverse': lambda args: list(reversed(lst)),
            'first':   lambda args: lst[0],
            'last':    lambda args: lst[-1],
            'join':    lambda args: (args[0] if args else ', ').join(ren_str(x) for x in lst),
        }
        if name in methods:
            return methods[name]
        raise RenRuntimeError(f"list has no method '{name}'.", line)

    def _dict_method(self, d, name, line):
        methods = {
            'get':    lambda args: d.get(args[0], args[1] if len(args) > 1 else None),
            'set':    lambda args: d.update({args[0]: args[1]}) or d,
            'remove': lambda args: d.pop(args[0], None) or d,
            'keys':   lambda args: list(d.keys()),
            'values': lambda args: list(d.values()),
            'has':    lambda args: args[0] in d,
            'len':    lambda args: len(d),
        }
        if name in methods:
            return methods[name]
        raise RenRuntimeError(f"dict has no method '{name}'.", line)

    # ── import handler ────────────────────────────────────────────

    def _handle_import(self, node: ImportStatement, env):
        """
        For now: import from our built-in module system.
        Future: load .ren module files.
        """
        builtin_modules = {
            'math': {
                'pi': math.pi, 'e': math.e,
                'sqrt': lambda a: math.sqrt(a[0]),
                'sin': lambda a: math.sin(a[0]),
                'cos': lambda a: math.cos(a[0]),
                'floor': lambda a: math.floor(a[0]),
                'ceil': lambda a: math.ceil(a[0]),
            },
            'random': {
                'random': lambda a: __import__('random').random(),
                'randint': lambda a: __import__('random').randint(int(a[0]), int(a[1])),
                'choice': lambda a: __import__('random').choice(a[0]),
                'shuffle': lambda a: __import__('random').shuffle(a[0]) or a[0],
            },
            'time': {
                'now': lambda a: time.time(),
                'sleep': lambda a: time.sleep(a[0]),
            },
            'os': {
                'exists': lambda a: os.path.exists(a[0]),
                'listdir': lambda a: os.listdir(a[0] if a else '.'),
                'mkdir': lambda a: os.makedirs(a[0], exist_ok=True),
                'cwd': lambda a: os.getcwd(),
            },
        }

        mod_name = node.module
        if mod_name not in builtin_modules:
            raise RenRuntimeError(
                f"Module '{mod_name}' not found.\n"
                f"  Available modules: {', '.join(builtin_modules.keys())}",
                node.line
            )

        mod = builtin_modules[mod_name]

        if node.names:
            for name in node.names:
                if name not in mod:
                    raise RenRuntimeError(
                        f"Module '{mod_name}' has no export '{name}'.", node.line)
                env.define(name, mod[name])
        else:
            # import math  →  access as math.sqrt() later
            # We store the whole module as a dict-like object
            mod_obj = {}
            for k, v in mod.items():
                mod_obj[k] = v
            env.define(mod_name, mod_obj)
