
TT_KEYWORD    = 'KEYWORD'       
TT_IDENTIFIER = 'IDENTIFIER'    
TT_NUMBER     = 'NUMBER'        
TT_STRING     = 'STRING'        
TT_BOOL       = 'BOOL'          
TT_NEWLINE    = 'NEWLINE'       
TT_EOF        = 'EOF'           
TT_PLUS       = 'PLUS'          
TT_MINUS      = 'MINUS'         
TT_STAR       = 'STAR'          
TT_SLASH      = 'SLASH'         
TT_PERCENT    = 'PERCENT'       
TT_POWER      = 'POWER'         
TT_EQ         = 'EQ'            
TT_EQEQ       = 'EQEQ'          
TT_NEQ        = 'NEQ'           
TT_LT         = 'LT'            
TT_LTE        = 'LTE'           
TT_GT         = 'GT'            
TT_GTE        = 'GTE'           
TT_LPAREN     = 'LPAREN'        
TT_RPAREN     = 'RPAREN'        
TT_COMMA      = 'COMMA'         
TT_DOT        = 'DOT'           
TT_LBRACKET   = 'LBRACKET'      
TT_RBRACKET   = 'RBRACKET'      

KEYWORDS = {
    'print', 'printraw', 'input',
    'main', 'end',
    'number', 'text', 'bool', 'list', 'dict', 'set', 'const', 'any',
    'true', 'false',
    'null',
    'if', 'else', 'elseif',
    'for', 'while', 'repeat', 'in', 'to', 'step', 'break', 'continue',
    'function', 'return',
    'and', 'or', 'not',
    'try', 'catch', 'finally', 'raise',
    'class', 'object', 'self', 'new', 'extends', 'interface',
    'import', 'from', 'module', 'export',
    'match', 'case', 'default',
    'async', 'await',
}


class Token:
    def __init__(self, type_, value, line):
        self.type  = type_
        self.value = value
        self.line  = line   

    def __repr__(self):
        return f'Token({self.type}, {repr(self.value)}, L{self.line})'


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


class Lexer:
    def __init__(self, source: str):
        self.source = source
        self.pos    = 0
        self.line   = 1
        self.tokens = []


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


    def tokenize(self):
        while self.current() is not None:
            self._next()
        self.emit(TT_EOF, None)
        return self.tokens


    def _next(self):
        ch = self.current()

        if ch in (' ', '\t'):
            self.advance()

        elif ch == '\n':
            self.advance()
            self.emit(TT_NEWLINE, '\n')

        elif ch == '\r':
            self.advance()
            if self.current() == '\n':
                self.advance()
            self.emit(TT_NEWLINE, '\n')

        elif ch == '-' and self.peek() == '-':
            self._comment()

        elif ch == '"':
            self._string()

        elif ch == "'":
            raise LexerError(
                "Ren uses double quotes (\") for strings, not single quotes (').\n"
                "  Example:  print \"Hello\"",
                self.line
            )

        elif ch.isdigit():
            self._number()

        elif ch.isalpha() or ch == '_':
            self._identifier()

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


    def _comment(self):
        """
        -- single line comment
        --- multi-line comment ---
        """
        self.advance()  
        self.advance()  
        if self.current() == '-':
            self.advance()
            while self.current() is not None:
                if (self.current() == '-'
                        and self.peek(1) == '-'
                        and self.peek(2) == '-'):
                    self.advance(); self.advance(); self.advance()
                    break
                self.advance()
        else:
            while self.current() is not None and self.current() != '\n':
                self.advance()

    def _string(self):
        """Read a double-quoted string with escape sequences."""
        self.advance()  
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
        self.advance()  
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