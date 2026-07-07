
from lexer import (
    TT_KEYWORD, TT_IDENTIFIER, TT_NUMBER, TT_STRING, TT_BOOL,
    TT_NEWLINE, TT_EOF,
    TT_PLUS, TT_MINUS, TT_STAR, TT_SLASH, TT_PERCENT, TT_POWER,
    TT_EQ, TT_EQEQ, TT_NEQ, TT_LT, TT_LTE, TT_GT, TT_GTE,
    TT_LPAREN, TT_RPAREN, TT_COMMA, TT_DOT, TT_LBRACKET, TT_RBRACKET,
)
from ast_nodes import *


class ParseError(Exception):
    def __init__(self, message, line):
        self.message = message
        self.line    = line

    def __str__(self):
        border = '=' * 50
        return (
            f"\n{border}\n"
            f"  PARSE ERROR  (line {self.line})\n"
            f"  {self.message}\n"
            f"{border}"
        )


class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos    = 0


    def current(self):
        return self.tokens[self.pos]

    def peek(self, offset=1):
        i = self.pos + offset
        if i < len(self.tokens):
            return self.tokens[i]
        return self.tokens[-1]  

    def advance(self):
        tok = self.tokens[self.pos]
        if self.pos < len(self.tokens) - 1:
            self.pos += 1
        return tok

    def check(self, type_, value=None):
        t = self.current()
        if t.type != type_:
            return False
        if value is not None and t.value != value:
            return False
        return True

    def match(self, type_, value=None):
        """Consume and return a token if it matches, else return None."""
        if self.check(type_, value):
            return self.advance()
        return None

    def expect(self, type_, value=None, hint=None):
        """
        Consume a token or raise a clear ParseError.
        hint: extra guidance shown to the user.
        """
        if self.check(type_, value):
            return self.advance()
        tok = self.current()
        what = repr(value) if value is not None else type_
        msg = f"Expected {what} but found {repr(tok.value)!r}."
        if hint:
            msg += f"\n  {hint}"
        raise ParseError(msg, tok.line)

    def skip_newlines(self):
        while self.check(TT_NEWLINE):
            self.advance()

    def at_end(self):
        return self.current().type == TT_EOF


    def parse(self):
        stmts = []
        self.skip_newlines()
        while not self.at_end():
            stmts.append(self.parse_statement())
            self.skip_newlines()
        return Program(stmts)


    def parse_statement(self):
        tok = self.current()

        if tok.type == TT_KEYWORD:
            kw = tok.value

            if kw == 'print':    return self.parse_print(newline=True)
            if kw == 'printraw': return self.parse_print(newline=False)
            if kw == 'main':     return self.parse_main_block()
            if kw == 'if':       return self.parse_if()
            if kw == 'while':    return self.parse_while()
            if kw == 'for':      return self.parse_for()
            if kw == 'repeat':   return self.parse_repeat()
            if kw == 'function': return self.parse_function(is_async=False)
            if kw == 'async':    return self.parse_async_function()
            if kw == 'return':   return self.parse_return()
            if kw == 'break':    self.advance(); return BreakStatement(tok.line)
            if kw == 'continue': self.advance(); return ContinueStatement(tok.line)
            if kw == 'try':      return self.parse_try()
            if kw == 'raise':    return self.parse_raise()
            if kw == 'import':   return self.parse_import()
            if kw == 'from':     return self.parse_from_import()
            if kw == 'match':    return self.parse_match()
            if kw == 'class':    return self.parse_class()

            if kw in ('number', 'text', 'bool', 'list', 'dict', 'set', 'any'):
                return self.parse_var_decl(is_const=False)

            if kw == 'const':
                return self.parse_var_decl(is_const=True)

        if tok.type == TT_IDENTIFIER and self.peek().type == TT_IDENTIFIER:
            return self.parse_class_typed_var()

        return self.parse_assign_or_expr()



    def parse_print(self, newline):
        tok = self.advance()  
        if self.check(TT_NEWLINE) or self.at_end():
            expr = StringLiteral('', tok.line)  
        else:
            expr = self.parse_expression()
        return PrintStatement(expr, newline=newline, line=tok.line)


    def parse_main_block(self):
        self.advance()  
        self.skip_newlines()
        body = self.parse_block_until(['end'])
        self.expect(TT_KEYWORD, 'end', hint="'main' block must end with 'end'.")
        return body  


    def parse_var_decl(self, is_const):
        type_tok = self.advance()   
        type_name = type_tok.value

        if is_const:
            name_tok = self.expect(TT_IDENTIFIER, hint="After 'const', write the constant name.")
        else:
            name_tok = self.expect(TT_IDENTIFIER,
                hint=f"After '{type_name}', write the variable name.\n"
                     f"  Example:  {type_name} myVar = ...")

        name = name_tok.value

        value = None
        if self.match(TT_EQ):
            value = self.parse_expression()

        return VarDeclaration(type_name if not is_const else None,
                              name, value, is_const, type_tok.line)

    def parse_class_typed_var(self):
        """
        Handle:  Dog rex = new Dog("Rex", "Woof")
        Where the type is a user-defined class name (identifier).
        """
        type_tok = self.advance()   
        type_name = type_tok.value
        name_tok = self.advance()   
        name = name_tok.value
        value = None
        if self.match(TT_EQ):
            value = self.parse_expression()
        return VarDeclaration(type_name, name, value, False, type_tok.line)


    def parse_assign_or_expr(self):
        expr = self.parse_expression()

        if self.match(TT_EQ):
            if not isinstance(expr, (Identifier, IndexAccess, MemberAccess)):
                raise ParseError(
                    "Left side of '=' must be a variable name or index expression.",
                    self.current().line
                )
            value = self.parse_expression()
            return Assignment(expr, value, expr.line)

        return expr



    def parse_if(self):
        tok = self.advance()  
        condition = self.parse_expression()
        self.skip_newlines()

        then_block = self.parse_block_until(['elseif', 'else', 'end'])
        elseifs = []
        else_block = None

        while self.check(TT_KEYWORD, 'elseif'):
            self.advance()
            ei_cond = self.parse_expression()
            self.skip_newlines()
            ei_body = self.parse_block_until(['elseif', 'else', 'end'])
            elseifs.append((ei_cond, ei_body))

        if self.check(TT_KEYWORD, 'else'):
            self.advance()
            self.skip_newlines()
            else_block = self.parse_block_until(['end'])

        self.expect(TT_KEYWORD, 'end', hint="Every 'if' block must end with 'end'.")
        return IfStatement(condition, then_block, elseifs, else_block, tok.line)


    def parse_while(self):
        tok = self.advance()  
        condition = self.parse_expression()
        self.skip_newlines()
        body = self.parse_block_until(['end'])
        self.expect(TT_KEYWORD, 'end', hint="Every 'while' loop must end with 'end'.")
        return WhileLoop(condition, body, tok.line)


    def parse_for(self):
        tok = self.advance()  
        var_tok = self.expect(TT_IDENTIFIER, hint="After 'for', write a variable name.")
        var_name = var_tok.value

        if self.match(TT_EQ):
            start = self.parse_expression()
            self.expect(TT_KEYWORD, 'to',
                hint="Numeric for-loop needs 'to'. Example: for i = 1 to 10")
            end_expr = self.parse_expression()
            step = None
            if self.match(TT_KEYWORD, 'step'):
                step = self.parse_expression()
            self.skip_newlines()
            body = self.parse_block_until(['end'])
            self.expect(TT_KEYWORD, 'end', hint="Every 'for' loop must end with 'end'.")
            return ForLoop(var_name, start, end_expr, step, None, body, tok.line)

        elif self.check(TT_KEYWORD, 'in'):
            self.advance()
            iterable = self.parse_expression()
            self.skip_newlines()
            body = self.parse_block_until(['end'])
            self.expect(TT_KEYWORD, 'end', hint="Every 'for' loop must end with 'end'.")
            return ForLoop(var_name, None, None, None, iterable, body, tok.line)

        else:
            raise ParseError(
                f"Expected '=' or 'in' after loop variable '{var_name}'.\n"
                f"  Examples:\n"
                f"    for i = 1 to 10\n"
                f"    for item in myList",
                tok.line
            )


    def parse_repeat(self):
        tok = self.advance()  
        count = self.parse_expression()
        self.skip_newlines()
        body = self.parse_block_until(['end'])
        self.expect(TT_KEYWORD, 'end', hint="Every 'repeat' loop must end with 'end'.")
        return RepeatLoop(count, body, tok.line)


    def parse_function(self, is_async=False):
        tok = self.advance()  
        name_tok = self.expect(TT_IDENTIFIER,
            hint="After 'function', write the function name.\n"
                 "  Example:  function greet(name)")
        name = name_tok.value

        self.expect(TT_LPAREN, hint=f"After function name '{name}', write '('.")
        params = self.parse_param_list()
        self.expect(TT_RPAREN, hint="Close the parameter list with ')'.")
        self.skip_newlines()
        body = self.parse_block_until(['end'])
        self.expect(TT_KEYWORD, 'end', hint="Every 'function' must end with 'end'.")
        return FunctionDecl(name, params, body, is_async, tok.line)

    def parse_async_function(self):
        self.advance()  
        self.expect(TT_KEYWORD, 'function',
            hint="'async' must be followed by 'function'.")
        tok = self.tokens[self.pos - 1]
        name_tok = self.expect(TT_IDENTIFIER)
        name = name_tok.value
        self.expect(TT_LPAREN)
        params = self.parse_param_list()
        self.expect(TT_RPAREN)
        self.skip_newlines()
        body = self.parse_block()
        return FunctionDecl(name, params, body, is_async=True, line=tok.line)

    def parse_param_list(self):
        params = []
        if self.check(TT_RPAREN):
            return params
        while True:
            p_name = self.expect(TT_IDENTIFIER,
                hint="Parameter must be a name.").value
            type_hint = None
            params.append((p_name, type_hint))
            if not self.match(TT_COMMA):
                break
        return params

    def parse_return(self):
        tok = self.advance()  
        if self.check(TT_NEWLINE) or self.at_end():
            return ReturnStatement(None, tok.line)
        value = self.parse_expression()
        return ReturnStatement(value, tok.line)


    def parse_try(self):
        tok = self.advance()  
        self.skip_newlines()
        try_block = self.parse_block_until(['catch'])
        self.expect(TT_KEYWORD, 'catch')
        error_var = None
        if self.check(TT_IDENTIFIER):
            error_var = self.advance().value
        self.skip_newlines()
        catch_block = self.parse_block_until(['finally', 'end'])
        finally_block = None
        if self.match(TT_KEYWORD, 'finally'):
            self.skip_newlines()
            finally_block = self.parse_block_until(['end'])
        self.expect(TT_KEYWORD, 'end',
            hint="Every 'try' block must end with 'end'.")
        return TryCatch(try_block, error_var, catch_block, finally_block, tok.line)

    def parse_raise(self):
        tok = self.advance()  
        expr = self.parse_expression()
        return RaiseStatement(expr, tok.line)


    def parse_import(self):
        tok = self.advance()  
        mod = self.expect(TT_IDENTIFIER, hint="After 'import', write the module name.").value
        return ImportStatement(mod, None, None, tok.line)

    def parse_from_import(self):
        tok = self.advance()  
        mod = self.expect(TT_IDENTIFIER).value
        self.expect(TT_KEYWORD, 'import')
        names = []
        while True:
            names.append(self.expect(TT_IDENTIFIER).value)
            if not self.match(TT_COMMA):
                break
        return ImportStatement(mod, names, None, tok.line)


    def parse_match(self):
        tok = self.advance()  
        subject = self.parse_expression()
        self.skip_newlines()
        cases = []
        default_block = None
        while not self.check(TT_KEYWORD, 'end'):
            if self.check(TT_KEYWORD, 'case'):
                self.advance()
                val = self.parse_expression()
                self.skip_newlines()
                blk = self.parse_block_until(['case', 'default', 'end'])
                cases.append((val, blk))
            elif self.check(TT_KEYWORD, 'default'):
                self.advance()
                self.skip_newlines()
                default_block = self.parse_block_until(['end'])
            else:
                break
            self.skip_newlines()
        self.expect(TT_KEYWORD, 'end')
        return MatchStatement(subject, cases, default_block, tok.line)


    def parse_class(self):
        tok = self.advance()  
        name = self.expect(TT_IDENTIFIER).value
        parent = None
        if self.match(TT_KEYWORD, 'extends'):
            parent = self.expect(TT_IDENTIFIER).value
        self.skip_newlines()
        methods = []
        while not self.check(TT_KEYWORD, 'end'):
            self.skip_newlines()
            if self.check(TT_KEYWORD, 'function'):
                methods.append(self.parse_function())
            elif self.check(TT_KEYWORD, 'async'):
                methods.append(self.parse_async_function())
            else:
                break
            self.skip_newlines()
        self.expect(TT_KEYWORD, 'end')
        return ClassDecl(name, parent, methods, tok.line)


    def parse_block(self):
        """Parse statements until 'end'."""
        return self.parse_block_until(['end'])

    def parse_block_until(self, stop_keywords):
        """Parse statements until one of the stop keywords appears."""
        stmts = []
        self.skip_newlines()
        while not self.at_end():
            if (self.check(TT_KEYWORD)
                    and self.current().value in stop_keywords):
                break
            stmts.append(self.parse_statement())
            self.skip_newlines()
        return Block(stmts)


    def parse_expression(self):
        return self.parse_or()

    def parse_or(self):
        left = self.parse_and()
        while self.check(TT_KEYWORD, 'or'):
            op = self.advance().value
            right = self.parse_and()
            left = BinaryOp(left, op, right, left.line)
        return left

    def parse_and(self):
        left = self.parse_not()
        while self.check(TT_KEYWORD, 'and'):
            op = self.advance().value
            right = self.parse_not()
            left = BinaryOp(left, op, right, left.line)
        return left

    def parse_not(self):
        if self.check(TT_KEYWORD, 'not'):
            tok = self.advance()
            operand = self.parse_not()
            return UnaryOp('not', operand, tok.line)
        return self.parse_comparison()

    def parse_comparison(self):
        left = self.parse_addition()
        comp_ops = {TT_EQEQ, TT_NEQ, TT_LT, TT_LTE, TT_GT, TT_GTE}
        while self.current().type in comp_ops:
            op = self.advance().value
            right = self.parse_addition()
            left = BinaryOp(left, op, right, left.line)
        return left

    def parse_addition(self):
        left = self.parse_multiplication()
        while self.current().type in (TT_PLUS, TT_MINUS):
            op = self.advance().value
            right = self.parse_multiplication()
            left = BinaryOp(left, op, right, left.line)
        return left

    def parse_multiplication(self):
        left = self.parse_unary()
        while self.current().type in (TT_STAR, TT_SLASH, TT_PERCENT):
            op = self.advance().value
            right = self.parse_unary()
            left = BinaryOp(left, op, right, left.line)
        return left

    def parse_unary(self):
        if self.current().type == TT_MINUS:
            tok = self.advance()
            operand = self.parse_unary()
            return UnaryOp('-', operand, tok.line)
        return self.parse_power()

    def parse_power(self):
        base = self.parse_postfix()
        if self.current().type == TT_POWER:
            tok = self.advance()
            exp = self.parse_unary()  
            return BinaryOp(base, '^', exp, tok.line)
        return base

    def parse_postfix(self):
        """Handle  .member  [index]  (args)  after primary."""
        expr = self.parse_primary()
        while True:
            if self.check(TT_DOT):
                self.advance()
                member_tok = self.expect(TT_IDENTIFIER)
                expr = MemberAccess(expr, member_tok.value, member_tok.line)

            elif self.check(TT_LBRACKET):
                tok = self.advance()
                index = self.parse_expression()
                self.expect(TT_RBRACKET, hint="Close the index with ']'.")
                expr = IndexAccess(expr, index, tok.line)

            elif self.check(TT_LPAREN):
                tok = self.advance()
                args = []
                if not self.check(TT_RPAREN):
                    while True:
                        args.append(self.parse_expression())
                        if not self.match(TT_COMMA):
                            break
                self.expect(TT_RPAREN, hint="Close the argument list with ')'.")
                expr = FunctionCall(expr, args, tok.line)
            else:
                break
        return expr

    def parse_primary(self):
        tok = self.current()

        if tok.type == TT_NUMBER:
            self.advance()
            return NumberLiteral(tok.value, tok.line)

        if tok.type == TT_STRING:
            self.advance()
            return StringLiteral(tok.value, tok.line)

        if tok.type == TT_BOOL:
            self.advance()
            return BoolLiteral(tok.value, tok.line)

        if self.check(TT_KEYWORD, 'null'):
            self.advance()
            return NullLiteral(tok.line)

        if tok.type == TT_LPAREN:
            self.advance()
            expr = self.parse_expression()
            self.expect(TT_RPAREN, hint="Expected closing ')'.")
            return expr

        if tok.type == TT_LBRACKET:
            self.advance()
            elements = []
            if not self.check(TT_RBRACKET):
                while True:
                    elements.append(self.parse_expression())
                    if not self.match(TT_COMMA):
                        break
            self.expect(TT_RBRACKET, hint="Close the list with ']'.")
            return ListLiteral(elements, tok.line)

        if self.check(TT_KEYWORD, 'input'):
            self.advance()
            prompt = self.parse_expression()
            return InputStatement(prompt, tok.line)

        if tok.type == TT_IDENTIFIER:
            self.advance()
            return Identifier(tok.value, tok.line)

        if self.check(TT_KEYWORD, 'self'):
            self.advance()
            return Identifier('self', tok.line)

        if self.check(TT_KEYWORD, 'new'):
            self.advance()
            class_name = self.expect(TT_IDENTIFIER, hint="After 'new', write the class name.").value
            return Identifier(class_name, tok.line)

        if self.check(TT_KEYWORD, 'await'):
            self.advance()
            expr = self.parse_primary()
            return UnaryOp('await', expr, tok.line)


        if tok.type == TT_KEYWORD and tok.value in ('end', 'else', 'elseif'):
            raise ParseError(
                f"Unexpected '{tok.value}' — did you close a block too early?",
                tok.line
            )

        raise ParseError(
            f"Unexpected token: {repr(tok.value)}\n"
            f"  Expected a value, variable name, or expression.",
            tok.line
        )
