let HEIGHT=500;
let WIDTH=800;
let BOX_HEIGHT=50;
let BOX_WIDTH=50;

class Militar {
    constructor(x,y) {
        this.x=x;
        this.y=y;
        this.inix=x;
        this.iniy=y;
        this.structPoints= [
            [-0.3,0.001],
            [0.001,-0.3],
            [0.3,0.001]
        ]
        this.angle=270;
        this.exist=true;
        this.selected=false;
    }
}
class Bando {
    constructor() {
        this.tropa = []
        this.currentTime;
    }  
    frameTempo() {
        for (let b=0;b<this.currentTime.insts.length;b++) {
            let intels=this.currentTime.insts[b];
            let opc=intels.kind;
            let ids=intels.who;
            switch(opc) {
                case ik.frente:
                    if (intels.par[0]<0) continue  
                    let vel=intels.par[1];
                    for (let i=0;i<ids.length;i++) {
                        let angle=this.tropa[ids[i]].angle
                        let dx=Math.cos(angle*Math.PI/180)*vel;
                        let dy=-Math.sin(angle*Math.PI/180)*vel;
                        this.tropa[ids[i]].x+=dx;
                        this.tropa[ids[i]].y+=dy;
                    }
                    intels.par[0]-=vel;
                    if (intels.par[0]<0) {
                        intels.ended=true;
                        if (intels.par.length==3) {
                            for (let i=0;i<ids.length;i++) { 
                                if (this.tropa[ids[i]].x<0) this.tropa[ids[i]].x=-Math.floor(Math.abs(this.tropa[ids[i]].x))
                                else this.tropa[ids[i]].x=Math.floor(this.tropa[ids[i]].x);
                                if (this.tropa[ids[i]].y<0) this.tropa[ids[i]].y=-Math.floor(Math.abs(this.tropa[ids[i]].y))
                                else this.tropa[ids[i]].y=Math.floor(this.tropa[ids[i]].y);
                            }
                        }
                        this.currentTime.ended++;
                    }
                    break;
                case ik.translate:
                    // make animations
                    if (intels.ended) {continue;}
                    let delta=intels.par[0];
                    let vela=intels.par[1];
                    if (intels.first) {
                        intels.first=false;
                        intels.sv=[]
                        for (let i=0;i<ids.length;i++) {
                            intels.sv.push((this.tropa[ids[i]].angle+delta)%360);
                        }
                    }   
                    for (let i=0;i<ids.length;i++) {
                        this.tropa[ids[i]].angle=(this.tropa[ids[i]].angle+vela)%360;
                    }
                    intels.par[0]-=vela;
                    if ((vela<0 ? -intels.par[0] : intels.par[0]) < 0) { 
                        intels.ended=true;
                        for (let i=0;i<ids.length;i++) {
                            this.tropa[ids[i]].angle=intels.sv[i];
                        }
                        this.currentTime.ended++;
                    }
                    break;
                case ik.nothing:
                    if (intels.par[0]==0) continue;
                    if (intels.par[0]>0) {
                        intels.par[0]=(-30*intels.par[0])-frameCount;
                    } 
                    if (intels.par[0]+frameCount>=0) {
                        intels.par[0]=0;
                        this.currentTime.ended++;
                    }
                    break;
            }
        }
    }
    drawTropa(cx, cy) {
        let content_seg="Segurando: "
        for (let i=0;i<this.tropa.length;i++) {
            let look=this.tropa[i];
            if (!look.exist) {
                content_seg+=i.toString()+", "
                continue;
            }
            let rx=(look.x-cx)*BOX_WIDTH + WIDTH/2
            let ry=(cy-look.y)*BOX_HEIGHT + HEIGHT/2;
            if (look.selected) {
                fill(0, 100, 32);
            }
            circle(rx,ry,BOX_WIDTH/1.5);
            stroke(0);
            let sizeText=BOX_WIDTH*0.2;
            textSize(sizeText);
            fill('black')
            // consertar alinhamento...
            text(i.toString(),rx-sizeText/2.6,ry+sizeText/3)
            fill(255)   
            let last=undefined;
            for (let b=0;b<this.tropa[i].structPoints.length;b++) {
                let pt=this.tropa[i].structPoints[b];
                let angle=this.tropa[i].angle*Math.PI/180
                let curAngle=Math.atan(pt[1]/pt[0])
                angle+=curAngle-90*Math.PI/180;
                // consertar angulo pra y neg
                let hyp=Math.hypot(pt[0]*BOX_WIDTH,pt[1]*BOX_HEIGHT)
                if (curAngle<0) hyp*=-1;
                let nx=rx+hyp*Math.cos(angle);
                let ny=ry+hyp*Math.sin(angle);
              
                if (last!=undefined) {
                    line(nx,ny,last[0],last[1])
                }
                last=[nx,ny];
            }
        }
        document.getElementById("segurando").innerHTML=content_seg.substring(0,content_seg.length-2)
    }
    resetarPos() {
        for (let i=0;i<this.tropa.length;i++) {
            let look=this.tropa[i];
            look.x=look.inix;
            look.y=look.iniy;
            look.angle=270;
        }
    }
}
function salvarSelecao() {
    let head="sel='"
    for (let i=0;i<bando.tropa.length;i++) {
        let look=bando.tropa[i]; 
        if (look.selected) {
            head+=(head.length!=5 ? ',' : '')+i.toString();
            look.selected=false;
        }
    }
    head+="'";
    saveHeader+='\n'+head;
    if (look) {
        document.getElementById("roteiro").value+='\n'+head;
    }
    document.getElementById("menu_macro").hidden=true;
    selectMode=false;
}
function drawGrid(cx, cy) {
    let boxxq=WIDTH/BOX_WIDTH
    let boxyq=HEIGHT/BOX_HEIGHT
    let mid=WIDTH/2;
    let dx=(Math.floor(cx)-cx)*BOX_WIDTH
    let dy=(cy-Math.floor(cy))*BOX_HEIGHT
    for (let i=0;i<boxxq/2+1;i++) {  
        line(mid+BOX_WIDTH*i+dx,0,mid+BOX_WIDTH*i+dx,HEIGHT)
        line(mid-BOX_WIDTH*(i+1)+dx,0,mid-BOX_WIDTH*(i+1)+dx,HEIGHT)
    }
    mid=HEIGHT/2;
    for (let i=0;i<boxyq/2+1;i++) {
        line(0,mid+BOX_HEIGHT*i+dy,WIDTH,mid+BOX_HEIGHT*i+dy)
        line(0,mid-BOX_HEIGHT*(i+1)+dy,WIDTH,mid-BOX_HEIGHT*(i+1)+dy)
    }
}

