// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  REN LANGUAGE — JAVASCRIPT INTERPRETER + APP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TT={KEYWORD:'KEYWORD',IDENTIFIER:'IDENTIFIER',NUMBER:'NUMBER',STRING:'STRING',BOOL:'BOOL',NEWLINE:'NEWLINE',EOF:'EOF',PLUS:'PLUS',MINUS:'MINUS',STAR:'STAR',SLASH:'SLASH',PERCENT:'PERCENT',POWER:'POWER',EQ:'EQ',EQEQ:'EQEQ',NEQ:'NEQ',LT:'LT',LTE:'LTE',GT:'GT',GTE:'GTE',LPAREN:'LPAREN',RPAREN:'RPAREN',COMMA:'COMMA',DOT:'DOT',LBRACKET:'LBRACKET',RBRACKET:'RBRACKET'};
const KEYWORDS=new Set(['print','printraw','input','main','end','number','text','bool','list','dict','set','const','any','true','false','null','if','else','elseif','for','while','repeat','in','to','step','break','continue','function','return','and','or','not','try','catch','finally','raise','class','self','new','extends','import','from','match','case','default','async','await']);
class Token{constructor(type,value,line){this.type=type;this.value=value;this.line=line;}}
class RenLexerError extends Error{constructor(msg,line){super(msg);this.line=line;this.kind='LEXER ERROR';}}
class RenParseError extends Error{constructor(msg,line){super(msg);this.line=line;this.kind='PARSE ERROR';}}
class RenRuntimeError extends Error{constructor(msg,line){super(msg);this.line=line;this.kind='RUNTIME ERROR';}}
class Lexer{
  constructor(src){this.src=src;this.pos=0;this.line=1;this.tokens=[];}
  cur(){return this.pos<this.src.length?this.src[this.pos]:null;}
  pk(o=1){const i=this.pos+o;return i<this.src.length?this.src[i]:null;}
  adv(){const c=this.src[this.pos++];if(c==='\n')this.line++;return c;}
  emit(t,v){this.tokens.push(new Token(t,v,this.line));}
  tokenize(){while(this.cur()!==null)this.next();this.emit(TT.EOF,null);return this.tokens;}
  next(){
    const c=this.cur();
    if(c===' '||c==='\t'){this.adv();return;}
    if(c==='\n'){this.adv();this.emit(TT.NEWLINE,'\n');return;}
    if(c==='\r'){this.adv();if(this.cur()==='\n')this.adv();this.emit(TT.NEWLINE,'\n');return;}
    if(c==='-'&&this.pk()==='-'){this.scanComment();return;}
    if(c==='"'){this.scanStr();return;}
    if(c==="'")throw new RenLexerError("Ren uses double quotes (\") not single quotes (').\n  Example: print \"Hello\"",this.line);
    if(c>='0'&&c<='9'){this.scanNum();return;}
    if((c>='a'&&c<='z')||(c>='A'&&c<='Z')||c==='_'){this.scanId();return;}
    if(c==='+'){this.adv();this.emit(TT.PLUS,'+');}
    else if(c==='*'){this.adv();this.emit(TT.STAR,'*');}
    else if(c==='/'){this.adv();this.emit(TT.SLASH,'/');}
    else if(c==='%'){this.adv();this.emit(TT.PERCENT,'%');}
    else if(c==='^'){this.adv();this.emit(TT.POWER,'^');}
    else if(c==='('){this.adv();this.emit(TT.LPAREN,'(');}
    else if(c===')'){this.adv();this.emit(TT.RPAREN,')');}
    else if(c===','){this.adv();this.emit(TT.COMMA,',');}
    else if(c==='.'){this.adv();this.emit(TT.DOT,'.');}
    else if(c==='['){this.adv();this.emit(TT.LBRACKET,'[');}
    else if(c===']'){this.adv();this.emit(TT.RBRACKET,']');}
    else if(c==='-'){this.adv();this.emit(TT.MINUS,'-');}
    else if(c==='='){this.adv();if(this.cur()==='='){this.adv();this.emit(TT.EQEQ,'==');}else this.emit(TT.EQ,'=');}
    else if(c==='!'&&this.pk()==='='){this.adv();this.adv();this.emit(TT.NEQ,'!=');}
    else if(c==='<'){this.adv();this.cur()==='='?(this.adv(),this.emit(TT.LTE,'<=')):(this.emit(TT.LT,'<'));}
    else if(c==='>'){this.adv();this.cur()==='='?(this.adv(),this.emit(TT.GTE,'>=')):(this.emit(TT.GT,'>'));}
    else throw new RenLexerError(`Unknown character: '${c}'\n  This character is not part of the Ren language.`,this.line);
  }
  scanComment(){this.adv();this.adv();if(this.cur()==='-'){this.adv();while(this.cur()!==null){if(this.cur()==='-'&&this.pk(1)==='-'&&this.pk(2)==='-'){this.adv();this.adv();this.adv();break;}this.adv();}}else{while(this.cur()!==null&&this.cur()!=='\n')this.adv();}}
  scanStr(){this.adv();const sl=this.line;let buf='';while(this.cur()!==null&&this.cur()!=='"'){if(this.cur()==='\n')throw new RenLexerError('String not closed before end of line.',sl);if(this.cur()==='\\'){this.adv();const e=this.cur();const m={n:'\n',t:'\t','"':'"','\\':'\\',r:'\r'};if(e in m){buf+=m[e];this.adv();}else throw new RenLexerError(`Unknown escape: \\${e}`,this.line);}else buf+=this.adv();}if(this.cur()===null)throw new RenLexerError('String never closed.',sl);this.adv();this.emit(TT.STRING,buf);}
  scanNum(){let buf='',dot=false;while(this.cur()!==null&&((this.cur()>='0'&&this.cur()<='9')||this.cur()==='.')){if(this.cur()==='.'){if(dot)throw new RenLexerError('Too many decimal points.',this.line);dot=true;}buf+=this.adv();}this.emit(TT.NUMBER,dot?parseFloat(buf):parseInt(buf,10));}
  scanId(){let buf='';while(this.cur()!==null&&((this.cur()>='a'&&this.cur()<='z')||(this.cur()>='A'&&this.cur()<='Z')||(this.cur()>='0'&&this.cur()<='9')||this.cur()==='_'))buf+=this.adv();if(buf==='true')this.emit(TT.BOOL,true);else if(buf==='false')this.emit(TT.BOOL,false);else if(KEYWORDS.has(buf))this.emit(TT.KEYWORD,buf);else this.emit(TT.IDENTIFIER,buf);}
}
const N={Prog:(s)=>({t:'Prog',s}),NumLit:(v,l)=>({t:'NumLit',v,l}),StrLit:(v,l)=>({t:'StrLit',v,l}),BoolLit:(v,l)=>({t:'BoolLit',v,l}),NullLit:(l)=>({t:'NullLit',l}),ListLit:(els,l)=>({t:'ListLit',els,l}),Id:(n,l)=>({t:'Id',n,l}),BinOp:(L,op,R,l)=>({t:'BinOp',L,op,R,l}),UnOp:(op,o,l)=>({t:'UnOp',op,o,l}),Idx:(o,i,l)=>({t:'Idx',o,i,l}),Mem:(o,m,l)=>({t:'Mem',o,m,l}),Call:(c,a,l)=>({t:'Call',c,a,l}),Print:(e,nl,l)=>({t:'Print',e,nl,l}),VarDecl:(ty,n,v,ic,l)=>({t:'VarDecl',ty,n,v,ic,l}),Assign:(ta,v,l)=>({t:'Assign',ta,v,l}),InputE:(p,l)=>({t:'InputE',p,l}),Block:(s)=>({t:'Block',s}),IfS:(c,tb,eis,eb,l)=>({t:'IfS',c,tb,eis,eb,l}),While:(c,b,l)=>({t:'While',c,b,l}),ForLoop:(vn,st,en,sp,it,b,l)=>({t:'ForLoop',vn,st,en,sp,it,b,l}),Repeat:(cnt,b,l)=>({t:'Repeat',cnt,b,l}),Break:(l)=>({t:'Break',l}),Cont:(l)=>({t:'Cont',l}),FnDecl:(n,ps,b,ia,l)=>({t:'FnDecl',n,ps,b,ia,l}),Ret:(v,l)=>({t:'Ret',v,l}),TryCatch:(tb,ev,cb,fb,l)=>({t:'TryCatch',tb,ev,cb,fb,l}),Raise:(e,l)=>({t:'Raise',e,l}),Import:(m,ns,l)=>({t:'Import',m,ns,l}),Match:(s,cs,db,l)=>({t:'Match',s,cs,db,l}),Class:(n,p,ms,l)=>({t:'Class',n,p,ms,l})};
class Parser{
  constructor(toks){this.toks=toks;this.pos=0;}
  cur(){return this.toks[this.pos];}
  pk(o=1){const i=this.pos+o;return i<this.toks.length?this.toks[i]:this.toks[this.toks.length-1];}
  adv(){const t=this.toks[this.pos];if(this.pos<this.toks.length-1)this.pos++;return t;}
  chk(t,v){const c=this.cur();return c.type===t&&(v===undefined||c.value===v);}
  mat(t,v){if(this.chk(t,v))return this.adv();return null;}
  expect(t,v,hint){if(this.chk(t,v))return this.adv();const c=this.cur();const what=v!==undefined?`'${v}'`:t;let msg=`Expected ${what} but found '${c.value}'.`;if(hint)msg+='\n  '+hint;throw new RenParseError(msg,c.line);}
  skipNL(){while(this.chk(TT.NEWLINE))this.adv();}
  atEnd(){return this.cur().type===TT.EOF;}
  parse(){const s=[];this.skipNL();while(!this.atEnd()){s.push(this.stmt());this.skipNL();}return N.Prog(s);}
  stmt(){
    const tok=this.cur();
    if(tok.type===TT.KEYWORD){
      const k=tok.value;
      if(k==='print')return this.parsePrint(true);if(k==='printraw')return this.parsePrint(false);
      if(k==='main')return this.parseMain();if(k==='if')return this.parseIf();
      if(k==='while')return this.parseWhile();if(k==='for')return this.parseFor();
      if(k==='repeat')return this.parseRepeat();if(k==='function')return this.parseFn(false);
      if(k==='async')return this.parseAsync();if(k==='return')return this.parseReturn();
      if(k==='break'){this.adv();return N.Break(tok.line);}if(k==='continue'){this.adv();return N.Cont(tok.line);}
      if(k==='try')return this.parseTry();if(k==='raise'){this.adv();return N.Raise(this.expr(),tok.line);}
      if(k==='import')return this.parseImport();if(k==='from')return this.parseFrom();
      if(k==='match')return this.parseMatch();if(k==='class')return this.parseClass();
      if(['number','text','bool','list','dict','set','any'].includes(k))return this.parseVar(false);
      if(k==='const')return this.parseVar(true);
    }
    if(tok.type===TT.IDENTIFIER&&this.pk().type===TT.IDENTIFIER)return this.parseClassVar();
    return this.parseAssign();
  }
  parsePrint(nl){const t=this.adv();if(this.chk(TT.NEWLINE)||this.atEnd())return N.Print(N.StrLit('',t.line),nl,t.line);return N.Print(this.expr(),nl,t.line);}
  parseMain(){this.adv();this.skipNL();const b=this.blockUntil(['end']);this.expect(TT.KEYWORD,'end');return b;}
  parseVar(ic){const tt=this.adv();const tn=tt.value;const nt=ic?this.expect(TT.IDENTIFIER,undefined,"After 'const', write the constant name."):this.expect(TT.IDENTIFIER,undefined,`After '${tn}', write the variable name.`);let v=null;if(this.mat(TT.EQ))v=this.expr();return N.VarDecl(ic?null:tn,nt.value,v,ic,tt.line);}
  parseClassVar(){const tt=this.adv();const nt=this.adv();let v=null;if(this.mat(TT.EQ))v=this.expr();return N.VarDecl(tt.value,nt.value,v,false,tt.line);}
  parseAssign(){const e=this.expr();if(this.mat(TT.EQ)){if(!['Id','Idx','Mem'].includes(e.t))throw new RenParseError("Left side of '=' must be a variable.",this.cur().line);return N.Assign(e,this.expr(),e.l);}return e;}
  parseIf(){const t=this.adv();const c=this.expr();this.skipNL();const tb=this.blockUntil(['elseif','else','end']);const eis=[];while(this.chk(TT.KEYWORD,'elseif')){this.adv();const ec=this.expr();this.skipNL();eis.push({c:ec,b:this.blockUntil(['elseif','else','end'])});}let eb=null;if(this.mat(TT.KEYWORD,'else')){this.skipNL();eb=this.blockUntil(['end']);}this.expect(TT.KEYWORD,'end',"Every 'if' must end with 'end'.");return N.IfS(c,tb,eis,eb,t.line);}
  parseWhile(){const t=this.adv();const c=this.expr();this.skipNL();const b=this.blockUntil(['end']);this.expect(TT.KEYWORD,'end',"Every 'while' must end with 'end'.");return N.While(c,b,t.line);}
  parseFor(){const t=this.adv();const vn=this.expect(TT.IDENTIFIER,undefined,"After 'for', write a variable name.").value;if(this.mat(TT.EQ)){const st=this.expr();this.expect(TT.KEYWORD,'to',"Numeric for-loop needs 'to'. E.g. for i = 1 to 10");const en=this.expr();let sp=null;if(this.mat(TT.KEYWORD,'step'))sp=this.expr();this.skipNL();const b=this.blockUntil(['end']);this.expect(TT.KEYWORD,'end');return N.ForLoop(vn,st,en,sp,null,b,t.line);}else if(this.chk(TT.KEYWORD,'in')){this.adv();const it=this.expr();this.skipNL();const b=this.blockUntil(['end']);this.expect(TT.KEYWORD,'end');return N.ForLoop(vn,null,null,null,it,b,t.line);}throw new RenParseError(`Expected '=' or 'in' after '${vn}'.\n  E.g. for i = 1 to 10 / for item in list`,t.line);}
  parseRepeat(){const t=this.adv();const cnt=this.expr();this.skipNL();const b=this.blockUntil(['end']);this.expect(TT.KEYWORD,'end');return N.Repeat(cnt,b,t.line);}
  parseFn(ia){const t=this.adv();const n=this.expect(TT.IDENTIFIER,undefined,"After 'function', write the function name.").value;this.expect(TT.LPAREN,undefined,`After '${n}', write '('.`);const ps=this.parseParams();this.expect(TT.RPAREN,undefined,"Close the parameter list with ')'."); this.skipNL();const b=this.blockUntil(['end']);this.expect(TT.KEYWORD,'end');return N.FnDecl(n,ps,b,ia,t.line);}
  parseAsync(){this.adv();this.expect(TT.KEYWORD,'function',"'async' must be followed by 'function'.");return this.parseFn(true);}
  parseParams(){const ps=[];if(this.chk(TT.RPAREN))return ps;do{ps.push(this.expect(TT.IDENTIFIER,undefined,"Parameter must be a name.").value);}while(this.mat(TT.COMMA));return ps;}
  parseReturn(){const t=this.adv();if(this.chk(TT.NEWLINE)||this.atEnd())return N.Ret(null,t.line);return N.Ret(this.expr(),t.line);}
  parseTry(){const t=this.adv();this.skipNL();const tb=this.blockUntil(['catch']);this.expect(TT.KEYWORD,'catch');let ev=null;if(this.chk(TT.IDENTIFIER))ev=this.adv().value;this.skipNL();const cb=this.blockUntil(['finally','end']);let fb=null;if(this.mat(TT.KEYWORD,'finally')){this.skipNL();fb=this.blockUntil(['end']);}this.expect(TT.KEYWORD,'end');return N.TryCatch(tb,ev,cb,fb,t.line);}
  parseImport(){const t=this.adv();const m=this.expect(TT.IDENTIFIER).value;return N.Import(m,null,t.line);}
  parseFrom(){const t=this.adv();const m=this.expect(TT.IDENTIFIER).value;this.expect(TT.KEYWORD,'import');const ns=[];do{ns.push(this.expect(TT.IDENTIFIER).value);}while(this.mat(TT.COMMA));return N.Import(m,ns,t.line);}
  parseMatch(){const t=this.adv();const sub=this.expr();this.skipNL();const cs=[];let db=null;while(!this.chk(TT.KEYWORD,'end')){if(this.chk(TT.KEYWORD,'case')){this.adv();const v=this.expr();this.skipNL();cs.push({v,b:this.blockUntil(['case','default','end'])});}else if(this.chk(TT.KEYWORD,'default')){this.adv();this.skipNL();db=this.blockUntil(['end']);break;}else break;this.skipNL();}this.expect(TT.KEYWORD,'end');return N.Match(sub,cs,db,t.line);}
  parseClass(){const t=this.adv();const n=this.expect(TT.IDENTIFIER).value;let p=null;if(this.mat(TT.KEYWORD,'extends'))p=this.expect(TT.IDENTIFIER).value;this.skipNL();const ms=[];while(!this.chk(TT.KEYWORD,'end')){this.skipNL();if(this.chk(TT.KEYWORD,'function'))ms.push(this.parseFn(false));else if(this.chk(TT.KEYWORD,'async'))ms.push(this.parseAsync());else break;this.skipNL();}this.expect(TT.KEYWORD,'end');return N.Class(n,p,ms,t.line);}
  blockUntil(stops){const s=[];this.skipNL();while(!this.atEnd()){if(this.cur().type===TT.KEYWORD&&stops.includes(this.cur().value))break;s.push(this.stmt());this.skipNL();}return N.Block(s);}
  expr(){return this.or();}
  or(){let L=this.and();while(this.chk(TT.KEYWORD,'or')){const op=this.adv().value;L=N.BinOp(L,op,this.and(),L.l);}return L;}
  and(){let L=this.notE();while(this.chk(TT.KEYWORD,'and')){const op=this.adv().value;L=N.BinOp(L,op,this.notE(),L.l);}return L;}
  notE(){if(this.chk(TT.KEYWORD,'not')){const t=this.adv();return N.UnOp('not',this.notE(),t.line);}return this.cmp();}
  cmp(){let L=this.add();const OPS=new Set([TT.EQEQ,TT.NEQ,TT.LT,TT.LTE,TT.GT,TT.GTE]);while(OPS.has(this.cur().type)){const op=this.adv().value;L=N.BinOp(L,op,this.add(),L.l);}return L;}
  add(){let L=this.mul();while(this.cur().type===TT.PLUS||this.cur().type===TT.MINUS){const op=this.adv().value;L=N.BinOp(L,op,this.mul(),L.l);}return L;}
  mul(){let L=this.unary();while([TT.STAR,TT.SLASH,TT.PERCENT].includes(this.cur().type)){const op=this.adv().value;L=N.BinOp(L,op,this.unary(),L.l);}return L;}
  unary(){if(this.cur().type===TT.MINUS){const t=this.adv();return N.UnOp('-',this.unary(),t.line);}return this.power();}
  power(){const b=this.postfix();if(this.cur().type===TT.POWER){const t=this.adv();return N.BinOp(b,'^',this.unary(),t.line);}return b;}
  postfix(){let e=this.primary();while(true){if(this.chk(TT.DOT)){this.adv();const m=this.expect(TT.IDENTIFIER).value;e=N.Mem(e,m,e.l);}else if(this.chk(TT.LBRACKET)){const t=this.adv();const i=this.expr();this.expect(TT.RBRACKET,undefined,"Close index with ']'.");e=N.Idx(e,i,t.line);}else if(this.chk(TT.LPAREN)){const t=this.adv();const a=[];if(!this.chk(TT.RPAREN)){do{a.push(this.expr());}while(this.mat(TT.COMMA));}this.expect(TT.RPAREN,undefined,"Close arguments with ')'.");e=N.Call(e,a,t.line);}else break;}return e;}
  primary(){const t=this.cur();if(t.type===TT.NUMBER){this.adv();return N.NumLit(t.value,t.line);}if(t.type===TT.STRING){this.adv();return N.StrLit(t.value,t.line);}if(t.type===TT.BOOL){this.adv();return N.BoolLit(t.value,t.line);}if(this.chk(TT.KEYWORD,'null')){this.adv();return N.NullLit(t.line);}if(this.chk(TT.KEYWORD,'self')){this.adv();return N.Id('self',t.line);}if(this.chk(TT.KEYWORD,'new')){this.adv();const n=this.expect(TT.IDENTIFIER,undefined,"After 'new', write the class name.").value;return N.Id(n,t.line);}if(this.chk(TT.KEYWORD,'await')){this.adv();return N.UnOp('await',this.primary(),t.line);}if(t.type===TT.LPAREN){this.adv();const e=this.expr();this.expect(TT.RPAREN);return e;}if(t.type===TT.LBRACKET){this.adv();const els=[];if(!this.chk(TT.RBRACKET)){do{els.push(this.expr());}while(this.mat(TT.COMMA));}this.expect(TT.RBRACKET);return N.ListLit(els,t.line);}if(this.chk(TT.KEYWORD,'input')){this.adv();return N.InputE(this.expr(),t.line);}if(t.type===TT.IDENTIFIER){this.adv();return N.Id(t.value,t.line);}if(t.type===TT.KEYWORD&&['end','else','elseif'].includes(t.value))throw new RenParseError(`Unexpected '${t.value}' — did you close a block too early?`,t.line);throw new RenParseError(`Unexpected token: '${t.value}'\n  Expected a value, variable, or expression.`,t.line);}
}
class RetSig{constructor(v){this.v=v;}}
class BrkSig{}
class CntSig{}
class Env{
  constructor(parent=null){this.v=new Map();this.c=new Set();this.p=parent;}
  get(n,l){if(this.v.has(n))return this.v.get(n);if(this.p)return this.p.get(n,l);throw new RenRuntimeError(`Variable '${n}' does not exist.\n  Did you declare it with 'number', 'text', or 'bool'?`,l);}
  set(n,val,l){if(this.v.has(n)){if(this.c.has(n))throw new RenRuntimeError(`Cannot change '${n}' — it is a constant.`,l);this.v.set(n,val);return;}if(this.p){this.p.set(n,val,l);return;}throw new RenRuntimeError(`Variable '${n}' not declared.\n  Use: number ${n} = ...`,l);}
  def(n,val,isConst=false){this.v.set(n,val);if(isConst)this.c.add(n);}
}
class RenFn{constructor(n,ps,b,cl,ia=false){this.n=n;this.ps=ps;this.b=b;this.cl=cl;this.ia=ia;}toString(){return `<function ${this.n}>`;}}
class RenClass{constructor(n,p,ms){this.n=n;this.p=p;this.ms=ms;}toString(){return `<class ${this.n}>`;}}
class RenInst{constructor(k){this.k=k;this.a=new Map();}findMethod(n){let k=this.k;while(k){if(k.ms.has(n))return k.ms.get(n);k=k.p;}return null;}getAttr(n,l){if(this.a.has(n))return this.a.get(n);const m=this.findMethod(n);if(m)return m;throw new RenRuntimeError(`'${this.k.n}' has no attribute '${n}'.`,l);}toString(){return `<${this.k.n} object>`;}}
function renStr(v){if(v===null||v===undefined)return 'null';if(v===true)return 'true';if(v===false)return 'false';if(typeof v==='number'){if(Number.isInteger(v))return String(v);return String(v);}if(Array.isArray(v))return '['+v.map(renStr).join(', ')+']';if(v instanceof RenFn||v instanceof RenClass||v instanceof RenInst)return v.toString();if(typeof v==='function')return '<builtin>';if(typeof v==='object'&&v!==null)return '<module>';return String(v);}
function makeGlobal(outputFn){
  const e=new Env();const def=(n,v)=>e.def(n,v);
  def('sqrt',a=>Math.sqrt(a[0]));def('abs',a=>Math.abs(a[0]));def('floor',a=>Math.floor(a[0]));def('ceil',a=>Math.ceil(a[0]));
  def('round',a=>a.length>1?parseFloat(a[0].toFixed(a[1])):Math.round(a[0]));def('pow',a=>Math.pow(a[0],a[1]));
  def('log',a=>a.length===1?Math.log(a[0]):Math.log(a[0])/Math.log(a[1]));
  def('sin',a=>Math.sin(a[0]));def('cos',a=>Math.cos(a[0]));def('tan',a=>Math.tan(a[0]));
  def('pi',Math.PI);def('random',a=>Math.random());def('randint',a=>Math.floor(Math.random()*(a[1]-a[0]+1))+a[0]);
  def('toNumber',a=>{const n=Number(a[0]);return isNaN(n)?0:n;});def('toText',a=>renStr(a[0]));
  def('toBool',a=>Boolean(a[0]));def('toInt',a=>Math.trunc(Number(a[0])));def('toFloat',a=>parseFloat(a[0]));
  def('isNumber',a=>typeof a[0]==='number');def('isText',a=>typeof a[0]==='string');
  def('isBool',a=>typeof a[0]==='boolean');def('isList',a=>Array.isArray(a[0]));def('isNull',a=>a[0]===null||a[0]===undefined);
  def('len',a=>Array.isArray(a[0])?a[0].length:String(a[0]).length);
  def('upper',a=>String(a[0]).toUpperCase());def('lower',a=>String(a[0]).toLowerCase());def('trim',a=>String(a[0]).trim());
  def('split',a=>String(a[0]).split(a[1]??''));def('join',a=>a[0].map(renStr).join(a[1]??', '));
  def('contains',a=>Array.isArray(a[0])?a[0].includes(a[1]):String(a[0]).includes(a[1]));
  def('startsWith',a=>String(a[0]).startsWith(a[1]));def('endsWith',a=>String(a[0]).endsWith(a[1]));
  def('replace',a=>String(a[0]).split(a[1]).join(a[2]));def('charAt',a=>String(a[0])[a[1]]??null);
  def('indexOf',a=>Array.isArray(a[0])?a[0].indexOf(a[1]):String(a[0]).indexOf(a[1]));
  def('substring',a=>String(a[0]).slice(a[1],a[2]));
  def('append',a=>{a[0].push(a[1]);return a[0];});def('remove',a=>{const i=a[0].indexOf(a[1]);if(i>=0)a[0].splice(i,1);return a[0];});
  def('pop',a=>a[0].pop());def('insert',a=>{a[0].splice(a[1],0,a[2]);return a[0];});
  def('sort',a=>[...a[0]].sort((x,y)=>typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y))));
  def('reverse',a=>[...a[0]].reverse());def('first',a=>a[0][0]??null);def('last',a=>a[0][a[0].length-1]??null);
  def('range',a=>{if(a.length===1)return Array.from({length:a[0]},(_,i)=>i);if(a.length===2)return Array.from({length:a[1]-a[0]},(_,i)=>i+a[0]);const r=[];for(let i=a[0];i<a[1];i+=a[2])r.push(i);return r;});
  return e;
}
const MODULES={math:{_isModule:true,pi:Math.PI,e:Math.E,sqrt:a=>Math.sqrt(a[0]),sin:a=>Math.sin(a[0]),cos:a=>Math.cos(a[0]),tan:a=>Math.tan(a[0]),floor:a=>Math.floor(a[0]),ceil:a=>Math.ceil(a[0]),abs:a=>Math.abs(a[0]),log:a=>a.length===1?Math.log(a[0]):Math.log(a[0])/Math.log(a[1]),pow:a=>Math.pow(a[0],a[1]),round:a=>Math.round(a[0])},random:{_isModule:true,random:a=>Math.random(),randint:a=>Math.floor(Math.random()*(a[1]-a[0]+1))+a[0],choice:a=>a[0][Math.floor(Math.random()*a[0].length)]},string:{_isModule:true,upper:a=>String(a[0]).toUpperCase(),lower:a=>String(a[0]).toLowerCase(),len:a=>String(a[0]).length,reverse:a=>String(a[0]).split('').reverse().join('')}};
const MAX_STEPS=500000;
class Interpreter{
  constructor(outputFn){this.out=outputFn;this.global=makeGlobal(outputFn);this.steps=0;}
  tick(){if(++this.steps>MAX_STEPS)throw new RenRuntimeError('Execution limit reached — possible infinite loop!',null);}
  run(prog){this.exec(prog.s?N.Block(prog.s):prog,this.global);}
  exec(node,env){
    this.tick();
    switch(node.t){
      case 'Block':for(const s of node.s)this.exec(s,env);break;
      case 'Print':{const v=this.eval(node.e,env);this.out(renStr(v)+(node.nl?'\n':''));break;}
      case 'VarDecl':{const v=node.v?this.eval(node.v,env):null;env.def(node.n,v,node.ic);break;}
      case 'Assign':{const v=this.eval(node.v,env);const ta=node.ta;if(ta.t==='Id')env.set(ta.n,v,ta.l);else if(ta.t==='Idx'){const o=this.eval(ta.o,env);const i=this.eval(ta.i,env);if(Array.isArray(o))o[i]=v;else if(o instanceof Map)o.set(i,v);else o[i]=v;}else if(ta.t==='Mem'){const o=this.eval(ta.o,env);if(o instanceof RenInst)o.a.set(ta.m,v);else throw new RenRuntimeError('Cannot set member on non-object.',ta.l);}break;}
      case 'IfS':{if(this.eval(node.c,env)){this.exec(node.tb,env);}else{let done=false;for(const ei of node.eis){if(this.eval(ei.c,env)){this.exec(ei.b,env);done=true;break;}}if(!done&&node.eb)this.exec(node.eb,env);}break;}
      case 'While':{while(this.eval(node.c,env)){this.tick();try{this.exec(node.b,new Env(env));}catch(e){if(e instanceof BrkSig)break;if(e instanceof CntSig)continue;throw e;}}break;}
      case 'ForLoop':{if(node.it){const col=this.eval(node.it,env);for(const item of col){this.tick();const ie=new Env(env);ie.def(node.vn,item);try{this.exec(node.b,ie);}catch(e){if(e instanceof BrkSig)break;if(e instanceof CntSig)continue;throw e;}}}else{let i=this.eval(node.st,env);const end=this.eval(node.en,env);const sp=node.sp?this.eval(node.sp,env):1;while(sp>0?i<=end:i>=end){this.tick();const ie=new Env(env);ie.def(node.vn,i);try{this.exec(node.b,ie);}catch(e){if(e instanceof BrkSig)break;if(e instanceof CntSig){i+=sp;continue;}throw e;}i+=sp;}}break;}
      case 'Repeat':{const cnt=Math.floor(this.eval(node.cnt,env));for(let i=0;i<cnt;i++){this.tick();try{this.exec(node.b,new Env(env));}catch(e){if(e instanceof BrkSig)break;if(e instanceof CntSig)continue;throw e;}}break;}
      case 'Break':throw new BrkSig();
      case 'Cont':throw new CntSig();
      case 'FnDecl':env.def(node.n,new RenFn(node.n,node.ps,node.b,env,node.ia));break;
      case 'Ret':{const v=node.v?this.eval(node.v,env):null;throw new RetSig(v);}
      case 'TryCatch':{try{this.exec(node.tb,new Env(env));}catch(e){if(e instanceof RetSig||e instanceof BrkSig||e instanceof CntSig)throw e;const ce=new Env(env);if(node.ev)ce.def(node.ev,e.message||String(e));this.exec(node.cb,ce);}finally{if(node.fb)this.exec(node.fb,new Env(env));}break;}
      case 'Raise':throw new RenRuntimeError(renStr(this.eval(node.e,env)),node.l);
      case 'Import':{const mod=MODULES[node.m];if(!mod)throw new RenRuntimeError(`Module '${node.m}' not found.\n  Available: ${Object.keys(MODULES).join(', ')}`,node.l);if(node.ns){for(const n of node.ns){if(!(n in mod))throw new RenRuntimeError(`Module '${node.m}' has no export '${n}'.`,node.l);env.def(n,mod[n]);}}else{env.def(node.m,mod);}break;}
      case 'Match':{const sub=this.eval(node.s,env);let matched=false;for(const {v,b} of node.cs){if(sub===this.eval(v,env)){this.exec(b,new Env(env));matched=true;break;}}if(!matched&&node.db)this.exec(node.db,new Env(env));break;}
      case 'Class':{let parent=null;if(node.p)parent=env.get(node.p,node.l);const ms=new Map();const te=new Env(env);for(const m of node.ms)ms.set(m.n,new RenFn(m.n,m.ps,m.b,te,m.ia));env.def(node.n,new RenClass(node.n,parent,ms));break;}
      default:this.eval(node,env);
    }
  }
  eval(node,env){
    this.tick();
    switch(node.t){
      case 'NumLit':return node.v;case 'StrLit':return node.v;case 'BoolLit':return node.v;case 'NullLit':return null;
      case 'Id':return env.get(node.n,node.l);
      case 'ListLit':return node.els.map(e=>this.eval(e,env));
      case 'BinOp':{const op=node.op;if(op==='and')return Boolean(this.eval(node.L,env))&&Boolean(this.eval(node.R,env));if(op==='or')return Boolean(this.eval(node.L,env))||Boolean(this.eval(node.R,env));const L=this.eval(node.L,env),R=this.eval(node.R,env);switch(op){case '+':if(typeof L==='string'||typeof R==='string')return renStr(L)+renStr(R);if(Array.isArray(L))return[...L,...R];return L+R;case '-':return L-R;case '*':if(typeof L==='string')return L.repeat(Math.floor(R));return L*R;case '/':if(R===0)throw new RenRuntimeError('Division by zero.',node.l);return L/R;case '%':return L%R;case '^':return Math.pow(L,R);case '==':return L===R;case '!=':return L!==R;case '<':return L<R;case '<=':return L<=R;case '>':return L>R;case '>=':return L>=R;default:throw new RenRuntimeError(`Unknown operator: ${op}`,node.l);}}
      case 'UnOp':{if(node.op==='-')return -this.eval(node.o,env);if(node.op==='not')return !this.eval(node.o,env);return this.eval(node.o,env);}
      case 'Idx':{const o=this.eval(node.o,env),i=this.eval(node.i,env);if(Array.isArray(o)){const idx=i<0?o.length+i:i;if(idx<0||idx>=o.length)throw new RenRuntimeError(`Index ${i} out of range.`,node.l);return o[idx];}if(o instanceof Map)return o.get(i)??null;if(typeof o==='string')return o[i]??null;throw new RenRuntimeError(`Cannot index '${renStr(o)}'.`,node.l);}
      case 'Mem':{const o=this.eval(node.o,env),m=node.m;if(typeof o==='string')return this.strMethod(o,m,node.l);if(Array.isArray(o))return this.listMethod(o,m,node.l);if(o instanceof RenInst){const a=o.getAttr(m,node.l);if(a instanceof RenFn)return{_bound:true,fn:a,inst:o};return a;}if(o&&typeof o==='object'){if(m in o)return o[m];throw new RenRuntimeError(`Module has no member '${m}'.`,node.l);}throw new RenRuntimeError(`Cannot access '${m}' on ${renStr(o)}.`,node.l);}
      case 'Call':{const c=this.eval(node.c,env);const a=node.a.map(x=>this.eval(x,env));if(c&&c._bound)return this.callRenFn(c.fn,a,c.inst);if(c instanceof RenFn)return this.callRenFn(c,a,null);if(c instanceof RenClass){const inst=new RenInst(c);const init=inst.findMethod('init');if(init)this.callRenFn(init,a,inst);return inst;}if(typeof c==='function'){try{return c(a)??null;}catch(e){throw new RenRuntimeError(String(e.message||e),node.l);}}throw new RenRuntimeError(`'${renStr(c)}' is not a function.`,node.l);}
      case 'InputE':{const p=renStr(this.eval(node.p,env));const r=window.prompt(p);return r===null?'':r;}
      default:throw new RenRuntimeError(`Cannot evaluate: ${node.t}`,null);
    }
  }
  callRenFn(fn,args,self){const e=new Env(fn.cl);if(self)e.def('self',self);fn.ps.forEach((p,i)=>e.def(p,args[i]??null));try{this.exec(fn.b,e);return null;}catch(ex){if(ex instanceof RetSig)return ex.v;throw ex;}}
  strMethod(s,m,l){const ms={upper:a=>s.toUpperCase(),lower:a=>s.toLowerCase(),trim:a=>s.trim(),len:a=>s.length,split:a=>s.split(a[0]??''),contains:a=>s.includes(a[0]),startsWith:a=>s.startsWith(a[0]),endsWith:a=>s.endsWith(a[0]),replace:a=>s.split(a[0]).join(a[1]),charAt:a=>s[a[0]]??null,indexOf:a=>s.indexOf(a[0]),substring:a=>s.slice(a[0],a[1]),toNumber:a=>parseFloat(s)};if(m in ms)return ms[m];throw new RenRuntimeError(`text has no method '${m}'.`,l);}
  listMethod(lst,m,l){const ms={append:a=>{lst.push(a[0]);return lst;},remove:a=>{const i=lst.indexOf(a[0]);if(i>=0)lst.splice(i,1);return lst;},pop:a=>lst.pop(),insert:a=>{lst.splice(a[0],0,a[1]);return lst;},len:a=>lst.length,contains:a=>lst.includes(a[0]),sort:a=>[...lst].sort((x,y)=>typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y))),reverse:a=>[...lst].reverse(),first:a=>lst[0]??null,last:a=>lst[lst.length-1]??null,join:a=>lst.map(renStr).join(a[0]??', ')};if(m in ms)return ms[m];throw new RenRuntimeError(`list has no method '${m}'.`,l);}
}
function runRen(source,outputFn){
  try{const tokens=new Lexer(source).tokenize();const ast=new Parser(tokens).parse();const interp=new Interpreter(outputFn);for(const stmt of ast.s)interp.exec(stmt,interp.global);return{ok:true};}
  catch(e){if(e.kind)return{ok:false,kind:e.kind,message:e.message,line:e.line};return{ok:false,kind:'ERROR',message:String(e),line:null};}
}

