// TODO: maybe take "bound_it" func off
const ik = {
    frente: 0,
    translate: 1,
    bound_it: 2,
    nothing: 3,
    clr: 4
}

class Inst {
    constructor(kind, par, who) {
        this.kind=kind
        this.par=par
        this.who=who
        this.first=true;
        this.sv;
        this.ended=false;
    }
}

class Time {
    constructor(inst) {
        this.insts=[]
        this.ended=0;
        if (inst!=undefined) {
            for (let i=0;i<inst.length;i++) {
                this.insts.push(inst[i]);
            }
        }
    }
    appendInst(inst) {
        this.insts.push(inst)
    }
    appendMore(inst) {
        for (let i=0;i<inst.length;i++) {
            this.insts.push(inst[i]);
        }
    }
}

class Steps {
    constructor() {
        this.step = []
        this.current=0;
    }
    appendTime(time) {
        this.step.push(time);
    }    
}
function whichOpIs(text) {
    switch(text) {
        case 'frt':
            return ik.frente
            break;
        case 'rot':
            return ik.translate 
            break;
        case 'marcar_passo':
            return ik.nothing 
            break;
        case 'clr':
            return ik.clr;
            break;
    }
}
function preCompiling(text) {
    let rdb=""
    for (let i=0;i<text.length;i++) {
        if (text[i]!=" " && text.charCodeAt(i)!=10) {
            rdb+=text[i];
        }
    }
    text=rdb
    let dtd = new Map()
    let ison=false;
    let ans="";
    for (let i=0;i<text.length;i++) {
        if (text[i]=='[' || text[i]==']') ison=!ison
        if (!ison) {
            if (text[i]=='=') {
                let b=i;
                while (text[b-1] != "'" && b!=0 && text[b-1]!=']') b--;
                let name=text.substring(b,i);
                b=i+2;
                while (text[b]!="'")  b++;
                let args=text.substring(i+2,b)
                dtd.set(name,args)
            }
        }
    }
    let p=0
    let last=0;
    let checkSymb = (chr) =>{
        let symb="()[];:{},-"
        for (let i=0;i<symb.length;i++) {
            if (chr==symb[i]) return true
        } 
        return false;
    }
    for (let i=0;i<text.length;i++) {
        if (text[i]=='[' || text[i] == ']') ison=!ison;
        if (ison) { 
            ans+=text[i];    
            if (checkSymb(text[i])) {
                if (dtd.has(text.substring(last+1,i))) {
                    let got=dtd.get(text.substring(last+1,i));
                    ans=structuredClone(ans.substring(0,ans.length-(i-last))+got+text[i]);
                }
                last=i;
            }      
        }
        if (text[i]==']') ans+=text[i];
    }
    return ans;
}
function compileText(text) {
    let ans=new Steps()
    let going_time= new Time()
    let going_inst;
    let rdb=preCompiling(text)
    let name=[0,0]
    let par=[0,0];
    let cha=[0,0];
    for (let i=0;i<rdb.length;i++) {
        if (rdb[i]==']') {
            ans.appendTime(going_time)
            going_time=new Time()
        }
        if (rdb[i]=='[') name[0]=i+1;
        if (rdb[i]=='(') par[0]=i+1;
        if (rdb[i]=='{') cha[0]=i+1;
        if (rdb[i]==':') name[1]=i;
        if (rdb[i]==')') par[1]=i;
        if (rdb[i]=='}') cha[1]=i;
        if (rdb[i]==';') {
            let nome=rdb.substring(name[0],name[1]);
            let pare;
            eval("pare=["+rdb.substring(par[0],par[1])+"]");
            let chav;
            eval("chav=["+rdb.substring(cha[0],cha[1])+']')
            let op=whichOpIs(nome);
            going_time.appendInst(new Inst(op,pare,chav))
            name[0]=i+1;
        }
    }
    return ans;
}
