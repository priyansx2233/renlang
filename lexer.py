# ============================================================
#  Ren Language — Lexer (Tokenizer)
#  Stage 1 of the compiler pipeline.
#
#  Reads raw .ren source text and converts it into a flat
#  list of Token objects. No grammar logic here — just
#  recognising what every character or word IS.
# ============================================================

# ------------------------------------------------------------------
# TOKEN TYPE CONSTANTS
# ------------------------------------------------------------------
TT_KEYWORD    = 'KEYWORD'       # print, if, end, function, ...
TT_IDENTIFIER = 'IDENTIFIER'    # user-defined names: age, score, ...
TT_NUMBER     = 'NUMBER'        # 42, 3.14
TT_STRING     = 'STRING'        # "Hello"
TT_BOOL       = 'BOOL'          # true / false
TT_NEWLINE    = 'NEWLINE'       # statement terminator (replaces ;)
TT_EOF        = 'EOF'           # end of file
TT_PLUS       = 'PLUS'          # +
TT_MINUS      = 'MINUS'         # -
TT_STAR       = 'STAR'          # *
TT_SLASH      = 'SLASH'         # /
TT_PERCENT    = 'PERCENT'       # %
TT_POWER      = 'POWER'         # ^
TT_EQ         = 'EQ'            # =
TT_EQEQ       = 'EQEQ'          # ==
TT_NEQ        = 'NEQ'           # !=
TT_LT         = 'LT'            # <
TT_LTE        = 'LTE'           # <=
TT_GT         = 'GT'            # >
TT_GTE        = 'GTE'           # >=
TT_LPAREN     = 'LPAREN'        # (
TT_RPAREN     = 'RPAREN'        # )
TT_COMMA      = 'COMMA'         # ,
TT_DOT        = 'DOT'           # .
TT_LBRACKET   = 'LBRACKET'      # [
TT_RBRACKET   = 'RBRACKET'      # ]

# ------------------------------------------------------------------
# KEYWORDS
# These are reserved — users cannot name variables with these words.
# ------------------------------------------------------------------
KEYWORDS = {
    # I/O
    'print', 'printraw', 'input',
    # Program structure
    'main', 'end',
    # Types
    'number', 'text', 'bool', 'list', 'dict', 'set', 'const', 'any',
    # Boolean literals
    'true', 'false',
    # Null
    'null',
    # Conditionals
    'if', 'else', 'elseif',
    # Loops
    'for', 'while', 'repeat', 'in', 'to', 'step', 'break', 'continue',
    # Functions
    'function', 'return',
    # Logic operators
    'and', 'or', 'not',
    # Error handling
    'try', 'catch', 'finally', 'raise',
    # OOP
    'class', 'object', 'self', 'new', 'extends', 'interface',
    # Modules
    'import', 'from', 'module', 'export',
    # Pattern matching
    'match', 'case', 'default',
    # Async
    'async', 'await',
}


# ------------------------------------------------------------------
# TOKEN CLASS
# ------------------------------------------------------------------
class Token:
    def __init__(self, type_, value, line):
        self.type  = type_
        self.value = value
        self.line  = line   # for error messages

    def __repr__(self):
        return f'Token({self.type}, {repr(self.value)}, L{self.line})'


# ------------------------------------------------------------------
# LEXER ERROR  — beginner-friendly error messages
# ------------------------------------------------------------------
class LexerError(Exception):
    def __init__(self, message, line):
        self.message = message
        self.line    = line

    def __str__(self):
        border = '=' * 50
        return (
            f"\n{border}\n"
            f"  LEXER ERROR  (line {self.line})\n"
            f"  {self.message}\n"
            f"{border}"
        )