// ── CodeMirror Mode ──
CodeMirror.defineMode('ren',()=>{
  const keywords=new Set(['print','printraw','input','main','end','number','text','bool','list','dict','set','const','any','if','else','elseif','for','while','repeat','in','to','step','break','continue','function','return','and','or','not','try','catch','finally','raise','class','self','new','extends','import','from','match','case','default','async','await','null']);
  const builtins=new Set(['sqrt','abs','floor','ceil','round','pow','log','sin','cos','tan','pi','random','randint','toNumber','toText','toBool','toInt','toFloat','isNumber','isText','isBool','isList','isNull','len','upper','lower','trim','split','join','contains','startsWith','endsWith','replace','charAt','indexOf','substring','append','remove','pop','insert','sort','reverse','first','last','range','math','string']);
  return{startState:()=>({inBlockComment:false}),token(stream,state){if(state.inBlockComment){if(stream.match('---')){state.inBlockComment=false;return 'comment';}stream.next();return 'comment';}if(stream.match('---')){state.inBlockComment=true;return 'comment';}if(stream.match('--')){stream.skipToEnd();return 'comment';}if(stream.match('"')){let ch;while((ch=stream.next())!=null){if(ch==='"')break;if(ch==='\\')stream.next();}return 'string';}if(stream.match(/^-?\d+(\.\d+)?/)){return 'number';}if(stream.match(/^[a-zA-Z_]\w*/)){const word=stream.current();if(word==='true'||word==='false')return 'atom';if(keywords.has(word))return 'keyword';if(builtins.has(word))return 'builtin';if(stream.peek()==='(')return 'def';return 'variable';}if(stream.match(/^[+\-*/%^<>=!]+/))return 'operator';stream.next();return null;}};
});

