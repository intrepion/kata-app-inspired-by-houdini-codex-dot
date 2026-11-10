export const VERSION = 1;
export const LIMIT = 12;
export const palettes = {
  ember: ['#4e376e','#db6252','#ffb573','#fff2bc'],
  tide: ['#285c8c','#48aeb8','#8ae5c5','#f3ffde'],
  orchid: ['#3c3c82','#a861c2','#f2a5d1','#fff1df'],
  frost: ['#27465c','#728da8','#bfddeb','#ffffff']
};
export const definitions = {
  source: {label:'Scatter', description:'Begin with a seeded cloud of points. Change the shape without losing the downstream recipe.', icon:'✧', color:'#9bc6ab', params:{count:['Points',500,7000,100],radius:['Radius',.3,2,.05],seed:['Seed',1,9999,1]},defaults:{count:4200,radius:1,seed:32,shape:'torus'}},
  noise: {label:'Turbulence', description:'A smooth, time-varying displacement field. This is a procedural deformation, not a fluid solver.',icon:'≈',color:'#e0ad68',params:{strength:['Strength',0,1.2,.01],frequency:['Frequency',.2,8,.1]},defaults:{strength:.22,frequency:3}},
  twist: {label:'Twist',description:'Rotate each point around the vertical axis in proportion to its height.',icon:'↝',color:'#e0ad68',params:{amount:['Turns',-3,3,.05]},defaults:{amount:1}},
  wave: {label:'Wave',description:'Lift the cloud with a traveling radial wave. Scrub time to explore its phases.',icon:'∿',color:'#e0ad68',params:{amount:['Amplitude',0,1,.02],frequency:['Frequency',.2,10,.1]},defaults:{amount:.25,frequency:3}},
  attract: {label:'Gather',description:'Pull points toward the vertical axis. Negative values gently expand the form.',icon:'◎',color:'#e0ad68',params:{amount:['Pull',-1,1,.02]},defaults:{amount:.4}},
  scale: {label:'Stretch',description:'Scale each axis independently. Operator order changes the result.',icon:'⤢',color:'#e0ad68',params:{x:['X scale',.1,3,.05],y:['Y scale',.1,3,.05],z:['Z scale',.1,3,.05]},defaults:{x:1,y:1.5,z:1}}
};
let serial=0;
export function node(type, params={}) { return {id:`n-${Date.now().toString(36)}-${serial++}`,type,enabled:true,params:{...definitions[type].defaults,...params}}; }
export function preset(name='ember') {
  const shared={format:'fluxgrove',version:VERSION,title:'Ember bloom',palette:'ember',pointSize:1.5,frame:72,camera:{yaw:.62,pitch:.34,zoom:1},nodes:[]};
  if(name==='tide') return {...shared,title:'Tidal threads',palette:'tide',nodes:[node('source',{shape:'sphere',count:3800,seed:81}),node('scale',{x:1.3,y:.65,z:1}),node('wave',{amount:.46,frequency:4}),node('twist',{amount:.6})]};
  if(name==='orchid') return {...shared,title:'Orchid drift',palette:'orchid',nodes:[node('source',{shape:'helix',count:4600,seed:209}),node('noise',{strength:.23,frequency:2.2}),node('twist',{amount:.65}),node('scale',{x:.95,y:1.1,z:.95})]};
  if(name==='blank') return {...shared,title:'Untitled study',palette:'frost',frame:0,nodes:[node('source',{shape:'sphere',count:2400})]};
  return {...shared,nodes:[node('source'),node('noise'),node('twist',{amount:.65}),node('wave',{amount:.12,frequency:3})]};
}
export const clone = v => JSON.parse(JSON.stringify(v));
const finite = (v,min,max,fallback) => Number.isFinite(v) ? Math.max(min,Math.min(max,v)) : fallback;
export function validateProject(raw) {
  if (!raw || raw.format!=='fluxgrove' || raw.version!==VERSION) throw new Error('This is not a supported Fluxgrove project.');
  if (!Array.isArray(raw.nodes) || raw.nodes.length<1 || raw.nodes.length>LIMIT || raw.nodes[0]?.type!=='source') throw new Error('A project needs one Scatter source and no more than 12 nodes.');
  const ids = new Set();
  const nodes=raw.nodes.map((n,i)=>{
    if(!n || !Object.hasOwn(definitions,n.type) || (i>0 && n.type==='source')) throw new Error('Unsupported or misplaced operator.');
    const d=definitions[n.type]; const p={};
    for(const [key,spec] of Object.entries(d.params)) p[key]=finite(n.params?.[key],spec[1],spec[2],d.defaults[key]);
    if(n.type==='source') {p.count=Math.round(p.count);p.seed=Math.round(p.seed);p.shape=['torus','sphere','helix','grid'].includes(n.params?.shape)?n.params.shape:'torus';}
    let id=typeof n.id==='string' && /^[a-zA-Z0-9-]{1,64}$/.test(n.id)?n.id:node(n.type).id;
    if(ids.has(id)) id=node(n.type).id; ids.add(id);
    return {id,type:n.type,enabled:i===0?true:n.enabled!==false,params:p};
  });
  return {format:'fluxgrove',version:VERSION,title:typeof raw.title==='string'?raw.title.slice(0,80):'Untitled study',palette:Object.hasOwn(palettes,raw.palette)?raw.palette:'ember',pointSize:finite(raw.pointSize,.5,3,1.5),frame:Math.round(finite(raw.frame,0,240,0)),camera:{yaw:finite(raw.camera?.yaw,-100,100,.62),pitch:finite(raw.camera?.pitch,-1.2,1.2,.34),zoom:finite(raw.camera?.zoom,.4,2.5,1)},nodes};
}
export function random(seed) {let s=seed>>>0;return ()=>{s+=0x6D2B79F5;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
export function generate(project,frame=project.frame) {
  const source=project.nodes[0].params,rng=random(source.seed),points=[],time=frame/30;
  for(let i=0;i<source.count;i++) {
    const a=rng()*Math.PI*2,b=rng()*Math.PI*2,r=source.radius; let x,y,z;
    if(source.shape==='sphere') {const h=rng()*2-1,rr=Math.sqrt(1-h*h);x=Math.cos(a)*rr*r;y=h*r;z=Math.sin(a)*rr*r;}
    else if(source.shape==='helix') {const t=i/source.count,angle=t*Math.PI*10;const scatter=.13; x=(Math.cos(angle)*.6+(rng()-.5)*scatter)*r;y=(t-.5)*2.8*r;z=(Math.sin(angle)*.6+(rng()-.5)*scatter)*r;}
    else if(source.shape==='grid') {const side=Math.ceil(Math.sqrt(source.count));x=((i%side)/(side-1)-.5)*2*r;z=(Math.floor(i/side)/(side-1)-.5)*2*r;y=0;}
    else {const tube=.24+(rng()-.5)*.12;x=(.8+tube*Math.cos(b))*Math.cos(a)*r;y=tube*Math.sin(b)*r;z=(.8+tube*Math.cos(b))*Math.sin(a)*r;}
    for(const n of project.nodes.slice(1)) {if(!n.enabled)continue; const p=n.params;
      if(n.type==='noise'){const f=p.frequency,s=p.strength;const ox=x,oy=y,oz=z;x+=Math.sin(oy*f+time*.5)*Math.cos(oz*f-time*.3)*s;y+=Math.sin(oz*f+time*.35)*Math.cos(ox*f+time*.2)*s;z+=Math.sin(ox*f-time*.4)*Math.cos(oy*f+time*.3)*s;}
      else if(n.type==='twist'){const a=y*p.amount*Math.PI,ox=x;x=ox*Math.cos(a)-z*Math.sin(a);z=ox*Math.sin(a)+z*Math.cos(a);}
      else if(n.type==='wave') y+=Math.sin(Math.hypot(x,z)*p.frequency*2-time)*p.amount;
      else if(n.type==='attract'){const f=1-p.amount*.7;x*=f;z*=f;}
      else if(n.type==='scale'){x*=p.x;y*=p.y;z*=p.z;}
    }
    points.push({x,y,z,c:i/source.count});
  }
  return points;
}
export class History {
  constructor(limit=30){this.past=[];this.future=[];this.limit=limit;}
  push(project){this.past.push(clone(project));if(this.past.length>this.limit)this.past.shift();this.future=[];}
  undo(current){if(!this.past.length)return current;this.future.push(clone(current));return this.past.pop();}
  redo(current){if(!this.future.length)return current;this.past.push(clone(current));return this.future.pop();}
}
export function moveNode(project,id,direction){const i=project.nodes.findIndex(n=>n.id===id),j=i+direction;if(i<1||j<1||j>=project.nodes.length)return false;[project.nodes[i],project.nodes[j]]=[project.nodes[j],project.nodes[i]];return true;}
