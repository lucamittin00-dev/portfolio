// A deliberately simple layout study based on Manta Concept V1.
// Coordinates are illustrative proportions, not fabrication dimensions.
const NS = 'http://www.w3.org/2000/svg';
const add=(a,b)=>a.map((v,i)=>v+b[i]);
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const mul=(a,k)=>a.map(v=>v*k);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>mul(a,1/Math.hypot(...a));

export function modelSVG(azimuth=0.6, elevation=0.55, labels=false) {
  const ca=Math.cos(azimuth),sa=Math.sin(azimuth),ce=Math.cos(elevation),se=Math.sin(elevation);
  let scale=3.25,centerX=470,centerY=726;
  const raw=p=>{
    const x=p[0]*ca-p[1]*sa,y=p[0]*sa+p[1]*ca;
    return {x,y:y*se-p[2]*ce,depth:y*ce+p[2]*se};
  };
  const project=p=>{
    const q=raw(p);
    return {x:centerX+q.x*scale,y:centerY+q.y*scale,depth:q.depth};
  };
  const faces=[];
  const tones={frame:['#777777','#979797','#5d5d5d','#898989','#666666','#ababab'],dark:['#484848','#747474','#414141','#616161','#505050','#878787'],focus:['#adadad','#dedede','#919191','#c7c7c7','#a4a4a4','#eeeeee'],antenna:['#9b9b9b','#cbcbcb','#838383','#b0b0b0','#929292','#dfdfdf']};
  function face(points,color){faces.push({points,color,depth:points.reduce((s,p)=>s+project(p).depth,0)/points.length});}
  function beam(a,b,width,kind='frame',depth=width){
    const axis=norm(sub(b,a));const u=norm(Math.abs(axis[2])>.98?[1,0,0]:cross(axis,[0,0,1]));const v=norm(cross(axis,u));
    const offsets=[add(mul(u,-width/2),mul(v,-depth/2)),add(mul(u,width/2),mul(v,-depth/2)),add(mul(u,width/2),mul(v,depth/2)),add(mul(u,-width/2),mul(v,depth/2))];
    const p=offsets.map(o=>add(a,o)).concat(offsets.map(o=>add(b,o)));const t=tones[kind];
    [[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].forEach((ix,i)=>face(ix.map(j=>p[j]),t[i]));
  }
  function box(x,y,z,w,d,h,kind='frame'){beam([x,y,z],[x,y,z+h],w,kind,d);}
  function cylinder(x,y,z,r,h,kind='dark',sides=10){
    const t=tones[kind],a=[],b=[];
    for(let i=0;i<sides;i++){const q=2*Math.PI*i/sides;a.push([x+r*Math.cos(q),y+r*Math.sin(q),z]);b.push([x+r*Math.cos(q),y+r*Math.sin(q),z+h]);}
    for(let i=0;i<sides;i++)face([a[i],a[(i+1)%sides],b[(i+1)%sides],b[i]],t[i%5]);face(b,t[5]);
  }
  const tips=[[-40,-23,129],[40,-23,129],[0,46,129]];
  // Ground envelope, three plain tripod legs, and a small flat head.
  for(const [x,y] of [[-47,-28],[47,-28],[0,51]]){
    beam([x,y,2],[x*.13,y*.13,120],4.5,'frame',3.6);
    box(x,y,0,6,6,5,'dark');
    beam([0,0,75],[x*.7,y*.7,41],1.3,'dark');
  }
  cylinder(0,0,119,11,7,'dark');
  cylinder(0,0,126,10,5,'frame');
  for(let i=0;i<3;i++){
    beam([0,0,129],tips[i],3.1,'frame');
    beam(tips[i],tips[(i+1)%3],2.2,'frame');
    const [x,y,z]=tips[i];box(x,y,z,12,12,2,'dark');
  }
  // Triangular prism enclosure: intentionally no logo, ports or finished details.
  const tri=[[-16,-9.2,132],[16,-9.2,132],[0,18.4,132]],top=tri.map(p=>[p[0],p[1],p[2]+11]);
  for(let i=0;i<3;i++)face([tri[i],tri[(i+1)%3],top[(i+1)%3],top[i]],tones.focus[i+1]);
  face(top,tones.focus[5]);
  // Starter configuration: one simplified pan/tilt Yagi, two omni rods.
  const [x,y]=tips[0];cylinder(x,y,131,7,5,'dark');
  box(x,y,136,7,7,7,'dark');
  box(x-4,y,142,2.5,5,22,'frame');box(x+4,y,142,2.5,5,22,'frame');
  beam([x-6,y,163],[x+6,y,163],3.6,'dark');
  const origin=[x,y,166],axis=norm([.88,.15,.42]),perp=norm([-.15,.88,0]);
  beam(add(origin,mul(axis,-31)),add(origin,mul(axis,31)),2.2,'antenna');
  [-27,-14,0,14,27].forEach((s,i)=>{const p=add(origin,mul(axis,s));const half=9-i*.7;beam(add(p,mul(perp,-half)),add(p,mul(perp,half)),.95,'antenna');});
  for(let i=1;i<3;i++){const [a,b]=tips[i];box(a,b,131,5,5,4,'dark');beam([a,b,135],[a,b,161],1.4,'antenna');}
  // Reframe every view so the top-view toggle and rotation stay inside the canvas.
  const bounds=faces.flatMap(f=>f.points.map(raw));
  const minX=Math.min(...bounds.map(p=>p.x)),maxX=Math.max(...bounds.map(p=>p.x));
  const minY=Math.min(...bounds.map(p=>p.y)),maxY=Math.max(...bounds.map(p=>p.y));
  scale=Math.min(790/(maxX-minX),660/(maxY-minY));
  centerX=480-(minX+maxX)*scale/2;centerY=400-(minY+maxY)*scale/2;
  const line=(a,b,color='#414141',opacity=.5)=>{a=project(a);b=project(b);return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${color}" stroke-width="1" opacity="${opacity}"/>`;};
  let grid='';for(let i=-70;i<=70;i+=14){grid+=line([i,-70,0],[i,70,0]);grid+=line([-70,i,0],[70,i,0]);}
  faces.sort((a,b)=>a.depth-b.depth);
  const polygons=faces.map(f=>`<polygon points="${f.points.map(p=>{const q=project(p);return q.x.toFixed(1)+','+q.y.toFixed(1);}).join(' ')}" fill="${f.color}" stroke="#192016" stroke-width="1.05" stroke-linejoin="round"/>`).join('');
  let annotations='';
  if(labels){
    const p=project([0,-8,140]),q=project([-40,-23,163]);
    annotations=`<g fill="none" stroke="#b49c73" stroke-width="1.4"><path d="M${p.x},${p.y} L740,365 H848"/><path d="M${q.x},${q.y} L212,163 H90"/></g><g fill="#dbdbc9" font-family="Arial,sans-serif" font-size="20"><text x="742" y="350">Enclosure study</text><text x="90" y="146">Antenna layout</text></g>`;
  }
  return `<svg xmlns="${NS}" viewBox="0 0 960 820" role="img" aria-labelledby="model-title model-desc"><title id="model-title">Dogtooth Manta ground station, geometric concept</title><desc id="model-desc">A simplified tripod supports a triangular frame and central triangular enclosure. One pan-and-tilt directional antenna and two vertical omni antennas show the starter layout. This is a provisional illustration, not a dimensioned CAD model.</desc>${grid}${polygons}${annotations}</svg>`;
}

if(typeof document!=='undefined'){
  document.querySelectorAll('[data-dogtooth-model]').forEach(host=>{
    let azimuth=.6,elevation=.55,drag=null;
    const panel=host.closest('.model-panel');
    const draw=()=>{
      host.innerHTML=modelSVG(azimuth,elevation,false);
      panel.querySelector('[data-model-action="top"]').setAttribute('aria-pressed',String(elevation>.8));
    };draw();
    panel.querySelectorAll('[data-model-action]').forEach(button=>button.addEventListener('click',()=>{
      const a=button.dataset.modelAction;
      if(a==='left')azimuth-=.3;
      if(a==='right')azimuth+=.3;
      if(a==='reset'){azimuth=.6;elevation=.55;}
      if(a==='top'){elevation=elevation>.8?.55:1.25;}
      draw();
    }));
    host.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'){drag={x:e.clientX,angle:azimuth};host.setPointerCapture(e.pointerId);}});
    host.addEventListener('pointermove',e=>{if(drag){azimuth=drag.angle+(e.clientX-drag.x)*.007;draw();}});
    for(const event of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(event,()=>{drag=null;});
  });
}