// ── Examples ──
const EXAMPLES={
hello:`-- 👋 Hello World in Ren!
print "Hello, World!"
print "Welcome to Ren — simple, powerful, fun."
print ""
print 42
print 3.14
print 10 + 5
print "Two plus two = " + toText(2 + 2)`,
variables:`-- 📦 Variables & Math in Ren
number age = 16
text name = "Alice"
bool isStudent = true
const PI = 3.14159

print "Name: " + name
print "Age:  " + toText(age)
print "Is student: " + toText(isStudent)
print "PI = " + toText(PI)
print ""
print "=== Math Operations ==="
number x = 10
number y = 3
print "x + y = " + toText(x + y)
print "x - y = " + toText(x - y)
print "x * y = " + toText(x * y)
print "x / y = " + toText(x / y)
print "x % y = " + toText(x % y)
print "x ^ 2 = " + toText(x ^ 2)
print "sqrt(144) = " + toText(sqrt(144))`,
conditions:`-- 🔀 Conditions in Ren
number score = 85
if score >= 90
    print "Grade: A — Excellent! 🌟"
elseif score >= 80
    print "Grade: B — Great work! 👍"
elseif score >= 70
    print "Grade: C — Keep going! 💪"
else
    print "Grade: F — Please try again."
end
print ""
bool raining = true
bool haveUmbrella = false
if raining and not haveUmbrella
    print "You will get wet! ☔"
elseif raining and haveUmbrella
    print "Smart — you brought an umbrella! 🌂"
else
    print "Enjoy the sunny weather! ☀️"
end`,
loops:`-- 🔁 All Loop Types in Ren
print "=== Numeric For Loop ==="
for i = 1 to 5
    print i
end
print ""
print "=== Countdown (step -1) ==="
for i = 5 to 1 step -1
    printraw toText(i) + " "
end
print ""
print ""
print "=== While Loop ==="
number count = 0
while count < 4
    count = count + 1
    print "Count: " + toText(count)
end
print ""
print "=== Repeat 3 Times ==="
repeat 3
    print "Ren is awesome! 🚀"
end
print ""
print "=== For-In (list) ==="
list fruits = ["apple", "banana", "cherry"]
for fruit in fruits
    print "  🍎 " + fruit
end`,
functions:`-- ⚙️ Functions in Ren
function greet(name)
    print "Hello, " + name + "! 👋"
end
greet("Alice")
greet("Bob")
print ""
function add(a, b)
    return a + b
end
print "3 + 4 = " + toText(add(3, 4))
print ""
function grade(score)
    if score >= 90
        return "A"
    elseif score >= 80
        return "B"
    elseif score >= 70
        return "C"
    else
        return "F"
    end
end
print "Score 95 → " + grade(95)
print "Score 72 → " + grade(72)
print ""
function factorial(n)
    if n <= 1
        return 1
    end
    return n * factorial(n - 1)
end
print "5! = " + toText(factorial(5))
print "10! = " + toText(factorial(10))`,
lists:`-- 📋 Lists & Arrays in Ren
list nums = [10, 3, 7, 1, 9, 4, 6, 2, 8, 5]
print "Original: " + toText(nums)
print "Length:   " + toText(len(nums))
print "First:    " + toText(first(nums))
print "Last:     " + toText(last(nums))
print "Sorted:   " + toText(sort(nums))
print "Reversed: " + toText(reverse(nums))
print ""
list colors = ["red", "green", "blue"]
append(colors, "purple")
print "After append: " + toText(colors)
remove(colors, "green")
print "After remove: " + toText(colors)
print ""
print "Index 0: " + colors[0]
print ""
print "All colors:"
for color in colors
    print "  • " + color
end
print ""
print "range(5) = " + toText(range(5))`,
fizzbuzz:`-- 🎯 FizzBuzz
for i = 1 to 30
    if i % 15 == 0
        print "FizzBuzz 🎉"
    elseif i % 3 == 0
        print "Fizz"
    elseif i % 5 == 0
        print "Buzz"
    else
        print i
    end
end`,
fibonacci:`-- 🐚 Fibonacci
function fibonacci(n)
    if n <= 0
        return 0
    end
    if n == 1
        return 1
    end
    return fibonacci(n - 1) + fibonacci(n - 2)
end
print "First 12 Fibonacci numbers:"
for i = 0 to 11
    printraw toText(fibonacci(i)) + "  "
end
print ""
print ""
function fibFast(n)
    if n <= 1
        return n
    end
    number a = 0
    number b = 1
    for i = 2 to n
        number temp = a + b
        a = b
        b = temp
    end
    return b
end
print "fib(20) = " + toText(fibFast(20))
print "fib(30) = " + toText(fibFast(30))`,
classes:`-- 🏗️ Classes & Inheritance
class Animal
    function init(name, sound)
        self.name = name
        self.sound = sound
        self.tricks = []
    end
    function speak()
        print self.name + " says: " + self.sound + "!"
    end
    function learnTrick(trick)
        append(self.tricks, trick)
        print self.name + " learned: " + trick + " ✓"
    end
    function showTricks()
        if len(self.tricks) == 0
            print self.name + " knows no tricks."
            return
        end
        print self.name + "'s tricks:"
        for trick in self.tricks
            print "  ⭐ " + trick
        end
    end
end
class Dog extends Animal
    function fetch(item)
        print self.name + " fetches the " + item + "! 🎾"
    end
end
Dog rex = new Dog("Rex", "Woof")
rex.speak()
rex.learnTrick("sit")
rex.learnTrick("shake hands")
rex.fetch("ball")
print ""
rex.showTricks()`,
errhandling:`-- 🛡️ Error Handling
print "=== Basic Try/Catch ==="
try
    raise "Something went wrong!"
catch err
    print "Caught: " + err
end
print ""
function safeDivide(a, b)
    try
        if b == 0
            raise "Cannot divide by zero!"
        end
        return a / b
    catch err
        print "Error: " + err
        return null
    end
end
print "10 / 2 = " + toText(safeDivide(10, 2))
print "5  / 0 = " + toText(safeDivide(5, 0))
print ""
try
    print "Trying..."
    raise "Oops!"
catch e
    print "Caught: " + e
finally
    print "Finally always runs! ✅"
end`,
match:`-- 🎲 Pattern Matching
number day = 3
match day
    case 1
        print "Monday — Fresh start! ☀️"
    case 2
        print "Tuesday"
    case 3
        print "Wednesday — Midweek! 🐪"
    case 4
        print "Thursday"
    case 5
        print "Friday — Almost weekend! 🎉"
    default
        print "Weekend! 🏖️"
end
print ""
number status = 404
match status
    case 200
        print "200 OK ✅"
    case 404
        print "404 Not Found 🔍"
    case 500
        print "500 Server Error 💥"
    default
        print "Unknown: " + toText(status)
end`,
sorting:`-- 📊 Sorting Algorithms
function bubbleSort(arr)
    number n = len(arr)
    for i = 0 to n - 1
        for j = 0 to n - i - 2
            if arr[j] > arr[j + 1]
                number temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
            end
        end
    end
    return arr
end
list nums = [64, 34, 25, 12, 22, 11, 90, 45]
print "Original:    " + toText(nums)
list sorted = bubbleSort(nums)
print "Bubble sort: " + toText(sorted)
print ""
list data = [5, 2, 9, 1, 7, 3, 8, 4, 6]
print "Built-in sort: " + toText(sort(data))`,
calculator:`-- 🧮 Calculator App
function calculate(a, op, b)
    if op == "+"
        return a + b
    elseif op == "-"
        return a - b
    elseif op == "*"
        return a * b
    elseif op == "/"
        if b == 0
            return "Error: Division by zero"
        end
        return a / b
    elseif op == "%"
        return a % b
    elseif op == "^"
        return a ^ b
    else
        return "Unknown operator"
    end
end
function show(a, op, b)
    print toText(a) + " " + op + " " + toText(b) + " = " + toText(calculate(a, op, b))
end
print "=== Ren Calculator ==="
show(15, "+", 7)
show(15, "-", 7)
show(6, "*", 8)
show(22, "/", 7)
show(17, "%", 5)
show(2, "^", 10)
show(10, "/", 0)`,
};

