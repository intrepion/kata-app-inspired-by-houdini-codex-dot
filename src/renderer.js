import {palettes} from './model.js';
const rgb = h => [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
export function colorAt(palette,t){const colors=palettes[palette]||palettes.ember;const scaled=Math.max(0,Math.min(.999,t))*(colors.length-1),i=Math.floor(scaled),f=scaled-i,a=rgb(colors[i]),b=rgb(colors[i+1]);return `rgb(${a.map((v,j)=>Math.round(v+(b[j]-v)*f)).join(',')})`;}
export function projectPoint(p,camera,width,height){const cy=Math.cos(camera.yaw),sy=Math.sin(camera.yaw),cp=Math.cos(camera.pitch),sp=Math.sin(camera.pitch);const x=p.x*cy-p.z*sy,z=p.x*sy+p.z*cy,y=p.y*cp-z*sp,depth=p.y*sp+z*cp;const scale=Math.min(width,height)*.275*camera.zoom;return{x:width*.5+x*scale,y:height*.51-y*scale,z:depth};}
export function render(canvas,points,project,options={}){
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,ratio=options.ratio||1;
 ctx.fillStyle='#10151a';ctx.fillRect(0,0,w,h);
 const bg=ctx.createRadialGradient(w*.5,h*.46,0,w*.5,h*.46,w*.5);bg.addColorStop(0,'#20252a');bg.addColorStop(1,'#10151a');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 if(options.grid!==false){ctx.strokeStyle='#293039';ctx.lineWidth=.65*ratio;ctx.beginPath();for(let i=-6;i<=6;i++){const a=projectPoint({x:i*.3,y:-1.25,z:-1.8},project.camera,w,h),b=projectPoint({x:i*.3,y:-1.25,z:1.8},project.camera,w,h),c=projectPoint({x:-1.8,y:-1.25,z:i*.3},project.camera,w,h),d=projectPoint({x:1.8,y:-1.25,z:i*.3},project.camera,w,h);ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.moveTo(c.x,c.y);ctx.lineTo(d.x,d.y);}ctx.stroke();}
 const list=points.map((p,i)=>({...projectPoint(p,project.camera,w,h),t:Math.max(0,Math.min(1,(p.y+1.4)/2.8)),i})).sort((a,b)=>a.z-b.z);
 const colors=Array.from({length:64},(_,i)=>colorAt(project.palette,i/63));ctx.globalCompositeOperation='lighter';
 for(const p of list){const r=project.pointSize*ratio*Math.max(.55,Math.min(1.4,1+p.z*.17));ctx.globalAlpha=.45+Math.max(0,Math.min(.5,(p.z+1.5)*.14));ctx.fillStyle=colors[Math.floor(p.t*63)];ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
 return list.length;
}
