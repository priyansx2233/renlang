# ============================================================
#  Ren Language — AST Nodes
#  Defines all the data structures that represent a parsed
#  Ren program as an Abstract Syntax Tree (AST).
#
#  Every node = one grammatical construct in the language.
# ============================================================


# ── Base ─────────────────────────────────────────────────────────
class Node:
    """Base class for all AST nodes."""
    pass


# ── Literals (values that appear directly in code) ───────────────

class NumberLiteral(Node):
    """42  or  3.14"""
    def __init__(self, value, line):
        self.value = value
        self.line  = line

class StringLiteral(Node):
    """\"Hello, World!\""""
    def __init__(self, value, line):
        self.value = value
        self.line  = line

class BoolLiteral(Node):
    """true  or  false"""
    def __init__(self, value, line):
        self.value = value
        self.line  = line

class NullLiteral(Node):
    """null"""
    def __init__(self, line):
        self.line = line

class ListLiteral(Node):
    """[1, 2, 3]"""
    def __init__(self, elements, line):
        self.elements = elements  # list of Nodes
        self.line     = line

class DictLiteral(Node):
    """{"key": value, ...}  → written as  dict{"key": value}"""
    def __init__(self, pairs, line):
        self.pairs = pairs    # list of (key_node, value_node)
        self.line  = line


# ── Identifiers ──────────────────────────────────────────────────

class Identifier(Node):
    """A variable/constant name: age, score, name"""
    def __init__(self, name, line):
        self.name = name
        self.line = line


# ── Expressions ──────────────────────────────────────────────────

class BinaryOp(Node):
    """left OP right  (e.g.  a + b,  x > 10,  a and b)"""
    def __init__(self, left, op, right, line):
        self.left  = left
        self.op    = op    # operator string: '+', '-', '==', 'and', ...
        self.right = right
        self.line  = line

class UnaryOp(Node):
    """OP operand  (e.g.  not x,  -5)"""
    def __init__(self, op, operand, line):
        self.op      = op
        self.operand = operand
        self.line    = line

class IndexAccess(Node):
    """myList[0]  or  myDict["key"]"""
    def __init__(self, obj, index, line):
        self.obj   = obj
        self.index = index
        self.line  = line

class MemberAccess(Node):
    """obj.property  or  obj.method()"""
    def __init__(self, obj, member, line):
        self.obj    = obj
        self.member = member
        self.line   = line

class FunctionCall(Node):
    """name(arg1, arg2, ...)"""
    def __init__(self, callee, args, line):
        self.callee = callee   # Identifier or MemberAccess
        self.args   = args     # list of Nodes
        self.line   = line

class LambdaExpr(Node):
    """function(a, b) => a + b   (anonymous function / lambda)"""
    def __init__(self, params, body, line):
        self.params = params   # list of strings
        self.body   = body     # expression Node (single expr lambda)
        self.line   = line


# ── Statements ───────────────────────────────────────────────────

class PrintStatement(Node):
    """print <expression>"""
    def __init__(self, expr, newline=True, line=0):
        self.expr    = expr
        self.newline = newline  # False for printraw
        self.line    = line

class VarDeclaration(Node):
    """number age = 15   |   text name = "Alice"   |   const PI = 3.14"""
    def __init__(self, type_name, name, value, is_const, line):
        self.type_name = type_name   # 'number', 'text', 'bool', 'any', None (inferred)
        self.name      = name
        self.value     = value       # expression Node or None
        self.is_const  = is_const
        self.line      = line

class Assignment(Node):
    """name = value  (reassignment after declaration)"""
    def __init__(self, target, value, line):
        self.target = target   # Identifier or IndexAccess or MemberAccess
        self.value  = value
        self.line   = line

class InputStatement(Node):
    """name = input "Enter your name: " """
    def __init__(self, prompt, line):
        self.prompt = prompt   # string expression
        self.line   = line

class Block(Node):
    """A sequence of statements (body of if/loop/function/main)."""
    def __init__(self, statements):
        self.statements = statements  # list of Nodes

class IfStatement(Node):
    """
    if condition
        ...
    elseif condition
        ...
    else
        ...
    end
    """
    def __init__(self, condition, then_block, elseifs, else_block, line):
        self.condition  = condition
        self.then_block = then_block   # Block
        self.elseifs    = elseifs      # list of (condition, Block)
        self.else_block = else_block   # Block or None
        self.line       = line

class WhileLoop(Node):
    """
    while condition
        ...
    end
    """
    def __init__(self, condition, body, line):
        self.condition = condition
        self.body      = body   # Block
        self.line      = line

class ForLoop(Node):
    """
    for i = 1 to 10
        ...
    end
    — or —
    for item in myList
        ...
    end
    """
    def __init__(self, var, start, end_expr, step, iterable, body, line):
        self.var      = var        # string: loop variable name
        self.start    = start      # expression (numeric for) or None
        self.end_expr = end_expr   # expression or None
        self.step     = step       # expression or None (default 1)
        self.iterable = iterable   # expression (for-in) or None
        self.body     = body
        self.line     = line

class RepeatLoop(Node):
    """
    repeat 5
        ...
    end
    """
    def __init__(self, count, body, line):
        self.count = count   # expression
        self.body  = body
        self.line  = line

class BreakStatement(Node):
    def __init__(self, line): self.line = line

class ContinueStatement(Node):
    def __init__(self, line): self.line = line

class FunctionDecl(Node):
    """
    function add(a, b)
        return a + b
    end
    """
    def __init__(self, name, params, body, is_async, line):
        self.name     = name
        self.params   = params    # list of (name, type_hint or None)
        self.body     = body      # Block
        self.is_async = is_async
        self.line     = line

class ReturnStatement(Node):
    """return <expression>"""
    def __init__(self, value, line):
        self.value = value   # expression Node or None
        self.line  = line

class TryCatch(Node):
    """
    try
        ...
    catch e
        ...
    finally
        ...
    end
    """
    def __init__(self, try_block, error_var, catch_block, finally_block, line):
        self.try_block     = try_block
        self.error_var     = error_var      # string or None
        self.catch_block   = catch_block    # Block
        self.finally_block = finally_block  # Block or None
        self.line          = line

class RaiseStatement(Node):
    """raise "Something went wrong" """
    def __init__(self, expr, line):
        self.expr = expr
        self.line = line

class ImportStatement(Node):
    """import math   |   from math import sqrt"""
    def __init__(self, module, names, alias, line):
        self.module = module   # string
        self.names  = names    # list of strings or None (import all)
        self.alias  = alias    # string or None
        self.line   = line

class MatchStatement(Node):
    """
    match value
        case 1
            ...
        case 2
            ...
        default
            ...
    end
    """
    def __init__(self, subject, cases, default_block, line):
        self.subject       = subject        # expression
        self.cases         = cases          # list of (value_node, Block)
        self.default_block = default_block  # Block or None
        self.line          = line

class ClassDecl(Node):
    """
    class Dog
        ...
    end
    """
    def __init__(self, name, parent, methods, line):
        self.name    = name
        self.parent  = parent    # string or None
        self.methods = methods   # list of FunctionDecl
        self.line    = line

class Program(Node):
    """Root node — the entire .ren file."""
    def __init__(self, statements):
        self.statements = statements  # list of Nodes