function nearRad(num) {
    if (num<0) return -Math.round(-num);
    return Math.round(num); 
}
let msx=0;
let msy=0;
function drawMousePos(cx, cy) {
    let px=nearRad((mouseX-WIDTH/2)/BOX_WIDTH+cx);
    let py=nearRad(cy+(HEIGHT/2-mouseY)/BOX_HEIGHT);
    let rx=(px-cx)*BOX_WIDTH + WIDTH/2;
    let ry=(cy-py)*BOX_HEIGHT + HEIGHT/2;
    msx=px;
    msy=py;
    noFill()
    stroke(255,0,0)
    circle(rx,ry,BOX_WIDTH);
    fill(255);
    stroke(0);
}
function startSim() {
    IsRunning=true;
    current_step=1;
    bando.currentTime=structuredClone(cron.step[0]);
}
let cron;
let saveRot=""
let saveHeader=""
let look=false;
function rotRef() { 
    if (!look) saveRot=document.getElementById('roteiro').value
    else saveHeader=document.getElementById('roteiro').value
}
function startALL() {
    rotRef()
    let text=saveHeader+saveRot
    cron=compileText(text)
    console.log(cron)
    startSim();
    
}
let svmx;
let svmy;
let selectMode=false;
let pd=false;
let IsRunning=false;

let bando=new Bando();
let current_step=1;

function setup() {
    document.addEventListener('contextmenu', event => event.preventDefault());
    createCanvas(WIDTH, HEIGHT);

}
  
 
let cx=0,cy=0;
let lx=0,ly=0;
function draw() {
    background(220);
    drawGrid(lx,ly);
    drawMousePos(lx,ly)
    bando.drawTropa(lx,ly);
    if (IsRunning) {
        bando.frameTempo();
        if (bando.currentTime.ended==bando.currentTime.insts.length) {
            if (current_step!=cron.step.length) {
                bando.currentTime=structuredClone(cron.step[current_step++]);
            }
        }
    }
    if (pd) {
        lx=cx-(mouseX-svmx)/BOX_WIDTH
        ly=cy+(mouseY-svmy)/BOX_HEIGHT
    }
}

function mousePressed() {
    if (mouseButton==RIGHT) {
        let gone=false;
        for (let i=0;i<bando.tropa.length;i++) {
            let look=bando.tropa[i];
            if (look.exist && look.inix==msx && look.iniy==msy) {
                if (selectMode) {
                    look.selected=!look.selected;
                } else {
                    look.exist=false;
                }
                gone=true;
                break; 
            }
        }
    
        if (!gone) {
            for (let i=0;i<bando.tropa.length;i++) {
                let look=bando.tropa[i];
                if (!look.exist) {
                    bando.tropa[i] = new Militar(msx,msy)
                    gone=true
                    break;
                }
            }
        }
        if (!gone) bando.tropa.push(new Militar(msx,msy));
        return;
    }
    if (!pd) {
        svmx=mouseX
        svmy=mouseY
    }
    pd=true;
}

function mouseReleased(){
    if (mouseButton==RIGHT) return;
    cx-=(mouseX-svmx)/BOX_WIDTH
    cy+=(mouseY-svmy)/BOX_HEIGHT
    pd=false;
}

function mouseWheel(event) {
    if (event.delta < 0) {
        BOX_HEIGHT=BOX_HEIGHT*1.1;
        BOX_WIDTH=BOX_WIDTH*1.1;
    } else {
        BOX_WIDTH=BOX_WIDTH*0.9;
        BOX_HEIGHT=BOX_HEIGHT*0.9;
    }
    // Uncomment to prevent any default behavior.
    // return false;
}