# ------------------------------------------------------------------
# LEXER
# ------------------------------------------------------------------
class Lexer:
    def __init__(self, source: str):
        self.source = source
        self.pos    = 0
        self.line   = 1
        self.tokens = []

    # ── helpers ──────────────────────────────────────────────────

    def current(self):
        return self.source[self.pos] if self.pos < len(self.source) else None

    def peek(self, offset=1):
        i = self.pos + offset
        return self.source[i] if i < len(self.source) else None

    def advance(self):
        ch = self.source[self.pos]
        self.pos += 1
        if ch == '\n':
            self.line += 1
        return ch

    def emit(self, type_, value):
        self.tokens.append(Token(type_, value, self.line))

    # ── main entry ───────────────────────────────────────────────

    def tokenize(self):
        while self.current() is not None:
            self._next()
        self.emit(TT_EOF, None)
        return self.tokens

    # ── dispatch ─────────────────────────────────────────────────

    def _next(self):
        ch = self.current()

        # Whitespace (spaces, tabs) — skipped silently
        if ch in (' ', '\t'):
            self.advance()

        # Newline — ends a statement
        elif ch == '\n':
            self.advance()
            self.emit(TT_NEWLINE, '\n')

        # Windows CRLF
        elif ch == '\r':
            self.advance()
            if self.current() == '\n':
                self.advance()
            self.emit(TT_NEWLINE, '\n')

        # Comments (-- or ---)
        elif ch == '-' and self.peek() == '-':
            self._comment()

        # Strings
        elif ch == '"':
            self._string()

        # Helpful error for single-quote strings
        elif ch == "'":
            raise LexerError(
                "Ren uses double quotes (\") for strings, not single quotes (').\n"
                "  Example:  print \"Hello\"",
                self.line
            )

        # Numbers
        elif ch.isdigit():
            self._number()

        # Identifiers / keywords
        elif ch.isalpha() or ch == '_':
            self._identifier()

        # Operators and punctuation
        elif ch == '+': self.advance(); self.emit(TT_PLUS, '+')
        elif ch == '*': self.advance(); self.emit(TT_STAR, '*')
        elif ch == '/': self.advance(); self.emit(TT_SLASH, '/')
        elif ch == '%': self.advance(); self.emit(TT_PERCENT, '%')
        elif ch == '^': self.advance(); self.emit(TT_POWER, '^')
        elif ch == '(': self.advance(); self.emit(TT_LPAREN, '(')
        elif ch == ')': self.advance(); self.emit(TT_RPAREN, ')')
        elif ch == ',': self.advance(); self.emit(TT_COMMA, ',')
        elif ch == '.': self.advance(); self.emit(TT_DOT, '.')
        elif ch == '[': self.advance(); self.emit(TT_LBRACKET, '[')
        elif ch == ']': self.advance(); self.emit(TT_RBRACKET, ']')

        elif ch == '-':
            self.advance(); self.emit(TT_MINUS, '-')

        elif ch == '=':
            self.advance()
            if self.current() == '=':
                self.advance(); self.emit(TT_EQEQ, '==')
            else:
                self.emit(TT_EQ, '=')

        elif ch == '!' and self.peek() == '=':
            self.advance(); self.advance()
            self.emit(TT_NEQ, '!=')

        elif ch == '<':
            self.advance()
            if self.current() == '=':
                self.advance(); self.emit(TT_LTE, '<=')
            else:
                self.emit(TT_LT, '<')

        elif ch == '>':
            self.advance()
            if self.current() == '=':
                self.advance(); self.emit(TT_GTE, '>=')
            else:
                self.emit(TT_GT, '>')

        else:
            raise LexerError(
                f"Unknown character: '{ch}'\n"
                f"  This symbol is not part of the Ren language.",
                self.line
            )

    # ── scanners ─────────────────────────────────────────────────

    def _comment(self):
        """
        -- single line comment
        --- multi-line comment ---
        """
        self.advance()  # -
        self.advance()  # -
        if self.current() == '-':
            # Multi-line block comment
            self.advance()
            while self.current() is not None:
                if (self.current() == '-'
                        and self.peek(1) == '-'
                        and self.peek(2) == '-'):
                    self.advance(); self.advance(); self.advance()
                    break
                self.advance()
        else:
            # Single-line: skip to end of line
            while self.current() is not None and self.current() != '\n':
                self.advance()

    def _string(self):
        """Read a double-quoted string with escape sequences."""
        self.advance()  # opening "
        start = self.line
        buf = []
        while self.current() is not None and self.current() != '"':
            if self.current() == '\n':
                raise LexerError(
                    "String was not closed before the end of the line.\n"
                    "  Did you forget a closing \" ?",
                    start
                )
            if self.current() == '\\':
                self.advance()
                esc = self.current()
                escapes = {'n': '\n', 't': '\t', '"': '"', '\\': '\\', 'r': '\r'}
                if esc in escapes:
                    buf.append(escapes[esc])
                    self.advance()
                else:
                    raise LexerError(
                        f"Unknown escape sequence: \\{esc}\n"
                        f"  Valid escapes: \\n  \\t  \\\"  \\\\",
                        self.line
                    )
            else:
                buf.append(self.advance())
        if self.current() is None:
            raise LexerError(
                "String was never closed. Missing closing \" at end of file.",
                start
            )
        self.advance()  # closing "
        self.emit(TT_STRING, ''.join(buf))

    def _number(self):
        """Read an integer or float."""
        buf = []
        dots = 0
        while self.current() is not None and (
                self.current().isdigit() or self.current() == '.'):
            if self.current() == '.':
                dots += 1
                if dots > 1:
                    raise LexerError(
                        "A number cannot contain more than one decimal point.",
                        self.line
                    )
            buf.append(self.advance())
        text = ''.join(buf)
        self.emit(TT_NUMBER, float(text) if '.' in text else int(text))

    def _identifier(self):
        """Read a keyword or user-defined name."""
        buf = []
        while self.current() is not None and (
                self.current().isalnum() or self.current() == '_'):
            buf.append(self.advance())
        word = ''.join(buf)
        if word == 'true':
            self.emit(TT_BOOL, True)
        elif word == 'false':
            self.emit(TT_BOOL, False)
        elif word in KEYWORDS:
            self.emit(TT_KEYWORD, word)
        else:
            self.emit(TT_IDENTIFIER, word)