// ── Docs System ──
const DOCS_SECTIONS=[
  {id:'basics',title:'Basics',icon:'🚀',items:[{id:'intro',title:'What is Ren?'},{id:'comments',title:'Comments'},{id:'print',title:'Printing Output'},{id:'syntax',title:'Syntax Rules'}]},
  {id:'types',title:'Data Types',icon:'📊',items:[{id:'numbers',title:'Numbers'},{id:'text',title:'Text (Strings)'},{id:'booleans',title:'Booleans'},{id:'lists',title:'Lists'},{id:'null',title:'Null'}]},
  {id:'vars',title:'Variables',icon:'📦',items:[{id:'var-decl',title:'Declaring Variables'},{id:'constants',title:'Constants'},{id:'assignment',title:'Updating Values'},{id:'type-convert',title:'Type Conversion'}]},
  {id:'ops',title:'Operators',icon:'⚡',items:[{id:'arithmetic',title:'Arithmetic'},{id:'comparison',title:'Comparison'},{id:'logical',title:'Logical'},{id:'string-ops',title:'String Ops'}]},
  {id:'control',title:'Control Flow',icon:'🔀',items:[{id:'if-else',title:'If / Elseif / Else'},{id:'match',title:'Pattern Matching'},{id:'for-loop',title:'For Loops'},{id:'while-loop',title:'While Loop'},{id:'repeat-loop',title:'Repeat Loop'},{id:'break-continue',title:'Break & Continue'}]},
  {id:'fns',title:'Functions',icon:'⚙️',items:[{id:'fn-declare',title:'Declaring Functions'},{id:'fn-params',title:'Parameters'},{id:'fn-return',title:'Return Values'},{id:'recursion',title:'Recursion'}]},
  {id:'oop',title:'Classes',icon:'🏗️',items:[{id:'classes',title:'Defining Classes'},{id:'methods',title:'Methods & self'},{id:'inheritance',title:'Inheritance'},{id:'instantiation',title:'Creating Objects'}]},
  {id:'errors',title:'Error Handling',icon:'🛡️',items:[{id:'try-catch',title:'Try / Catch'},{id:'raise',title:'Raising Errors'},{id:'finally',title:'Finally Block'},{id:'common-errors',title:'Common Errors'}]},
  {id:'stdlib',title:'Standard Library',icon:'🔧',items:[{id:'math-fns',title:'Math Functions'},{id:'string-fns',title:'String Functions'},{id:'list-fns',title:'List Functions'},{id:'modules',title:'Modules (import)'}]},
  {id:'rules',title:'All Rules',icon:'📋',items:[{id:'all-rules',title:'Complete Rule Reference'}]},
];

function hl(code){
  return code
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\b(print|printraw|if|elseif|else|end|for|while|repeat|function|return|class|extends|self|new|try|catch|finally|raise|match|case|default|import|from|in|to|step|break|continue|and|or|not|number|text|bool|list|const|null|any|async|await)\b/g,'<span class="kw">$1</span>')
    .replace(/"([^"]*)"/g,'<span class="str">"$1"</span>')
    .replace(/\b(true|false)\b/g,'<span class="num">$1</span>')
    .replace(/--[^\n]*/g,'<span class="cmt">$&</span>')
    .replace(/\b(\d+\.?\d*)\b(?![^<>]*<\/span>)/g,'<span class="num">$1</span>')
    .replace(/\b(sqrt|abs|floor|ceil|round|pow|len|upper|lower|trim|split|join|append|remove|sort|reverse|range|toText|toNumber|toBool|contains|first|last|print|input|randint|random)(?=\()/g,'<span class="builtin">$1</span>');
}
function cb(code,output=null,runnable=true){
  const runBtn=runnable?`<button class="code-block-run" onclick="loadInEditor(${JSON.stringify(code)})">Load ▶</button>`:'';
  const out=output?`<div class="code-output"><span class="code-output-label">OUT</span><span>${output}</span></div>`:'';
  return `<div class="code-block"><div class="code-block-header"><span class="code-block-lang">ren</span><div class="code-block-actions"><button class="code-block-copy" onclick="copyCode(this,${JSON.stringify(code)})">Copy</button>${runBtn}</div></div><pre>${hl(code)}</pre>${out}</div>`;
}
function errBlock(code,why){return `<div class="error-example"><div class="error-example-header">❌ Common Mistake</div><pre>${code}</pre><div class="why">💡 <strong>Why:</strong> ${why}</div></div>`;}
function tbl(headers,rows){return `<table class="syntax-table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}

const DOC_PAGES={
intro:`<div class="doc-hero"><div class="doc-hero-title">🚀 What is Ren?</div><div class="doc-hero-desc">Ren is a clean, beginner-friendly programming language. No curly braces, no semicolons — just readable code.</div></div>
<div class="doc-section"><div class="doc-section-title">Key Features</div>${tbl(['Feature','Description'],[['Clean syntax','No {}, no ;, indentation optional'],['Typed variables','number, text, bool, list'],['All loop types','for, while, repeat, for-in'],['Functions','With recursion support'],['Classes','Full OOP with inheritance'],['Error handling','try/catch/finally']])}</div>
<div class="doc-section"><div class="doc-section-title">Your First Program</div>${cb('print "Hello, World!"','Hello, World!')}${cb('number x = 10\nprint x * 2','20')}</div>`,
comments:`<div class="doc-hero"><div class="doc-hero-title">💬 Comments</div><div class="doc-hero-desc">Comments are notes — ignored by Ren when running.</div></div>
<div class="doc-section"><div class="doc-section-title">Single-line</div>${cb('-- This is a comment\nprint "Hello"   -- inline comment','Hello')}</div>
<div class="doc-section"><div class="doc-section-title">Multi-line Block</div>${cb('---\nThis is a\nmulti-line comment.\n---\nprint "After comment"','After comment')}</div>`,
print:`<div class="doc-hero"><div class="doc-hero-title">🖨️ Printing Output</div><div class="doc-hero-desc"><code>print</code> adds a newline. <code>printraw</code> does not.</div></div>
<div class="doc-section"><div class="doc-section-title">Examples</div>${cb('print "Hello"\nprintraw "A"\nprintraw "B"\nprint ""\nprint 42 + 8','Hello\nAB\n50')}</div>`,
syntax:`<div class="doc-hero"><div class="doc-hero-title">📝 Syntax Rules</div></div>
<div class="doc-section"><div class="doc-section-title">Core Rules</div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">1</div><div class="doc-rule-name">One statement per line</div></div><div class="doc-rule-body">${cb('print "Hello"\nprint "World"','Hello\nWorld')}</div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">2</div><div class="doc-rule-name">Blocks end with <code>end</code></div></div><div class="doc-rule-body">${cb('if true\n    print "yes"\nend','yes')}</div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">3</div><div class="doc-rule-name">Strings use double quotes only</div></div><div class="doc-rule-body">${errBlock("print 'hello'  -- Error!","Ren uses double quotes: <code>print \"hello\"</code>")}</div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">4</div><div class="doc-rule-name">Case sensitive</div></div><div class="doc-rule-body"><div class="doc-rule-desc"><code>Print</code> ≠ <code>print</code>. Keywords are lowercase only.</div></div></div></div>`,
numbers:`<div class="doc-hero"><div class="doc-hero-title">🔢 Numbers</div></div>
<div class="doc-section"><div class="doc-section-title">Examples</div>${cb('number x = 42\nnumber pi = 3.14\nprint x * 2\nprint pi','84\n3.14')}</div>
<div class="doc-section"><div class="doc-section-title">Operators</div>${tbl(['Op','Meaning','Example','Result'],[['+','Add','5+3','8'],['-','Subtract','10-4','6'],['*','Multiply','3*7','21'],['/','Divide','10/4','2.5'],['%','Remainder','10%3','1'],['^','Power','2^8','256']])}</div>`,
text:`<div class="doc-hero"><div class="doc-hero-title">📝 Text (Strings)</div></div>
<div class="doc-section"><div class="doc-section-title">Creating & Combining</div>${cb('text name = "Alice"\ntext greeting = "Hello, " + name + "!"\nprint greeting\nprint "Ha" * 3','Hello, Alice!\nHaHaHa')}</div>
<div class="doc-section"><div class="doc-section-title">Escape Characters</div>${tbl(['Escape','Meaning'],[['\\n','New line'],['\\t','Tab'],['\\"','Double quote'],['\\\\','Backslash']])}${cb('print "Line 1\\nLine 2"','Line 1\nLine 2')}</div>`,
booleans:`<div class="doc-hero"><div class="doc-hero-title">✅ Booleans</div><div class="doc-hero-desc">true or false. Used in conditions.</div></div>
${cb('bool x = true\nbool y = false\nprint x\nprint not x\nprint x and y\nprint x or y','true\nfalse\nfalse\ntrue')}`,
lists:`<div class="doc-hero"><div class="doc-hero-title">📋 Lists</div><div class="doc-hero-desc">Ordered collections. Index starts at 0.</div></div>
<div class="doc-section"><div class="doc-section-title">Creating & Accessing</div>${cb('list fruits = ["apple", "banana", "cherry"]\nprint fruits[0]\nprint len(fruits)','apple\n3')}</div>
<div class="doc-section"><div class="doc-section-title">Modifying</div>${cb('list nums = [1,2,3]\nappend(nums, 4)\nprint nums\nnums[0] = 99\nprint nums','[1, 2, 3, 4]\n[99, 2, 3, 4]')}</div>`,
null:`<div class="doc-hero"><div class="doc-hero-title">∅ Null</div><div class="doc-hero-desc">Represents absence of a value.</div></div>
${cb('number x\nprint x\nprint isNull(x)','null\ntrue')}`,
'var-decl':`<div class="doc-hero"><div class="doc-hero-title">📦 Declaring Variables</div></div>
<div class="doc-section"><div class="doc-section-title">Syntax</div>${cb('number age = 25\ntext city = "London"\nbool active = true\nlist items = [1, 2, 3]\nnumber count\nprint count','25\nLondon\ntrue\n[1, 2, 3]\nnull')}</div>
<div class="doc-section"><div class="doc-section-title">Types</div>${tbl(['Keyword','Holds','Example'],[['number','integers, decimals','number x = 42'],['text','strings','text s = "hi"'],['bool','true/false','bool ok = true'],['list','arrays','list xs = [1,2]'],['any','any type','any val = 42'],['const','immutable','const PI = 3.14']])}
${errBlock('x = 5  -- Error! not declared','Must declare first: number x = 5')}</div>`,
constants:`<div class="doc-hero"><div class="doc-hero-title">🔒 Constants</div><div class="doc-hero-desc">Constants cannot change after declaration.</div></div>
${cb('const PI = 3.14159\nconst MAX = 100\nprint PI * 2','6.28318')}
${errBlock('const PI = 3.14\nPI = 4.0  -- Error!','Constants are immutable. Use number instead of const if you need to change the value.')}`,
assignment:`<div class="doc-hero"><div class="doc-hero-title">✏️ Updating Variables</div><div class="doc-hero-desc">Update with = (no type keyword).</div></div>
${cb('number score = 0\nscore = 50\nscore = score + 10\nprint score','60')}
${errBlock('number x = 5\nnumber x = 10  -- re-declaration!','When updating, omit the type: just x = 10')}`,
'type-convert':`<div class="doc-hero"><div class="doc-hero-title">🔄 Type Conversion</div></div>
${cb('print toText(42)\nprint toNumber("3.14")\nprint toBool(0)\nprint toBool(1)','42\n3.14\nfalse\ntrue')}`,
arithmetic:`<div class="doc-hero"><div class="doc-hero-title">➕ Arithmetic</div></div>
${cb('print 5 + 3\nprint 10 - 4\nprint 3 * 7\nprint 10 / 4\nprint 10 % 3\nprint 2 ^ 8','8\n6\n21\n2.5\n1\n256')}`,
comparison:`<div class="doc-hero"><div class="doc-hero-title">🔍 Comparison Operators</div></div>
${tbl(['Op','Meaning','Example','Result'],[['==','Equal','5==5','true'],['!=','Not equal','5!=3','true'],['<','Less than','3<5','true'],['<=','Less/equal','5<=5','true'],['>','Greater','7>3','true'],['>=','Greater/equal','5>=6','false']])}
${errBlock('if x = 5  -- assigns, not compares!','Use == to compare: if x == 5')}`,
logical:`<div class="doc-hero"><div class="doc-hero-title">🧠 Logical Operators</div></div>
${cb('print true and false\nprint true or false\nprint not true\nnumber x = 7\nprint x > 5 and x < 10','false\ntrue\nfalse\ntrue')}`,
'string-ops':`<div class="doc-hero"><div class="doc-hero-title">🔤 String Operations</div></div>
${cb('print "Hello" + ", " + "World!"\nprint "Ha" * 5\ntext s = "  Hello  "\nprint upper(s)\nprint trim(s)\nprint len(s)','Hello, World!\nHaHaHaHaHa\n  HELLO  \nHello\n9')}`,
'if-else':`<div class="doc-hero"><div class="doc-hero-title">🔀 If / Elseif / Else</div></div>
${cb('number score = 85\nif score >= 90\n    print "A"\nelseif score >= 80\n    print "B"\nelse\n    print "F"\nend','B')}
${errBlock('if x > 5\n    print "big"\n-- missing end!','Every if must end with end')}`,
match:`<div class="doc-hero"><div class="doc-hero-title">🎲 Pattern Matching</div></div>
${cb('number day = 3\nmatch day\n    case 1\n        print "Monday"\n    case 3\n        print "Wednesday"\n    default\n        print "Other"\nend','Wednesday')}`,
'for-loop':`<div class="doc-hero"><div class="doc-hero-title">🔁 For Loops</div></div>
<div class="doc-section"><div class="doc-section-title">Numeric Range</div>${cb('for i = 1 to 5\n    print i\nend','1\n2\n3\n4\n5')}</div>
<div class="doc-section"><div class="doc-section-title">With Step</div>${cb('for i = 0 to 10 step 2\n    printraw toText(i) + " "\nend\nprint ""','0 2 4 6 8 10 ')}</div>
<div class="doc-section"><div class="doc-section-title">For-In</div>${cb('list fruits = ["apple","banana"]\nfor f in fruits\n    print f\nend','apple\nbanana')}</div>`,
'while-loop':`<div class="doc-hero"><div class="doc-hero-title">🔄 While Loop</div></div>
${cb('number n = 1\nwhile n <= 5\n    print n\n    n = n + 1\nend','1\n2\n3\n4\n5')}
${errBlock('while true\n    print "loop"\nend','Without break or a changing condition, this loops forever!')}`,
'repeat-loop':`<div class="doc-hero"><div class="doc-hero-title">🔃 Repeat</div><div class="doc-hero-desc">Repeat a block exactly N times.</div></div>
${cb('repeat 3\n    print "Hello!"\nend','Hello!\nHello!\nHello!')}`,
'break-continue':`<div class="doc-hero"><div class="doc-hero-title">⏭️ Break & Continue</div></div>
<div class="doc-section"><div class="doc-section-title">break — exit loop</div>${cb('for i = 1 to 10\n    if i == 5\n        break\n    end\n    print i\nend','1\n2\n3\n4')}</div>
<div class="doc-section"><div class="doc-section-title">continue — skip iteration</div>${cb('for i = 1 to 6\n    if i % 2 == 0\n        continue\n    end\n    print i\nend','1\n3\n5')}</div>`,
'fn-declare':`<div class="doc-hero"><div class="doc-hero-title">⚙️ Declaring Functions</div></div>
${cb('function sayHello()\n    print "Hello from a function!"\nend\nsayHello()\nsayHello()','Hello from a function!\nHello from a function!')}`,
'fn-params':`<div class="doc-hero"><div class="doc-hero-title">🎯 Parameters</div></div>
${cb('function greet(name, times)\n    repeat times\n        print "Hello, " + name + "!"\n    end\nend\ngreet("Alice", 2)','Hello, Alice!\nHello, Alice!')}`,
'fn-return':`<div class="doc-hero"><div class="doc-hero-title">↩️ Return Values</div></div>
${cb('function add(a, b)\n    return a + b\nend\nprint add(3, 4)\nprint add(10, 20)','7\n30')}`,
recursion:`<div class="doc-hero"><div class="doc-hero-title">🔄 Recursion</div><div class="doc-hero-desc">A function that calls itself. Must have a base case!</div></div>
${cb('function factorial(n)\n    if n <= 1\n        return 1\n    end\n    return n * factorial(n - 1)\nend\nprint factorial(5)\nprint factorial(10)','120\n3628800')}
${errBlock('function forever()\n    return forever()  -- no base case!\nend','Always add a stopping condition to recursive functions.')}`,
classes:`<div class="doc-hero"><div class="doc-hero-title">🏗️ Defining Classes</div></div>
${cb('class Person\n    function init(name, age)\n        self.name = name\n        self.age = age\n    end\n    function greet()\n        print "Hi, I am " + self.name\n    end\nend\nPerson alice = new Person("Alice", 30)\nalice.greet()\nprint alice.name','Hi, I am Alice\nAlice')}`,
methods:`<div class="doc-hero"><div class="doc-hero-title">🔧 Methods & self</div><div class="doc-hero-desc">self refers to the current object instance.</div></div>
${cb('class Counter\n    function init()\n        self.count = 0\n    end\n    function increment()\n        self.count = self.count + 1\n    end\n    function get()\n        return self.count\n    end\nend\nCounter c = new Counter()\nc.increment()\nc.increment()\nc.increment()\nprint c.get()','3')}`,
inheritance:`<div class="doc-hero"><div class="doc-hero-title">🧬 Inheritance</div></div>
${cb('class Animal\n    function init(name)\n        self.name = name\n    end\n    function speak()\n        print self.name + " makes a sound"\n    end\nend\nclass Dog extends Animal\n    function bark()\n        print self.name + " says Woof!"\n    end\nend\nDog rex = new Dog("Rex")\nrex.speak()\nrex.bark()','Rex makes a sound\nRex says Woof!')}`,
instantiation:`<div class="doc-hero"><div class="doc-hero-title">🆕 Creating Objects</div><div class="doc-hero-desc">Use <code>new</code> to create an instance.</div></div>
${cb('class Point\n    function init(x, y)\n        self.x = x\n        self.y = y\n    end\nend\nPoint p = new Point(3, 4)\nprint p.x\nprint p.y','3\n4')}`,
'try-catch':`<div class="doc-hero"><div class="doc-hero-title">🛡️ Try / Catch</div></div>
${cb('try\n    number x = 10 / 0\ncatch err\n    print "Error: " + err\nend','Error: Division by zero.')}`,
raise:`<div class="doc-hero"><div class="doc-hero-title">🔥 Raising Errors</div></div>
${cb('function divide(a, b)\n    if b == 0\n        raise "Cannot divide by zero!"\n    end\n    return a / b\nend\ntry\n    print divide(10, 2)\n    print divide(5, 0)\ncatch err\n    print "Error: " + err\nend','5\nError: Cannot divide by zero!')}`,
finally:`<div class="doc-hero"><div class="doc-hero-title">🏁 Finally Block</div><div class="doc-hero-desc">Always runs, error or not.</div></div>
${cb('try\n    raise "Oops!"\ncatch e\n    print "Caught: " + e\nfinally\n    print "Always runs!"\nend','Caught: Oops!\nAlways runs!')}`,
'common-errors':`<div class="doc-hero"><div class="doc-hero-title">⚠️ Common Errors Explained</div></div>
<div class="doc-section"><div class="doc-section-title">LEXER ERRORs</div>
${errBlock("print 'hello'","Single quotes not allowed. Use: print \"hello\"")}
${errBlock('text s = "not closed',"Every string needs a closing double quote.")}
${errBlock('number x = 3..14',"Numbers can only have one decimal point.")}</div>
<div class="doc-section"><div class="doc-section-title">PARSE ERRORs</div>
${errBlock('if x > 5\n  print "big"\n-- no end!',"Every if/for/while/function needs a closing end.")}
${errBlock('for = 1 to 10',"Missing loop variable: for i = 1 to 10")}</div>
<div class="doc-section"><div class="doc-section-title">RUNTIME ERRORs</div>
${errBlock('print x  -- x never declared',"Declare variables first: number x = 5")}
${errBlock('number x = 10 / 0',"Division by zero is not allowed.")}
${errBlock('list xs = [1,2,3]\nprint xs[5]',"Index 5 out of range. Valid indices: 0, 1, 2")}</div>`,
'math-fns':`<div class="doc-hero"><div class="doc-hero-title">🔢 Math Functions</div></div>
${tbl(['Function','Description','Example'],[['sqrt(n)','Square root','sqrt(16) → 4'],['abs(n)','Absolute value','abs(-5) → 5'],['floor(n)','Round down','floor(3.9) → 3'],['ceil(n)','Round up','ceil(3.1) → 4'],['round(n)','Round nearest','round(3.5) → 4'],['pow(a,b)','Power','pow(2,8) → 256'],['sin/cos/tan','Trig','sin(0) → 0'],['pi','π constant','pi → 3.14159'],['random()','0.0–1.0','random()'],['randint(a,b)','Random int','randint(1,6)'],['log(n)','Natural log','log(2.718) ≈ 1']])}
${cb('print sqrt(25)\nprint abs(-42)\nprint floor(3.9)\nprint pi','5\n42\n3\n3.141592653589793')}`,
'string-fns':`<div class="doc-hero"><div class="doc-hero-title">🔤 String Functions</div></div>
${cb('text s = "Hello, World!"\nprint len(s)\nprint upper(s)\nprint lower(s)\nprint contains(s, "World")\nprint replace(s, "World", "Ren")','13\nHELLO, WORLD!\nhello, world!\ntrue\nHello, Ren!')}`,
'list-fns':`<div class="doc-hero"><div class="doc-hero-title">📋 List Functions</div></div>
${cb('list nums = [3, 1, 4, 1, 5, 9]\nprint len(nums)\nprint first(nums)\nprint last(nums)\nprint sort(nums)\nprint reverse(nums)','6\n3\n9\n[1, 1, 3, 4, 5, 9]\n[9, 5, 1, 4, 1, 3]')}`,
modules:`<div class="doc-hero"><div class="doc-hero-title">📦 Modules</div><div class="doc-hero-desc">Available: math, random, string</div></div>
${cb('import math\nprint math.pi\nprint math.sqrt(16)\n\nfrom math import sqrt\nprint sqrt(25)\n\nimport random\nprint random.randint(1, 6)','3.141592653589793\n4\n5\n(random number)')}`,
'all-rules':`<div class="doc-hero"><div class="doc-hero-title">📋 Complete Ren Rules Reference</div><div class="doc-hero-desc">Every rule you need to know.</div></div>
<div class="doc-section"><div class="doc-section-title">Structure</div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R1</div><div class="doc-rule-name">One statement per line</div></div><div class="doc-rule-body"><div class="doc-rule-desc">Each statement on its own line. No semicolons.</div></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R2</div><div class="doc-rule-name">All blocks end with <code>end</code></div></div><div class="doc-rule-body"><div class="doc-rule-desc">if, for, while, repeat, function, class, match, try all need end.</div></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R3</div><div class="doc-rule-name">Double quotes only</div></div><div class="doc-rule-body"><div class="doc-rule-desc">Single quotes cause a LEXER ERROR.</div></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R4</div><div class="doc-rule-name">Comments: -- (line) or --- (block)</div></div><div class="doc-rule-body"></div></div></div>
<div class="doc-section"><div class="doc-section-title">Variables</div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R5</div><div class="doc-rule-name">Declare before use with a type keyword</div></div><div class="doc-rule-body"><div class="doc-rule-desc">number x = 5 — using undeclared variable crashes.</div></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R6</div><div class="doc-rule-name">Update without type keyword</div></div><div class="doc-rule-body"><div class="doc-rule-desc">x = 10, not number x = 10 (that re-declares).</div></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R7</div><div class="doc-rule-name">const is immutable</div></div><div class="doc-rule-body"><div class="doc-rule-desc">Constants cannot be changed after assignment.</div></div></div></div>
<div class="doc-section"><div class="doc-section-title">Operators</div>
${tbl(['Rule','Description'],[['+ on strings','Concatenates: "Hi" + " there"'],['* on strings','Repeats: "abc" * 3 = "abcabcabc"'],['/ may produce decimal','10/3 = 3.333...'],['/ 0 is runtime error','Division by zero crashes'],['^ for power','2^8 = 256 (not **)'],['== for comparison','= is assignment, == is comparison']])}</div>
<div class="doc-section"><div class="doc-section-title">Functions & Classes</div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R8</div><div class="doc-rule-name">Declare functions before calling</div></div><div class="doc-rule-body"></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R9</div><div class="doc-rule-name">Recursive functions need a base case</div></div><div class="doc-rule-body"></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R10</div><div class="doc-rule-name">Class constructor is <code>function init()</code></div></div><div class="doc-rule-body"></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R11</div><div class="doc-rule-name">Use <code>self</code> to access instance attributes</div></div><div class="doc-rule-body"></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R12</div><div class="doc-rule-name">Create instances: <code>Type obj = new Type(args)</code></div></div><div class="doc-rule-body"></div></div>
<div class="doc-rule"><div class="doc-rule-header"><div class="doc-rule-num">R13</div><div class="doc-rule-name">Inherit with <code>extends</code></div></div><div class="doc-rule-body"></div></div></div>`,
};

// ── Chatbot Knowledge ──
const CHAT_KB={
'all rules':`Here are **all the rules of Ren**:\n\n**📁 Structure**\n- One statement per line\n- All blocks close with \`end\`\n- Strings use \`"double quotes"\` only\n- Comments: \`-- line\` or \`--- block ---\`\n\n**📦 Variables**\n- Declare: \`number x = 5\` / \`text s = "hello"\` / \`bool ok = true\` / \`list xs = []\`\n- Update without type: \`x = 10\` (not \`number x = 10\`)\n- Constants with \`const\` cannot be changed\n- Types: \`number\`, \`text\`, \`bool\`, \`list\`, \`any\`, \`const\`\n\n**🔀 Control Flow**\n- \`if condition\` ... \`elseif\` ... \`else\` ... \`end\`\n- \`match val\` / \`case X\` / \`default\` / \`end\`\n- \`for i = 1 to N\` ... \`end\`\n- \`for item in list\` ... \`end\`\n- \`while condition\` ... \`end\`\n- \`repeat N\` ... \`end\`\n\n**⚙️ Functions**\n- \`function name(params)\` ... \`return val\` ... \`end\`\n- Recursive functions need a base case\n\n**🏗️ Classes**\n- \`class Name extends Parent\` ... \`end\`\n- Constructor: \`function init()\`\n- \`self.field\` for instance data\n- Create: \`Type obj = new Type(args)\`\n\n**🛡️ Errors**\n- \`try\` ... \`catch err\` ... \`finally\` ... \`end\`\n- Throw: \`raise "message"\`\n\n**⚡ Operators**\n- Math: \`+ - * / % ^\`\n- Compare: \`== != < <= > >=\`\n- Logic: \`and or not\`\n- String concat: \`+\`, repeat: \`*\``,
variables:`**Variables in Ren** 📦\n\nDeclare with type:\n\`\`\`\nnumber age = 16\ntext name = "Alice"\nbool active = true\nlist items = [1, 2, 3]\nconst PI = 3.14159\n\`\`\`\n\n**Rules:**\n- Always declare before use\n- Update without type keyword: \`age = 17\`\n- \`const\` cannot be changed\n- \`any\` accepts any type`,
loops:`**Loops in Ren** 🔁\n\n1. Numeric for:\n\`\`\`\nfor i = 1 to 5\n    print i\nend\n\`\`\`\n\n2. With step:\n\`\`\`\nfor i = 0 to 10 step 2\n    print i\nend\n\`\`\`\n\n3. For-in (list):\n\`\`\`\nfor item in myList\n    print item\nend\n\`\`\`\n\n4. While:\n\`\`\`\nwhile x < 10\n    x = x + 1\nend\n\`\`\`\n\n5. Repeat N times:\n\`\`\`\nrepeat 5\n    print "Hello!"\nend\n\`\`\`\n\nUse \`break\` to exit, \`continue\` to skip.`,
functions:`**Functions in Ren** ⚙️\n\nDeclare:\n\`\`\`\nfunction greet(name)\n    print "Hello, " + name + "!"\nend\ngreet("Alice")\n\`\`\`\n\nWith return:\n\`\`\`\nfunction add(a, b)\n    return a + b\nend\nnumber result = add(3, 4)\n\`\`\`\n\nRecursion:\n\`\`\`\nfunction factorial(n)\n    if n <= 1\n        return 1\n    end\n    return n * factorial(n - 1)\nend\n\`\`\`\n\n**Rules:** declare before calling, need base case for recursion.`,
classes:`**Classes in Ren** 🏗️\n\n\`\`\`\nclass Animal\n    function init(name)\n        self.name = name\n    end\n    function speak()\n        print self.name + " speaks!"\n    end\nend\n\nAnimal cat = new Animal("Cat")\ncat.speak()\n\`\`\`\n\nInheritance:\n\`\`\`\nclass Dog extends Animal\n    function bark()\n        print self.name + " barks!"\n    end\nend\n\`\`\`\n\n- Constructor: \`function init()\`\n- \`self\` accesses instance\n- \`extends\` inherits parent methods`,
errors:`**Error Handling in Ren** 🛡️\n\n\`\`\`\ntry\n    raise "Something broke!"\ncatch err\n    print "Caught: " + err\nend\n\`\`\`\n\nWith finally:\n\`\`\`\ntry\n    print "Trying..."\n    raise "Oops!"\ncatch e\n    print "Error: " + e\nfinally\n    print "Always runs!"\nend\n\`\`\`\n\n**Error types:**\n- **LEXER ERROR** — invalid syntax (quotes, chars)\n- **PARSE ERROR** — missing end, wrong structure\n- **RUNTIME ERROR** — undeclared var, division by zero`,
};

function explainError(err){
  const msg=(err.message||'').toLowerCase();
  const kind=err.kind||'';
  let r=`**🔴 ${err.kind||'Error'} on line ${err.line||'?'}**\n\n**Message:** ${err.message}\n\n`;
  if(msg.includes('single quote')||msg.includes("'"))r+=`**Why:** Ren only accepts double quotes ("). Single quotes are invalid.\n\n**Fix:** Change \`'hello'\` → \`"hello"\``;
  else if(msg.includes('does not exist')||msg.includes('not declared')){const m=msg.match(/variable '(\w+)'/);const v=m?m[1]:'x';r+=`**Why:** Variable \`${v}\` was used before being declared. In Ren, all variables must be declared with a type first.\n\n**Fix:**\n\`\`\`\nnumber ${v} = 0\nprint ${v}\n\`\`\``;}
  else if(msg.includes('constant'))r+=`**Why:** You tried to assign to a \`const\` variable. Constants cannot be changed.\n\n**Fix:** Use \`number\` instead of \`const\` if you need to change the value.`;
  else if(msg.includes('division by zero'))r+=`**Why:** Dividing by zero is mathematically undefined.\n\n**Fix:**\n\`\`\`\nif b != 0\n    print a / b\nend\n\`\`\``;
  else if(msg.includes('index')||msg.includes('out of range'))r+=`**Why:** You accessed a list index that doesn't exist. Lists start at 0.\n\n**Fix:** Use \`len(myList)\` to check the length before indexing.`;
  else if(msg.includes('not a function'))r+=`**Why:** You tried to call something that isn't a function.\n\n**Check:** Spell the function name correctly and make sure it's declared before calling.`;
  else if(msg.includes('string not closed')||msg.includes('never closed'))r+=`**Why:** A string was opened with " but never closed on the same line.\n\n**Fix:** Make sure every opening " has a matching closing " on the same line.`;
  else if(msg.includes('infinite loop')||msg.includes('execution limit'))r+=`**Why:** Your program ran over 500,000 steps — likely an infinite loop.\n\n**Fix:** Make sure your while condition eventually becomes false, or add a break statement.`;
  else if(kind==='LEXER ERROR')r+=`**Why:** The lexer found a character or sequence it doesn't understand. This happens before the program runs.\n\n**Common causes:** unknown characters, two decimal points, single quotes.`;
  else if(kind==='PARSE ERROR')r+=`**Why:** The code structure doesn't match Ren's syntax rules.\n\n**Common causes:** missing \`end\`, wrong keyword, typos in structure.`;
  else if(kind==='RUNTIME ERROR')r+=`**Why:** The code was valid but a logical error occurred during execution.\n\n**Common causes:** undeclared variable, division by zero, index out of bounds.`;
  else r+=`**Advice:** Check line ${err.line||'?'} carefully.\n- Make sure all blocks have \`end\`\n- Variables must be declared before use\n- Use == for comparison (not =)`;
  return r;
}

function fmtChat(text){
  return text
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g,'<code>$1</code>')
    .replace(/```\n?([\s\S]*?)```/g,(_,c)=>`<pre>${c.trim()}</pre>`)
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g,m=>`<ul>${m}</ul>`)
    .replace(/\n/g,'<br>');
}

function getChatResponse(q,lastError){
  const ql=q.toLowerCase();
  if((ql.includes('error')||ql.includes('why')||ql.includes('explain'))&&lastError)return explainError(lastError);
  for(const[k,v]of Object.entries(CHAT_KB)){if(ql.includes(k.toLowerCase()))return v;}
  if(ql.match(/\b(variable|declare|type|number|text|bool|list|const)\b/))return CHAT_KB.variables;
  if(ql.match(/\b(loop|for|while|repeat|iterate)\b/))return CHAT_KB.loops;
  if(ql.match(/\b(function|return|recursive|recursion|call)\b/))return CHAT_KB.functions;
  if(ql.match(/\b(class|object|inherit|self|new|extends|oop)\b/))return CHAT_KB.classes;
  if(ql.match(/\b(try|catch|error|exception|raise|finally|handle)\b/))return CHAT_KB.errors;
  if(ql.match(/\b(rules?|all|complete|reference|everything)\b/))return CHAT_KB['all rules'];
  if(ql.match(/\b(print|output|display|show)\b/))return `**Printing in Ren** 🖨️\n\n\`print\` — prints with newline\n\`printraw\` — prints without newline\n\n\`\`\`\nprint "Hello!"\nprintraw "A"\nprintraw "B"\nprint ""\n\`\`\`\n\nOutput:\n\`\`\`\nHello!\nAB\n\`\`\``;
  if(ql.match(/\b(comment|--)\b/))return `**Comments in Ren** 💬\n\n\`\`\`\n-- Single line comment\nprint "Hello" -- inline\n\n---\nMulti-line block\n---\n\`\`\``;
  if(ql.match(/\b(if|condition|else|elseif|branch)\b/))return `**Conditions in Ren** 🔀\n\n\`\`\`\nif x > 10\n    print "big"\nelseif x > 5\n    print "medium"\nelse\n    print "small"\nend\n\`\`\`\n\n- Logic: \`and\`, \`or\`, \`not\`\n- Compare: \`== != < <= > >=\`\n- ⚠️ Use \`==\` to compare (not \`=\`!)`;
  if(ql.match(/\b(import|module|math|random|string)\b/))return `**Modules in Ren** 📦\n\nAvailable: \`math\`, \`random\`, \`string\`\n\n\`\`\`\nimport math\nprint math.pi\nprint math.sqrt(25)\n\nfrom math import sqrt\nprint sqrt(16)\n\nimport random\nprint random.randint(1, 6)\n\`\`\``;
  if(ql.match(/\b(list|array|append|sort|reverse|range)\b/))return `**Lists in Ren** 📋\n\n\`\`\`\nlist nums = [3, 1, 4]\nprint nums[0]\nappend(nums, 9)\nprint sort(nums)\nprint len(nums)\n\nfor n in nums\n    print n\nend\n\`\`\`\n\n**Functions:** \`append\`, \`remove\`, \`pop\`, \`insert\`, \`sort\`, \`reverse\`, \`first\`, \`last\`, \`len\`, \`contains\`, \`range\``;
  return `I'm the **Ren AI assistant**! 🤖\n\nAsk me about:\n- **Variables** — declaring and using them\n- **Loops** — for, while, repeat, for-in\n- **Functions** — declaring, calling, recursion\n- **Classes** — OOP in Ren\n- **Error handling** — try/catch/finally\n- **All rules** — complete language reference\n- **My error** — paste an error and I'll explain it\n\nOr use the **Quick** buttons! 👇`;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  APP UI  (only initializes if runBtn exists)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (document.getElementById('runBtn')) {
// CodeMirror
const cm=CodeMirror.fromTextArea(document.getElementById('editor'),{mode:'ren',lineNumbers:true,lineWrapping:false,autoCloseBrackets:true,styleActiveLine:true,indentUnit:4,tabSize:4,extraKeys:{'F5':()=>runCode(),'Tab':cm=>cm.execCommand('insertSoftTab')}});
cm.setValue(EXAMPLES.hello);
cm.on('cursorActivity',()=>{const c=cm.getCursor();document.getElementById('cursorPos').textContent=`Ln ${c.line+1}, Col ${c.ch+1}`;document.getElementById('charCount').textContent=cm.getValue().length+' chars';});
cm.on('change',()=>{document.getElementById('paneModified').style.display='block';document.getElementById('charCount').textContent=cm.getValue().length+' chars';});

// Panel tabs
const panels={output:document.getElementById('panelOutput'),docs:document.getElementById('panelDocs'),chat:document.getElementById('panelChat')};
document.querySelectorAll('.panel-tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.panel-tab').forEach(t=>t.classList.remove('active'));
    Object.values(panels).forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');panels[tab.dataset.panel].classList.add('active');
  });
});

// Build sidebar
const docsNav=document.getElementById('docsNav');
const docsWelcomeLinks=document.getElementById('docsWelcomeLinks');
DOCS_SECTIONS.forEach(section=>{
  const div=document.createElement('div');div.className='docs-section';
  div.innerHTML=`<div class="docs-section-header"><span class="section-icon">${section.icon}</span><span>${section.title}</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg></div><div class="docs-items">${section.items.map(i=>`<div class="docs-item" data-topic="${i.id}"><div class="item-dot"></div>${i.title}</div>`).join('')}</div>`;
  div.querySelector('.docs-section-header').addEventListener('click',()=>div.classList.toggle('open'));
  docsNav.appendChild(div);
  section.items.slice(0,2).forEach(item=>{const lnk=document.createElement('div');lnk.className='docs-welcome-link';lnk.textContent=section.icon+' '+item.title;lnk.addEventListener('click',()=>openTopic(item.id));docsWelcomeLinks.appendChild(lnk);});
});
docsNav.querySelectorAll('.docs-item').forEach(item=>item.addEventListener('click',()=>openTopic(item.dataset.topic)));

// Build doc pages
const docsContent=document.getElementById('docsContent');
for(const[id,html]of Object.entries(DOC_PAGES)){const page=document.createElement('div');page.className='doc-topic';page.id='topic-'+id;page.innerHTML=html;docsContent.appendChild(page);}

function openTopic(id){
  document.querySelectorAll('.panel-tab').forEach(t=>t.classList.remove('active'));
  Object.values(panels).forEach(p=>p.classList.remove('active'));
  document.getElementById('tabDocs').classList.add('active');panels.docs.classList.add('active');
  document.getElementById('docsWelcome').style.display='none';
  document.querySelectorAll('.doc-topic').forEach(t=>t.classList.remove('active'));
  const page=document.getElementById('topic-'+id);if(page)page.classList.add('active');
  document.querySelectorAll('.docs-item').forEach(i=>i.classList.remove('active'));
  const navItem=document.querySelector(`.docs-item[data-topic="${id}"]`);
  if(navItem){navItem.classList.add('active');navItem.closest('.docs-section').classList.add('open');navItem.scrollIntoView({behavior:'smooth',block:'nearest'});}
}
function loadInEditor(code){cm.setValue(code.trim());document.getElementById('paneModified').style.display='none';showToast('✅ Loaded into editor','success');}
function copyCode(btn,code){navigator.clipboard.writeText(code.trim()).then(()=>{const o=btn.textContent;btn.textContent='Copied!';setTimeout(()=>btn.textContent=o,1500);});}

// Docs search
document.getElementById('docsSearch').addEventListener('input',function(){const q=this.value.toLowerCase();document.querySelectorAll('.docs-item').forEach(item=>{const match=item.textContent.toLowerCase().includes(q);item.style.display=(match||!q)?'flex':'none';if(match&&q)item.closest('.docs-section').classList.add('open');});});

// Run code
let lastError=null;
function runCode(){
  const source=cm.getValue();if(!source.trim()){showToast('Write some code first!','');return;}
  const runBtn=document.getElementById('runBtn');
  const outputWrap=document.getElementById('outputWrap');
  const outputDot=document.getElementById('outputDot');
  const outputStatus=document.getElementById('outputStatus');
  const outputEmpty=document.getElementById('outputEmpty');
  const statusDot=document.getElementById('statusDot');
  const statusText=document.getElementById('statusText');
  const errorCard=document.getElementById('errorCard');
  const errorAskBtn=document.getElementById('errorAskBtn');
  const errorBadge=document.getElementById('errorBadge');
  const runFlash=document.getElementById('runFlash');
  runBtn.classList.add('running');outputDot.className='output-dot run';outputStatus.textContent='Running…';statusDot.className='status-dot run';statusText.textContent='Running…';runFlash.classList.add('active');errorCard.classList.remove('show');errorAskBtn.style.display='none';errorBadge.classList.remove('show');
  outputWrap.querySelectorAll('.output-line').forEach(el=>el.remove());outputEmpty.style.display='none';
  document.querySelectorAll('.panel-tab').forEach(t=>t.classList.remove('active'));Object.values(panels).forEach(p=>p.classList.remove('active'));document.getElementById('tabOutput').classList.add('active');panels.output.classList.add('active');
  let buf='';
  function outputFn(text){buf+=text;const lines=buf.split('\n');buf=lines.pop();for(const line of lines){const div=document.createElement('div');div.className='output-line ok';div.textContent=line;outputWrap.appendChild(div);}outputWrap.scrollTop=outputWrap.scrollHeight;}
  setTimeout(()=>{
    const result=runRen(source,outputFn);
    if(buf){const div=document.createElement('div');div.className='output-line ok';div.textContent=buf;outputWrap.appendChild(div);}
    runFlash.classList.remove('active');runBtn.classList.remove('running');document.getElementById('paneModified').style.display='none';
    if(result.ok){
      outputDot.className='output-dot ok';outputStatus.textContent='Done ✓';statusDot.className='status-dot ok';statusText.textContent='Done';lastError=null;
      if(!outputWrap.querySelectorAll('.output-line').length){outputEmpty.style.display='flex';outputEmpty.innerHTML='<div style="opacity:.3;font-size:32px">✅</div><h3>Success</h3><p>Program ran with no output.</p>';}
    } else {
      lastError=result;outputDot.className='output-dot err';outputStatus.textContent=result.kind;statusDot.className='status-dot err';statusText.textContent=result.kind;errorBadge.textContent='!';errorBadge.classList.add('show');
      errorCard.classList.add('show');document.getElementById('errorCardTitle').textContent=(result.kind||'Error')+(result.line?` · Line ${result.line}`:'');document.getElementById('errorCardBody').textContent=result.message;errorAskBtn.style.display='flex';
      const div=document.createElement('div');div.className='output-line err';div.textContent=`${result.kind}${result.line?` (line ${result.line})`:''}:\n${result.message}`;outputWrap.appendChild(div);outputWrap.scrollTop=outputWrap.scrollHeight;
    }
  },60);
}

document.getElementById('errorAskBtn').addEventListener('click',()=>{
  if(!lastError)return;
  document.querySelectorAll('.panel-tab').forEach(t=>t.classList.remove('active'));Object.values(panels).forEach(p=>p.classList.remove('active'));document.getElementById('tabChat').classList.add('active');panels.chat.classList.add('active');
  addChatMsg('user','Explain why my error happened:\n'+lastError.kind+': '+lastError.message);
  setTimeout(()=>addChatMsg('bot',getChatResponse('explain error',lastError)),600);
});

// Chat
function addChatMsg(role,text){
  const messages=document.getElementById('chatMessages');
  const div=document.createElement('div');div.className=`chat-msg ${role}`;
  const avClass=role==='bot'?'bot':'user-av';const avIcon=role==='bot'?'🤖':'👤';
  div.innerHTML=`<div class="chat-avatar ${avClass}">${avIcon}</div><div class="chat-bubble">${fmtChat(text)}</div>`;
  messages.appendChild(div);messages.scrollTop=messages.scrollHeight;
}
function showTyping(){
  const messages=document.getElementById('chatMessages');const div=document.createElement('div');div.className='chat-msg bot';div.id='typingIndicator';
  div.innerHTML=`<div class="chat-avatar bot">🤖</div><div class="chat-bubble"><div class="chat-typing"><span></span><span></span><span></span></div></div>`;
  messages.appendChild(div);messages.scrollTop=messages.scrollHeight;return div;
}
function sendChat(){
  const input=document.getElementById('chatInput');const text=input.value.trim();if(!text)return;
  input.value='';input.style.height='';addChatMsg('user',text);
  const typing=showTyping();
  setTimeout(()=>{typing.remove();addChatMsg('bot',getChatResponse(text,lastError));},600+Math.random()*400);
}
document.getElementById('chatSend').addEventListener('click',sendChat);
document.getElementById('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChat();}});
document.getElementById('chatInput').addEventListener('input',function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,90)+'px';});
document.querySelectorAll('.quick-btn').forEach(btn=>{btn.addEventListener('click',()=>{const q=btn.dataset.q;if(btn.id==='qExplainError'&&!lastError){showToast('Run code with an error first!','');return;}document.getElementById('chatInput').value=q;sendChat();});});

// Init bot msg
setTimeout(()=>addChatMsg('bot','Hi! I\'m the **Ren AI Assistant** 🤖\n\nI can help with:\n- **Language rules** — all of Ren\'s syntax\n- **Error explanations** — why code failed and how to fix it\n- **Any Ren topic** — variables, loops, functions, classes...\n\nRun code with errors, then ask me to explain them!\nOr use the **Quick** buttons below 👇'),200);

// Examples dropdown
const examplesBtn=document.getElementById('examplesBtn');
examplesBtn.addEventListener('click',e=>{e.stopPropagation();examplesBtn.classList.toggle('open');});
document.addEventListener('click',()=>examplesBtn.classList.remove('open'));
document.querySelectorAll('.dropdown-item[data-example]').forEach(item=>{
  item.addEventListener('click',()=>{const key=item.dataset.example;if(EXAMPLES[key]){cm.setValue(EXAMPLES[key]);document.getElementById('paneModified').style.display='none';examplesBtn.classList.remove('open');showToast('✅ Loaded: '+item.textContent.trim().split('\n')[0],'success');}});
});

// Controls
document.getElementById('runBtn').addEventListener('click',runCode);
document.addEventListener('keydown',e=>{if(e.key==='F5'){e.preventDefault();runCode();}});
document.getElementById('clearBtn').addEventListener('click',()=>{
  const wrap=document.getElementById('outputWrap');wrap.querySelectorAll('.output-line').forEach(el=>el.remove());
  document.getElementById('outputEmpty').style.display='flex';document.getElementById('outputEmpty').innerHTML='<div style="opacity:.3"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg></div><h3>No output yet</h3><p>Press <strong>Run</strong> or <kbd>F5</kbd></p>';
  document.getElementById('errorCard').classList.remove('show');document.getElementById('errorAskBtn').style.display='none';document.getElementById('errorBadge').classList.remove('show');document.getElementById('outputDot').className='output-dot ok';document.getElementById('outputStatus').textContent='Ready';document.getElementById('statusDot').className='status-dot ok';document.getElementById('statusText').textContent='Ready';lastError=null;showToast('🗑️ Output cleared','');
});
document.getElementById('copyOutputBtn').addEventListener('click',()=>{const lines=document.querySelectorAll('.output-line');navigator.clipboard.writeText([...lines].map(l=>l.textContent).join('\n')).then(()=>showToast('📋 Copied!','success'));});
let wrapEnabled=false;
document.getElementById('wrapToggleBtn').addEventListener('click',function(){wrapEnabled=!wrapEnabled;cm.setOption('lineWrapping',wrapEnabled);this.style.color=wrapEnabled?'var(--accent4)':'';});
document.getElementById('shareBtn').addEventListener('click',()=>{const code=encodeURIComponent(cm.getValue());navigator.clipboard.writeText(`${location.href.split('?')[0]}?code=${code}`).then(()=>showToast('🔗 Link copied!','success'));});
document.getElementById('sidebarToggle').addEventListener('click',()=>document.getElementById('docsSidebar').classList.toggle('collapsed'));

// Load from URL
const urlParams=new URLSearchParams(location.search);if(urlParams.get('code')){try{cm.setValue(decodeURIComponent(urlParams.get('code')));}catch(e){}}

// Resizer
const resizer=document.getElementById('resizer');const rightPanel=document.getElementById('rightPanel');
resizer.addEventListener('mousedown',e=>{e.preventDefault();resizer.classList.add('dragging');const startX=e.clientX;const startW=rightPanel.offsetWidth;function onMove(e){const newW=Math.max(240,Math.min(700,startW+(startX-e.clientX)));rightPanel.style.width=newW+'px';}function onUp(){resizer.classList.remove('dragging');document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);}document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);});

function showToast(msg,type=''){const toast=document.getElementById('toast');toast.textContent=msg;toast.className=`toast show ${type}`;setTimeout(()=>toast.className='toast',2500);}

window.loadInEditor=loadInEditor;window.copyCode=copyCode;window.openTopic=openTopic;
document.getElementById('charCount').textContent=cm.getValue().length+' chars';
} // end APP UI guard
