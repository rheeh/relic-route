/* RELIC ROUTE / v2 — layered 2D art, a playable UI, and one shared film renderer. */
(() => {
  'use strict';
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const W = 1600, H = 900, TAU = Math.PI * 2;
  const C = { ink:'#101b27', deep:'#09121c', paper:'#f5f0e6', muted:'#a7b6be', line:'#425462', orange:'#ff8657', cyan:'#a5e1e2', gold:'#d4b481' };
  const crew = [
    { name:'岑遥', en:'LYRA', code:'RR—071', role:'轨道导航员', specialty:'信号解析', second:'精密导航', color:C.orange, quote:'“每一道沉默的信号，都有它的归途。”', desc:'循着微弱的回声，\n寻找遗迹中尚未熄灭的光。', briefing:'我会标记脉冲间隙。让我们沿着光，找到核心。', art:'lyra' },
    { name:'赫朔', en:'ORION', code:'RR—029', role:'遗物工程师', specialty:'结构判读', second:'完整回收', color:C.cyan, quote:'“旧时代的东西，总比看上去更结实。”', desc:'读懂金属与陶瓷的伤痕，\n让远去的文明重新发声。', briefing:'外壳仍然完整。我来确认结构，你负责带它回家。', art:'orion' }
  ];
  const missions = [
    { name:'落锚船坞', en:'THE ANCHOR DOCK', code:'D—03', risk:'低', time:'12', reward:'航行铭牌', rarity:'档案遗物', desc:'在失重货舱中，寻找最后一艘远航船留下的身份铭牌。', note:'船体稳定。靠近舱门时，留意漂浮的陶瓷碎片。', object:'一块仍保留航线刻痕的陶瓷铭牌。它曾指向某个远方。', x:760,y:303, color:C.cyan, tags:['低轨货舱','信号稳定'] },
    { name:'静默环站', en:'THE SILENT OBSERVATORY', code:'M—07', risk:'中', time:'24', reward:'同心环光核', rarity:'稀有遗物', desc:'进入废弃观测环的核心舱，回收一枚仍在规律呼吸的光核。', note:'观测环每隔数秒释放一次脉冲。选择间隙靠近核心。', object:'陶瓷与古铜层层包裹着低温光源。数百年后，它仍在等待下一次观测。', x:1002,y:463, color:C.orange, tags:['环站核心','周期脉冲'] },
    { name:'铜蚀残带', en:'THE VERDIGRIS BELT', code:'V—12', risk:'高', time:'38', reward:'观测铜环', rarity:'研究遗物', desc:'穿过缓慢漂移的残骸带，寻找保留完整星图刻纹的观测环。', note:'碎片的轨道彼此交错。先确认结构，再展开回收。', object:'缺失的一角让星图中断，剩余的刻度依然记录着古老的天空。', x:819,y:676, color:C.gold, tags:['外环残骸','碎片密集'] }
  ];
  const state = {
    screen:'crew', operator:0, previousOperator:0, selected:1, revealed:false, claimed:false,
    hover:'', pressed:'', sceneAt:0, changeAt:-1000, selectionAt:-1000, scanAt:0, claimAt:0,
    transition:null, ready:false, reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
    sound:false, film:false, filmPaused:false, filmAt:0, filmStart:0, recording:false,
    pointer:{x:0,y:0}, parallax:{x:0,y:0}, frozen:false
  };
  const images = {};
  for (const [name,src] of Object.entries({
    hangar:'assets/hangar-v2.png', field:'assets/field.png',
    lyra:'assets/characters/lyra.png', orion:'assets/characters/orion.png',
    relics:'assets/relics-v2.png', destinations:'assets/destinations-v2.png'
  })) { images[name] = new Image(); images[name].src = src; }
  let now=0, audio=null, exportBusy=false;
  const clamp=(v,min=0,max=1)=>Math.max(min,Math.min(max,v));
  const ease=t=>1-Math.pow(1-clamp(t),3);
  const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
  const ambient=t=>(state.reduced||state.frozen)?0:t;
  const font=(size,weight=400,family='Archive')=>weight+' '+size+'px '+family+', "PingFang SC", sans-serif';
  function text(value,x,y,size=18,color=C.paper,weight=400,align='left',family='Archive') {
    ctx.font=font(size,weight,family);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(value,x,y);
  }
  function label(value,x,y,color=C.muted,size=11,spacing=2) {
    ctx.font=font(size,500);ctx.fillStyle=color;ctx.textAlign='left';ctx.textBaseline='alphabetic';
    for(const ch of value){ctx.fillText(ch,x,y);x+=ctx.measureText(ch).width+spacing;}
  }
  function wrap(value,x,y,width,size=18,color=C.muted,leading=30) {
    ctx.font=font(size);let line='',row=0;
    for(const ch of value){if(ch==='\n'){text(line,x,y+row*leading,size,color);line='';row++;continue;}if(ctx.measureText(line+ch).width>width&&!/[，。！？；：、）》”’]/.test(ch)){text(line,x,y+row*leading,size,color);line=ch;row++;}else line+=ch;}
    if(line)text(line,x,y+row*leading,size,color);
  }
  function rect(x,y,w,h,fill) {ctx.fillStyle=fill;ctx.fillRect(x,y,w,h);}
  function line(x1,y1,x2,y2,color=C.line,width=1) {ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function circle(x,y,r,fill=null,stroke=null,width=1) {ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
  function polygon(points,fill,stroke=null,width=1) {ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
  function cutPath(x,y,w,h,cut=12) {ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w-cut,y);ctx.lineTo(x+w,y+cut);ctx.lineTo(x+w,y+h);ctx.lineTo(x+cut,y+h);ctx.lineTo(x,y+h-cut);ctx.closePath();}
  function panel(x,y,w,h,fill='rgba(15,28,40,.88)',stroke=C.line,cut=12) {
    cutPath(x,y,w,h,cut);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}
    line(x+1,y+1,x+w-cut,y+1,'rgba(245,240,230,.15)');
  }
  function arrow(x,y,color=C.ink,left=false) {const d=left?-1:1;line(x-10*d,y,x+10*d,y,color,2);line(x+10*d,y,x+3*d,y-7,color,2);line(x+10*d,y,x+3*d,y+7,color,2);}
  function diamond(x,y,r=5,fill=C.orange) {polygon([[x,y-r],[x+r,y],[x,y+r],[x-r,y]],fill);}
  function brackets(x,y,r,color=C.orange) {for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]){line(x+a*r,y+b*r,x+a*(r-14),y+b*r,color,2);line(x+a*r,y+b*r,x+a*r,y+b*(r-14),color,2);}}
  function icon(kind,x,y,size=24,color=C.paper) {
    ctx.save();ctx.translate(x,y);ctx.scale(size/24,size/24);
    if(kind==='route'){circle(0,0,8,null,color,1.5);line(-10,10,10,-10,color,1.5);diamond(8,-8,3,color);}
    else if(kind==='signal'){for(let i=0;i<4;i++)rect(-10+i*6,9-i*5,3,4+i*5,color);}
    else if(kind==='tool'){polygon([[-8,-9],[-2,-3],[3,-5],[5,-10],[10,-5],[8,1],[2,3],[-7,12],[-12,7],[-3,-2]],null,color,1.5);}
    else if(kind==='scan'){brackets(0,0,10,color);line(-7,0,7,0,color,1.5);circle(0,0,4,null,color);}
    else if(kind==='check'){line(-8,0,-2,6,color,2.5);line(-2,6,10,-7,color,2.5);}
    else if(kind==='warning'){polygon([[0,-11],[11,9],[-11,9]],null,color,1.5);line(0,-4,0,2,color,2);circle(0,6,1,color);}
    else if(kind==='clock'){circle(0,0,10,null,color,1.5);line(0,0,0,-6,color,1.5);line(0,0,5,3,color,1.5);}
    else {polygon([[0,-11],[10,-5],[10,6],[0,12],[-10,6],[-10,-5]],null,color,1.5);circle(0,0,4,null,color,1.5);}
    ctx.restore();
  }
  function glow(x,y,r,color) {const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'rgba(0,0,0,0)');rect(x-r,y-r,r*2,r*2,g);}
  function cover(img,x,y,w,h) {if(!img.naturalWidth)return;const s=Math.max(w/img.width,h/img.height);ctx.drawImage(img,x+(w-img.width*s)/2,y+(h-img.height*s)/2,img.width*s,img.height*s);}
  function destination(index,x,y,w,h) {
    const img=images.destinations;if(!img.naturalWidth)return;
    const sw=img.width/3,sh=img.height,s=Math.max(w/sw,h/sh);
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
    ctx.drawImage(img,sw*index,0,sw,sh,x+(w-sw*s)/2,y+(h-sh*s)/2,sw*s,sh*s);ctx.restore();
  }
  function backdrop(t,mode='hangar') {
    rect(0,0,W,H,C.deep);
    const px=state.reduced?0:state.parallax.x,py=state.reduced?0:state.parallax.y;
    ctx.save();ctx.translate(px*7,py*4);cover(mode==='field'?images.field:images.hangar,-22,-12,W+44,H+24);ctx.restore();
    const g=ctx.createLinearGradient(0,0,W,0);
    g.addColorStop(0,'rgba(8,18,29,.92)');g.addColorStop(.32,'rgba(8,18,29,.60)');g.addColorStop(.56,mode==='map'?'rgba(8,18,29,.88)':'rgba(8,18,29,.12)');g.addColorStop(1,'rgba(8,18,29,.90)');rect(0,0,W,H,g);
    const v=ctx.createLinearGradient(0,0,0,H);v.addColorStop(0,'rgba(8,18,29,.72)');v.addColorStop(.25,'rgba(8,18,29,0)');v.addColorStop(.72,'rgba(8,18,29,.10)');v.addColorStop(1,'rgba(8,18,29,.98)');rect(0,0,W,H,v);
    for(let i=0;i<40;i++){const x=(i*113.17+Math.sin(i)*360+W+ambient(t)*(.003+(i%3)*.001))%W,y=(i*79.61+Math.sin(i*2)*240+H-ambient(t)*.006)%H;circle(x,y,.6+(i%3)*.35,'rgba(217,232,234,'+(.12+(i%5)*.035)+')');}
  }
  function badge(value,x,y,color=C.orange) {ctx.font=font(11,600);const w=ctx.measureText(value).width+18;panel(x,y,w,24,color,null,5);text(value,x+9,y+17,11,C.ink,650);return w;}
  function header(index,title) {
    icon('route',62,45,32,C.orange);text('RELIC ROUTE',89,55,28,C.paper,900,'left','Route');
    line(259,33,259,60,C.line);text('异物航线',279,51,16,C.paper,600);
    const names=['成员整备','任务星图','任务档案','出航确认','回收报告'];
    names.forEach((name,i)=>{const x=518+i*143;const active=i===index;label('0'+(i+1),x,47,active?C.orange:'#647d8c',10,.6);text(name,x+25,49,13,active?C.paper:'#7d929f',active?600:400);if(active)rect(x,66,106,2,C.orange);});
    circle(1416,43,3,C.cyan);label('SECTOR 07',1430,47,C.paper,10,1.2);
    line(40,83,1560,83,'rgba(191,211,218,.20)');
    label(title,50,864,C.muted,10,1.5);label('ORBITAL ARCHAEOLOGY DIVISION',1193,864,C.muted,9,1.4);
  }
  function entrance(t,delay,draw) {
    const p=(state.frozen||state.reduced)?1:ease((t-state.sceneAt-delay)/660);
    ctx.save();ctx.globalAlpha*=p;ctx.translate((1-p)*26,0);draw();ctx.restore();
  }
  function portrait(which,x,y,w,h) {
    const img=images[crew[which].art];if(!img.naturalWidth)return;
    ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
    rect(x,y,w,h,'#273c4b');
    const sh=img.height*.205,sw=sh*w/h,sx=img.width*(which?.52:.47)-sw/2;
    ctx.drawImage(img,sx,img.height*.004,sw,sh,x,y,w,h);ctx.restore();
  }
  function operatorArt(which,x,bottom,height,t,alpha=1) {
    const img=images[crew[which].art];if(!img.naturalWidth)return;
    const breath=state.frozen||state.reduced?0:Math.sin(t*.0018)*.0023;
    const px=state.reduced?0:state.parallax.x*8,py=state.reduced?0:state.parallax.y*4;
    const width=height*img.width/img.height*(1+breath*.55),drawHeight=height*(1+breath);
    ctx.save();ctx.globalAlpha*=alpha;ctx.shadowBlur=30;ctx.shadowColor='rgba(4,13,21,.35)';
    ctx.drawImage(img,x-width/2+px,bottom-drawHeight+py,width,drawHeight);ctx.restore();
  }
  function heroCharacter(t) {
    glow(834,418,330,'rgba(117,194,206,.14)');
    ctx.save();ctx.translate(857,451);ctx.rotate(-.20);ctx.strokeStyle='rgba(180,218,220,.23)';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(0,0,274,356,0,0,TAU);ctx.stroke();ctx.restore();
    const p=(state.reduced||state.frozen)?1:ease((t-state.changeAt)/560);
    if(p<1&&state.previousOperator!==state.operator)operatorArt(state.previousOperator,837-95*p,839,756,t,1-p);
    const appear=(state.frozen||state.reduced)?1:ease((t-state.sceneAt)/850);
    ctx.save();ctx.globalAlpha*=appear;operatorArt(state.operator,837+70*(1-p),839+28*(1-appear),756+28*(1-appear),t,p);ctx.restore();
    if(p<1){ctx.save();ctx.globalCompositeOperation='screen';rect(603+p*434,120,2,690,'rgba(164,233,233,'+(1-p)+')');ctx.restore();}
  }
  function drawCrew(t) {
    backdrop(t);const person=crew[state.operator];header(0,'PREPARATION / 远航员整备');
    ctx.save();ctx.globalAlpha=.075;ctx.font=font(190,900,'Route');ctx.strokeStyle=C.paper;ctx.lineWidth=1;ctx.strokeText(person.en,462,348);ctx.restore();
    heroCharacter(t);
    entrance(t,70,()=>{
      label('EXPEDITION  /  0341',64,151,C.orange,11,2.5);
      text('循迹而行。',59,226,56,C.paper,700);
      text('让失落之物，重见星光。',64,263,18,'#c0cdd1',400);
      line(64,293,400,293,'#536572');
      panel(64,321,322,195,'rgba(20,36,48,.85)','#516572',16);
      icon('route',90,352,20,C.orange);label('本次远航',112,357,C.paper,13,.4);
      text('第七观测区',84,401,27,C.paper,600);
      wrap('古老的环站再次发来信号。\n指派一位成员，开启回收航线。'.replace('\n',''),84,440,272,15,C.muted,26);
      label('02 MEMBERS / READY',65,596,C.muted,11,1.4);
      text('指派远航员',65,632,24,C.paper,600);
    });
    entrance(t,180,()=>{
      const x=1154;
      label(person.code+'  /  ACTIVE',x,192,person.color,11,2);
      text(person.en,x-4,263,75,C.paper,900,'left','Route');
      text(person.name,x,316,45,C.paper,650);
      line(x,340,1536,340,'#65747c');
      icon(state.operator?'tool':'signal',x+13,369,23,person.color);
      text(person.role,x+40,376,19,C.paper,500);
      wrap(person.desc,x,422,350,17,'#c3cfd4',29);
      [person.specialty,person.second].forEach((skill,i)=>{const y=518+i*59;icon(i?'route':'scan',x+14,y-4,21,person.color);text(skill,x+42,y+2,17,C.paper,500);line(x+42,y+17,x+340,y+17,'rgba(164,188,201,.25)');});
      wrap(person.quote,x,674,342,16,person.color,26);
    });
    drawButtons('crew',t);
    label('A / D 切换成员',66,825,C.muted,10,1.1);
  }
  function relic(index,x,y,size,t,alpha=1) {
    const img=images.relics;if(!img.naturalWidth)return;
    const sw=img.width/3,sh=img.height,ratio=sw/sh;
    const h=size,w=size*ratio;
    ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(state.frozen||state.reduced?0:Math.sin(t*.0007)*.017);
    ctx.drawImage(img,sw*index,0,sw,sh,-w/2,-h/2,w,h);ctx.restore();
  }
  function orbitMap(t) {
    ctx.save();ctx.beginPath();ctx.rect(478,115,684,684);ctx.clip();
    glow(850,455,330,'rgba(60,109,130,.24)');
    for(let x=493;x<1160;x+=40)for(let y=120;y<800;y+=40)circle(x,y,.65,'rgba(126,171,190,.18)');
    ctx.save();ctx.translate(848,452);ctx.rotate(-.35);ctx.scale(1,.71);
    for(const r of [158,226,300,374])circle(0,0,r,null,'rgba(156,185,197,.23)',1);
    ctx.setLineDash([2,8]);circle(0,0,335,null,'rgba(173,216,222,.34)');ctx.setLineDash([]);ctx.restore();
    const pg=ctx.createRadialGradient(792,419,5,842,457,111);pg.addColorStop(0,'#789fa5');pg.addColorStop(.44,'#37576a');pg.addColorStop(1,'#102330');
    circle(848,452,108,pg,'#89aeb4',1);
    ctx.save();ctx.beginPath();ctx.arc(848,452,108,0,TAU);ctx.clip();
    for(let i=0;i<8;i++){ctx.beginPath();ctx.ellipse(810+i*10,420+i*20,120,14,.21,0,TAU);ctx.strokeStyle='rgba(139,184,179,.16)';ctx.lineWidth=3;ctx.stroke();}ctx.restore();
    label('NACRE',811,458,'#d8e9e8',11,4);label('07',828,486,C.cyan,11,3);
    const target=missions[state.selected],reveal=ease((t-state.selectionAt)/600);
    ctx.save();ctx.setLineDash([4,8]);line(559,700,target.x,target.y,'rgba(194,227,228,.52)',1);ctx.setLineDash([]);ctx.restore();
    const tracer=state.reduced?1:(ambient(t)*.00016)%1;const tx=559+(target.x-559)*tracer,ty=700+(target.y-700)*tracer;circle(tx,ty,3,C.orange);
    icon('route',559,700,20,C.cyan);label('YOUR SHIP',495,741,C.cyan,9,1.3);
    missions.forEach((m,i)=>{
      const active=i===state.selected,r=active?24:12;
      if(active){glow(m.x,m.y,75,'rgba(255,134,87,.12)');circle(m.x,m.y,44+4*Math.sin(ambient(t)*.002),null,'rgba(255,157,107,.23)');brackets(m.x,m.y,36+(1-reveal)*22,C.orange);}
      circle(m.x,m.y,r,C.deep,active?C.orange:'#7fa5b7',active?2:1);
      diamond(m.x,m.y,active?6:4,active?C.orange:C.cyan);
      const lx=i===1?m.x+48:m.x-20,ly=i===1?m.y-8:m.y-49;
      label(m.code,lx,ly,active?C.orange:C.muted,11,1);
      text(m.name,lx,ly+26,18,active?C.paper:'#b6c7cf',active?600:400);
    });
    ctx.restore();
    label('NAVIGATION ARRAY / ACTIVE SIGNALS 03',510,811,C.muted,10,1.4);
  }
  function drawMap(t) {
    backdrop(t,'map');rect(0,84,W,753,'rgba(5,15,25,.54)');header(1,'NAVIGATION / 选择回收目标');
    const task=missions[state.selected],person=crew[state.operator];
    entrance(t,0,()=>{
      label('EXPLORATION / SECTOR VII',64,155,C.orange,10,2);
      text('选择下一处回声',62,215,39,C.paper,650);
      text('三处异常，一段尚未结束的航线。',65,249,15,C.muted);
    });
    orbitMap(t);
    entrance(t,130,()=>{
      const x=1204;portrait(state.operator,x,127,57,65);
      label('EXPEDITION LEAD',1277,151,C.muted,9,1.2);text(person.name+' / '+person.role,1277,179,15,C.paper,500);
      panel(x,240,332,487,'rgba(17,33,47,.92)','#58717e',15);
      label('TARGET / '+task.code,x+23,276,task.color,10,1.5);text(task.name,x+23,324,31,C.paper,600);
      wrap(task.desc,x+23,363,285,16,C.muted,28);
      line(x+23,445,x+309,445,'#425d6d');
      icon('clock',x+36,480,20,C.cyan);text(task.time,x+61,488,33,C.paper,600);text('分钟',x+118,486,14,C.muted);
      icon('warning',x+212,480,21,task.color);text(task.risk+'风险',x+231,486,15,task.color,500);
      label('RECOVERY OBJECT',x+23,540,C.muted,9,1.4);relic(state.selected,x+74,601,94,t);
      text(task.reward,x+131,591,20,C.paper,500);badge(task.rarity,x+131,607,task.color);
      line(x+23,676,x+309,676,'#425d6d');label('SIGNAL VERIFIED / 可进入',x+23,704,C.cyan,10,.8);
    });
    drawButtons('map',t);
  }
  function drawDossier(t) {
    backdrop(t,'field');rect(0,84,W,753,'rgba(6,18,29,.30)');header(2,'DOSSIER / 任务档案');
    const task=missions[state.selected],person=crew[state.operator];
    entrance(t,40,()=>{
      label('RECOVERY ORDER / '+task.code,66,202,task.color,12,2);
      text(task.name,62,273,57,C.paper,650);label(task.en,66,308,C.muted,14,2.3);
      wrap(task.desc,66,365,502,21,C.paper,36);
      line(65,457,570,457,'#647582');
      const steps=[['01','锁定回声','校准坐标，确认观测区的异常信号。'],['02','完整封存','保持遗物结构与刻纹，交由远航局登记。']];
      steps.forEach(([num,title,desc],i)=>{const y=505+i*97;label(num,66,y,task.color,12,1);text(title,110,y,20,C.paper,550);text(desc,110,y+33,15,C.muted);});
    });
    glow(977,401,340,'rgba(109,186,200,.18)');
    ctx.save();ctx.translate(988,441);ctx.rotate(ambient(t)*.00004);circle(0,0,230,null,'rgba(170,210,214,.27)');ctx.setLineDash([2,13]);circle(0,0,248,null,'rgba(190,224,222,.37)');ctx.setLineDash([]);ctx.restore();
    relic(state.selected,980,414,480,t);
    label('OBJECT / '+('0'+(state.selected+1)),1240,199,C.cyan,10,1.4);
    line(1258,225,1331,225,C.cyan);line(1331,225,1363,257,C.cyan);
    entrance(t,200,()=>{
      panel(1209,373,328,293,'rgba(13,28,40,.92)','#6c808d',14);
      label('RECOVERY INTELLIGENCE',1232,406,C.muted,10,1.2);
      text(task.reward,1232,448,28,C.paper,600);badge(task.rarity,1232,469,task.color);
      wrap(task.note,1232,535,281,16,C.muted,27);
      icon('warning',1243,623,19,task.color);text('环境风险 / '+task.risk,1264,629,15,task.color,500);
      panel(672,700,865,92,'rgba(9,23,35,.91)','#456371',12);portrait(state.operator,687,708,60,70);
      text(person.name,766,735,16,person.color,600);text(person.briefing,766,767,16,C.paper);
    });
    drawButtons('dossier',t);
  }
  function drawConfirm(t) {
    backdrop(t);rect(0,84,W,753,'rgba(4,12,21,.60)');header(3,'DEPARTURE / 出航确认');
    const task=missions[state.selected],person=crew[state.operator];
    operatorArt(state.operator,369,851,742,t,.76);
    glow(852,390,280,'rgba(255,144,95,.10)');
    entrance(t,0,()=>{
      panel(499,158,897,604,'rgba(18,32,45,.97)','#71828c',24);
      rect(499,158,5,112,C.orange);
      label('DEPARTURE CLEARANCE',537,202,C.orange,11,2.3);
      text('准备好，向未知出发。',534,263,38,C.paper,650);
      text('出航前，再看一眼这次约定。',537,303,16,C.muted);
      line(537,335,1353,335,'#526673');
      icon(state.operator?'tool':'signal',548,384,22,person.color);
      label('OPERATOR',574,388,C.muted,10,1.5);text(person.name,537,431,32,C.paper,600);text(person.role,537,466,16,person.color);
      icon('route',967,417,30,C.orange);line(807,417,930,417,C.line);line(1005,417,1108,417,C.line);
      label('DESTINATION',1127,384,C.muted,10,1.3);text(task.name,1125,429,29,C.paper,600);text(task.code+' / '+task.risk+'风险',1127,464,16,task.color);
      panel(537,513,816,101,'rgba(5,17,29,.46)','#3e5667',9);
      icon('clock',566,548,19,C.cyan);label('预计周期',588,553,C.muted,11,0);text(task.time+' 分钟',557,589,24,C.paper,550);
      line(731,535,731,594,C.line);relic(state.selected,788,561,78,t);label('回收目标',836,549,C.muted,11,0);text(task.reward,835,582,24,C.paper,550);
      text('交互演示将直接进入回收报告。',537,651,14,C.muted);
    });
    drawButtons('confirm',t);
  }
  function drawReward(t) {
    rect(0,0,W,H,'#0b1521');
    const task=missions[state.selected],person=crew[state.operator];
    const progress=state.revealed?1:state.scanAt?clamp((t-state.scanAt)/1600):0;
    const done=state.claimed,scanning=state.scanAt>0&&!state.revealed;
    const at=ambient(t);
    glow(867,455,388,'rgba(54,115,139,.23)');glow(833,490,250,'rgba(165,229,228,'+(progress*.17)+')');
    const beams=26;
    ctx.save();ctx.translate(859,470);ctx.rotate(at*.00002);
    for(let i=0;i<beams;i++){const a=i*TAU/beams;line(Math.cos(a)*225,Math.sin(a)*225,Math.cos(a)*720,Math.sin(a)*720,'rgba(96,145,162,.055)',1);}
    circle(0,0,273,null,'rgba(121,184,198,.2)');circle(0,0,289,null,'rgba(121,184,198,.12)');ctx.restore();
    for(let i=0;i<42;i++){const a=i*2.4+at*.0001,r=230+(i*29)%165;circle(857+Math.cos(a)*r,470+Math.sin(a)*r*.77,1+(i%3)*.4,'rgba(154,216,220,'+(.15+progress*.25)+')');}
    header(4,'SALVAGE REPORT / '+task.code);
    entrance(t,0,()=>{
      badge(done?'回收完成':state.revealed?'遗物已识别':'回收成功',64,166,done?C.cyan:C.orange);
      text(done?'光已归航。':'让沉默，',59,242,43,C.paper,650);
      if(!done)text('再次有了回声。',59,306,43,C.paper,650);
      else text('故事仍将继续。',64,294,27,C.muted,450);
      const info=done?'遗物已登记入库，本次航线完成。':state.revealed?'识别完成。请阅读档案并领取遗物。':scanning?'正在读取结构与材质，档案即将揭晓。':'封存完好。启动扫描，读取遗物档案。';
      wrap(info,65,365,371,17,C.muted,30);
      line(65,443,420,443,C.line);
      label('RECOVERED FROM',65,484,C.muted,10,1.5);text(task.name,65,525,25,C.paper,550);
      label('EXPEDITION LEAD',65,597,C.muted,10,1.4);portrait(state.operator,65,620,55,65);text(person.name,138,648,20,person.color,550);text(person.role,138,675,13,C.muted);
      label('REGISTRY  /  RR-0341-0'+(state.selected+1),65,783,C.muted,10,1.5);
    });
    ctx.save();ctx.translate(859,476);ctx.scale(1,.24);
    const floor=ctx.createRadialGradient(0,0,10,0,0,266);floor.addColorStop(0,'rgba(98,206,212,.19)');floor.addColorStop(1,'rgba(98,206,212,0)');circle(0,0,266,floor);
    circle(0,0,218,null,'rgba(172,226,226,.37)',2);ctx.restore();
    if(!state.revealed){
      ctx.save();ctx.globalAlpha=.17;relic(state.selected,859,447,640,t);ctx.restore();
      ctx.save();ctx.beginPath();ctx.rect(580,181,558,566*progress);ctx.clip();relic(state.selected,859,447,640,t);ctx.restore();
      if(scanning){const sy=196+progress*510;ctx.save();ctx.globalCompositeOperation='screen';glow(859,sy,200,'rgba(128,239,240,.20)');line(624,sy,1094,sy,C.cyan,2);ctx.restore();}
      else {icon('scan',859,441,59,C.cyan);label('SEALED / 等待识别',758,728,C.cyan,11,1.4);}
    } else {
      const age=t-(state.scanAt||t-2000),burst=state.reduced||state.frozen?0:clamp(1-age/2200);
      if(burst>0){circle(859,450,200+(1-burst)*160,null,'rgba(175,243,238,'+(burst*.6)+')',2);}
      relic(state.selected,859,435,663,t);
      badge(task.rarity,805,742,task.color);
    }
    for(const [a,b] of [[-1,-1],[1,-1],[-1,1],[1,1]]){const x=859+a*257,y=455+b*268;line(x,y,x-a*23,y,'#608895');line(x,y,x,y-b*23,'#608895');}
    label('OBJECT SCAN',620,160,C.muted,10,1.6);label(progress===1?'COMPLETE':Math.round(progress*100)+'%',1055,160,C.cyan,10,1.4);
    entrance(t,160,()=>{
      panel(1211,290,325,411,'rgba(21,38,52,.88)','#557683',14);
      label(done?'ARCHIVED':'RECOVERY OBJECT',1235,326,done?C.cyan:C.muted,10,1.5);
      text(state.revealed?task.reward:'未知遗物',1235,378,29,C.paper,600);
      line(1235,402,1512,402,C.line);
      wrap(state.revealed?task.object:'扫描遗物，读取名称与材质。\n让古老的观测记录再次显现。',1235,441,275,16,C.muted,29);
      icon(done?'check':'cube',1247,585,23,done?C.cyan:C.orange);text(done?'已登记入库':'封存状态 · 完整',1271,591,16,done?C.cyan:C.paper,500);
      if(done)label('COLLECTION UPDATED',1235,656,C.cyan,10,1);
    });
    if(done&&!state.reduced&&!state.frozen){const p=clamp((t-state.claimAt)/1100);if(p<1){ctx.save();ctx.globalAlpha=1-p;circle(1372,600,p*115,null,C.cyan,2);ctx.restore();}}
    drawButtons('reward',t);
  }
  function drawClosing(t) {
    backdrop(t);rect(0,0,W,H,'rgba(6,17,27,.53)');operatorArt(0,565,1015,890,t,.65);operatorArt(1,1080,1020,900,t,.62);
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(6,17,27,.28)');g.addColorStop(.5,'rgba(6,17,27,.74)');g.addColorStop(1,'rgba(6,17,27,.95)');rect(0,0,W,H,g);
    icon('route',800,310,72,C.orange);text('RELIC ROUTE',800,456,113,C.paper,900,'center','Route');text('异物航线',800,520,31,C.paper,600,'center');
    line(664,560,936,560,C.orange);text('循迹而行，让失落之物重见星光。',800,610,19,C.muted,400,'center');
    label('CHARACTER / INTERFACE / MOTION',613,793,C.paper,11,2.3);
  }
  function buttonsFor(screen) {
    const list=[];const add=(id,name,x,y,w,h=58,kind='secondary',extra={})=>list.push({id,name,x,y,w,h,kind,...extra});
    if(screen==='crew'){
      crew.forEach((p,i)=>add('crew-'+i,'指派'+p.name,64+i*168,658,152,136,'portrait',{operator:i,selected:state.operator===i}));
      add('open-map','确认成员 · 打开星图',1154,735,382,66,'primary');
    } else if(screen==='map'){
      add('back-crew','返回整备',64,108,112,32,'back');
      missions.forEach((m,i)=>{add('mission-'+i,'选择'+m.name,64,288+i*159,369,141,'mission',{mission:i,selected:state.selected===i});add('point-'+i,'星图节点 '+m.name,m.x-34,m.y-34,68,68,'point',{mission:i,selected:state.selected===i});});
      add('details','查看任务档案',1204,747,332,59,'primary');
    } else if(screen==='dossier'){
      add('back-map','返回星图',64,113,116,36,'back');add('confirm','核对出航信息',64,716,490,70,'primary');
    } else if(screen==='confirm'){
      add('back-dossier','返回任务',64,113,116,36,'back');add('cancel','返回修改',537,675,202,57,'secondary');add('depart','确认航线 · 出发',1025,674,328,59,'primary');
    } else if(screen==='reward'){
      if(state.claimed)add('back-map','返回星图',1211,725,325,66,'primary');
      else if(state.revealed)add('claim','领取遗物',1211,725,325,66,'primary');
      else add('scan',state.scanAt?'正在识别遗物':'启动遗物扫描',1211,725,325,66,'primary',{disabled:!!state.scanAt});
      if(!state.claimed)add('back-map','返回星图',1211,800,140,32,'back');
    }
    return list;
  }
  function drawButtons(screen,t) {
    for(const b of buttonsFor(screen)){
      const hovered=state.hover===b.id,pressed=state.pressed===b.id,task=missions[b.mission];
      if(b.kind==='point')continue;
      ctx.save();
      if(b.kind==='portrait'){
        panel(b.x,b.y,b.w,b.h,b.selected?'#394448':'rgba(11,23,35,.91)',b.selected?C.orange:hovered?C.paper:'#59717f',9);
        ctx.save();cutPath(b.x+3,b.y+3,b.w-6,b.h-6,8);ctx.clip();portrait(b.operator,b.x+9,b.y+2,b.w-18,b.h-24);ctx.restore();
        const shade=ctx.createLinearGradient(0,b.y+54,0,b.y+b.h);shade.addColorStop(0,'rgba(7,18,30,0)');shade.addColorStop(1,'rgba(7,18,30,.96)');panel(b.x+3,b.y+30,b.w-6,b.h-33,shade,null,5);
        text(crew[b.operator].name,b.x+14,b.y+b.h-14,17,b.selected?C.orange:C.paper,600);if(b.selected){rect(b.x,b.y,3,b.h-9,C.orange);icon('check',b.x+b.w-20,b.y+b.h-20,16,C.orange);}
      } else if(b.kind==='mission'){
        panel(b.x,b.y,b.w,b.h,b.selected?'rgba(46,62,68,.98)':hovered?'rgba(33,49,63,.96)':'rgba(15,31,45,.88)',b.selected?task.color:hovered?'#9db0bb':'#405967',12);
        destination(b.mission,b.x+10,b.y+11,98,b.h-22);
        rect(b.x+16,b.y+b.h-38,23,23,'rgba(9,22,32,.83)');icon(b.mission===1?'route':b.mission?'cube':'signal',b.x+27.5,b.y+b.h-26.5,15,task.color);
        label(task.code,b.x+128,b.y+30,b.selected?task.color:C.muted,10,1.3);text(task.name,b.x+128,b.y+65,24,C.paper,550);
        text(task.tags[0],b.x+128,b.y+94,12,C.muted);icon('warning',b.x+138,b.y+118,13,task.color);text(task.risk+'风险',b.x+151,b.y+123,12,C.muted);
        if(b.selected){rect(b.x,b.y,3,b.h-12,task.color);arrow(b.x+b.w-26,b.y+49,task.color);}
      } else if(b.kind==='back'){
        arrow(b.x+14,b.y+b.h/2,hovered?C.orange:C.muted,true);text(b.name,b.x+36,b.y+b.h/2+5,13,hovered?C.paper:C.muted,500);
      } else {
        const primary=b.kind==='primary',bg=b.disabled?'#304b59':primary?(pressed?'#d8663c':hovered?'#ffa478':C.orange):(hovered?'#304557':'#182a3a');
        const fg=b.disabled?'#809aa8':primary?C.ink:C.paper;
        panel(b.x,b.y+(pressed?2:0),b.w,b.h,bg,primary?null:'#647581',11);
        text(b.name,b.x+22,b.y+b.h/2+7,18,fg,650);arrow(b.x+b.w-29,b.y+b.h/2+1,fg);
        if(primary&&!b.disabled){line(b.x+14,b.y+2,b.x+b.w-18,b.y+2,'rgba(255,242,220,.45)');if(hovered){ctx.save();ctx.globalAlpha=.2;polygon([[b.x+b.w-87,b.y],[b.x+b.w-62,b.y],[b.x+b.w-99,b.y+b.h],[b.x+b.w-124,b.y+b.h]],C.paper);ctx.restore();}}
      }
      ctx.restore();
    }
  }
  const painters={crew:drawCrew,map:drawMap,dossier:drawDossier,confirm:drawConfirm,reward:drawReward,closing:drawClosing};
  function paint(screen,t) {painters[screen](t);}
  function updateDescription() {
    const names={crew:'远航员整备',map:'任务星图',dossier:'任务档案',confirm:'出航确认',reward:'回收报告',closing:'异物航线'};
    document.querySelector('#screen-title').textContent=names[state.screen];
    const person=crew[state.operator],task=missions[state.selected];
    document.querySelector('#screen-description').textContent='当前成员：'+person.name+'，'+person.role+'。任务：'+task.name+'。'+task.desc+' 风险'+task.risk+'。'+(state.screen==='reward'?(state.claimed?'遗物已入库。':state.revealed?'识别完成，可以领取遗物。':state.scanAt?'正在识别遗物。':'等待扫描。'):'');
  }
  function updateControls(focus=true) {
    const root=document.querySelector('#controls');root.replaceChildren();
    if(!state.film)for(const b of buttonsFor(state.screen)){
      const element=document.createElement('button');element.type='button';element.className='game-button';element.textContent=b.name;element.title=b.name;element.disabled=!!b.disabled;
      element.dataset.action=b.id;Object.assign(element.style,{left:b.x/W*100+'%',top:b.y/H*100+'%',width:b.w/W*100+'%',height:b.h/H*100+'%'});
      if(b.kind==='portrait'||b.kind==='mission'||b.kind==='point')element.setAttribute('aria-pressed',String(b.selected));
      element.addEventListener('pointerenter',()=>state.hover=b.id);element.addEventListener('pointerleave',()=>{state.hover='';state.pressed='';});
      element.addEventListener('pointerdown',()=>state.pressed=b.id);element.addEventListener('pointerup',()=>state.pressed='');
      element.addEventListener('focus',()=>state.hover=b.id);element.addEventListener('blur',()=>state.hover='');
      element.addEventListener('click',()=>act(b.id));root.append(element);
    }
    updateDescription();if(focus&&!state.film)root.querySelector('button:not(:disabled)')?.focus({preventScroll:true});
  }
  const announce=value=>document.querySelector('#announcement').textContent=value;
  function sound(kind) {
    if(!state.sound)return;
    try{
      audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();
      const tones={select:[420,660],open:[300,520],scan:[180,920],claim:[660,990],arrive:[240,480]},notes=tones[kind]||tones.open;
      notes.forEach((frequency,i)=>{const o=audio.createOscillator(),gain=audio.createGain(),start=audio.currentTime+i*.075;o.type='sine';o.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.04,start+.008);gain.gain.exponentialRampToValueAtTime(.001,start+.19);o.connect(gain);gain.connect(audio.destination);o.start(start);o.stop(start+.22);});
    }catch(_){/* Audio is an optional enhancement. */}
  }
  function go(screen) {
    const frame=document.createElement('canvas');frame.width=W;frame.height=H;frame.getContext('2d').drawImage(canvas,0,0);
    state.transition={frame,at:performance.now(),duration:720};state.screen=screen;state.sceneAt=performance.now();state.hover='';state.pressed='';updateControls();sound(screen==='reward'?'arrive':'open');
  }
  function selectOperator(index) {
    if(state.operator===index)return;
    state.previousOperator=state.operator;state.operator=index;state.changeAt=performance.now();updateControls(false);sound('select');announce('已指派'+crew[index].name+'，'+crew[index].role+'。');
  }
  function act(id) {
    if(state.film||exportBusy)return;
    if(id.startsWith('crew-'))selectOperator(+id.slice(5));
    else if(id.startsWith('mission-')||id.startsWith('point-')){state.selected=+id.split('-')[1];state.selectionAt=performance.now();state.revealed=false;state.claimed=false;state.scanAt=0;updateControls(false);sound('select');announce('已选择'+missions[state.selected].name);}
    else if(id==='open-map'||id==='back-map')go('map');
    else if(id==='back-crew')go('crew');
    else if(id==='details'||id==='back-dossier'||id==='cancel')go('dossier');
    else if(id==='confirm')go('confirm');
    else if(id==='depart'){state.revealed=false;state.claimed=false;state.scanAt=0;go('reward');announce('航线已确认。演示进入回收报告。');}
    else if(id==='scan'&&!state.scanAt){state.scanAt=performance.now();sound('scan');if(state.reduced)state.revealed=true;updateControls(false);announce(state.revealed?'识别完成。':'正在读取遗物档案。');}
    else if(id==='claim'&&state.revealed&&!state.claimed){state.claimed=true;state.claimAt=performance.now();updateControls();sound('claim');announce(missions[state.selected].reward+'已入库。本次回收完成。');}
  }
  const timeLabel=s=>'00:'+String(Math.floor(s)).padStart(2,'0');
  function filmFrame(s,t) {
    const sequence=[['crew',0],['map',6],['dossier',12],['confirm',16],['reward',20],['closing',28]];
    let index=0;sequence.forEach((item,i)=>{if(s>=item[1])index=i;});
    const screen=sequence[index][0],elapsed=s-sequence[index][1];
    state.screen=screen;state.sceneAt=t-elapsed*1000;state.operator=s>=2&&s<4?1:0;state.previousOperator=s>=4?1:0;state.changeAt=t-(s>=4?s-4:s>=2?s-2:1)*1000;
    state.selected=s>=8&&s<10?2:1;state.selectionAt=t-(s>=10?s-10:s>=8?s-8:1)*1000;
    state.scanAt=s>=21?t-(s-21)*1000:0;state.revealed=s>=22.6;state.claimed=s>=25;state.claimAt=t-(s-25)*1000;
    state.hover='';state.pressed='';
    for(const [cue,id] of [[6,'open-map'],[12,'details'],[16,'confirm'],[20,'depart'],[21,'scan'],[25,'claim']]){if(s>=cue-.4&&s<cue)state.hover=id;if(s>=cue-.12&&s<cue)state.pressed=id;}
    paint(screen,t);
    if(index&&elapsed<.72&&!state.reduced){
      const p=ease(elapsed/.72),x=W*p;ctx.save();ctx.globalAlpha=(1-p)*.9;polygon([[x-170,0],[W,0],[W,H],[x+70,H]],C.deep);ctx.restore();
      line(x-160,0,x+80,H,'rgba(255,146,96,'+(1-p)+')',2);
    }
    label('0'+(Math.min(index,4)+1)+' / '+['成员整备','选择回声','任务档案','出航确认','遗物显影','航线继续'][index],64,892,C.orange,10,1);
  }
  function render(t) {
    now=t;if(!state.ready)return;
    state.parallax.x+=(state.pointer.x-state.parallax.x)*.045;state.parallax.y+=(state.pointer.y-state.parallax.y)*.045;
    if(state.film){
      if(!state.filmPaused)state.filmAt=clamp((t-state.filmStart)/1000,0,30);
      filmFrame(state.filmAt,t);
      document.querySelector('#film-time').value=state.filmAt;document.querySelector('#film-time-label').value=timeLabel(state.filmAt)+' / 00:30';
      if(state.filmAt>=30&&!state.recording){state.filmPaused=true;document.querySelector('#pause-film').textContent='重播';}
      return;
    }
    if(state.scanAt&&!state.revealed&&t-state.scanAt>=1600){state.revealed=true;updateControls();announce('识别完成：'+missions[state.selected].reward);}
    const tr=state.transition,p=tr?clamp((t-tr.at)/tr.duration):1;
    if(tr&&p<1&&!state.reduced){
      ctx.drawImage(tr.frame,-ease(p)*70,0);ctx.save();
      const edge=W*(1-ease(p));ctx.beginPath();ctx.moveTo(edge-100,0);ctx.lineTo(W,0);ctx.lineTo(W,H);ctx.lineTo(edge+100,H);ctx.closePath();ctx.clip();paint(state.screen,t);ctx.restore();
      line(edge-100,0,edge+100,H,'rgba(226,235,230,'+(Math.sin(p*Math.PI)*.7)+')',2);
    }else {state.transition=null;paint(state.screen,t);}
  }
  function loop(t){render(t);requestAnimationFrame(loop);}
  const stage=document.querySelector('#stage');
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();state.pointer.x=(e.clientX-r.left)/r.width*2-1;state.pointer.y=(e.clientY-r.top)/r.height*2-1;});
  stage.addEventListener('pointerleave',()=>{state.pointer.x=0;state.pointer.y=0;});
  function setRecordingControls(disabled) {['film','motion','sound','pause-film','exit-film','film-time','export-frames','export-film'].forEach(id=>document.getElementById(id).disabled=disabled);}
  function startFilm(){state.film=true;state.filmPaused=false;state.filmAt=0;state.filmStart=performance.now();state.transition=null;state.pointer.x=0;state.pointer.y=0;document.querySelector('#film-controls').hidden=false;document.querySelector('#pause-film').textContent='暂停';document.querySelector('#controls').replaceChildren();}
  function stopFilm(){if(state.recording)return;state.film=false;state.filmPaused=false;state.screen='crew';state.operator=0;state.previousOperator=0;state.selected=1;state.scanAt=0;state.claimed=false;state.revealed=false;state.sceneAt=performance.now();state.changeAt=-1000;state.transition=null;document.querySelector('#film-controls').hidden=true;updateControls(false);}
  document.querySelector('#film').addEventListener('click',startFilm);document.querySelector('#exit-film').addEventListener('click',stopFilm);
  document.querySelector('#pause-film').addEventListener('click',()=>{if(state.filmAt>=30){startFilm();return;}state.filmPaused=!state.filmPaused;if(!state.filmPaused)state.filmStart=performance.now()-state.filmAt*1000;document.querySelector('#pause-film').textContent=state.filmPaused?'继续':'暂停';});
  document.querySelector('#film-time').addEventListener('input',e=>{state.filmAt=+e.target.value;state.filmStart=performance.now()-state.filmAt*1000;state.filmPaused=true;document.querySelector('#pause-film').textContent='继续';render(performance.now());});
  document.querySelector('#motion').setAttribute('aria-pressed',String(state.reduced));
  document.querySelector('#motion').addEventListener('click',e=>{state.reduced=!state.reduced;e.currentTarget.setAttribute('aria-pressed',String(state.reduced));if(state.scanAt){state.revealed=true;updateControls(false);}});
  document.querySelector('#sound').addEventListener('click',e=>{state.sound=!state.sound;e.currentTarget.textContent='声音：'+(state.sound?'开':'关');e.currentTarget.setAttribute('aria-pressed',String(state.sound));sound('select');});
  document.addEventListener('keydown',e=>{
    if(e.target.matches('input,textarea,summary')||e.altKey||e.ctrlKey||e.metaKey||state.recording||exportBusy)return;
    if(e.key==='Escape'){e.preventDefault();if(state.film)stopFilm();else if(state.screen==='confirm')go('dossier');else if(['dossier','reward'].includes(state.screen))go('map');else if(state.screen==='map')go('crew');}
    else if(!state.film&&state.screen==='crew'&&['a','d','ArrowLeft','ArrowRight','1','2'].includes(e.key)){e.preventDefault();selectOperator(['a','ArrowLeft','1'].includes(e.key)?0:1);}
    else if(!state.film&&state.screen==='map'&&['1','2','3'].includes(e.key)){e.preventDefault();act('mission-'+(+e.key-1));}
    else if(!state.film&&e.key==='Enter'&&e.target===document.body){act({crew:'open-map',map:'details',dossier:'confirm',confirm:'depart',reward:state.claimed?'back-map':state.revealed?'claim':'scan'}[state.screen]);}
  });
  async function save(blob,name){const response=await fetch('/__export/'+name,{method:'POST',headers:{'Content-Type':blob.type},body:blob});if(!response.ok)throw Error('请使用 scripts/serve.py 启动本地导出服务。');return response.json();}
  const png=()=>new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  document.querySelector('#export-frames').addEventListener('click',async()=>{
    const out=document.querySelector('#export-status');stopFilm();exportBusy=true;setRecordingControls(true);
    try{
      state.frozen=true;state.operator=0;state.previousOperator=0;state.selected=1;state.transition=null;state.hover='';state.pressed='';state.parallax.x=0;state.parallax.y=0;
      for(const [screen,name] of [['crew','00-crew.png'],['map','01-map.png'],['dossier','02-dossier.png'],['confirm','03-confirm.png'],['reward','04-reward.png']]){
        state.screen=screen;state.revealed=screen==='reward';state.claimed=false;state.scanAt=0;paint(screen,performance.now());await save(await png(),name);
      }
      out.textContent='五张 1600 × 900 原生界面图已保存到 showcase/。';
    }catch(error){out.textContent=error.message;}finally{state.frozen=false;exportBusy=false;setRecordingControls(false);stopFilm();}
  });
  document.querySelector('#export-film').addEventListener('click',()=>{
    const out=document.querySelector('#export-status');
    if(!window.MediaRecorder||!canvas.captureStream){out.textContent='此浏览器不支持 Canvas 录制。';return;}
    const type=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(v=>MediaRecorder.isTypeSupported(v));
    if(!type){out.textContent='此浏览器不支持 WebM 录制。';return;}
    const chunks=[],stream=canvas.captureStream(60),recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:12000000});
    state.recording=true;setRecordingControls(true);startFilm();
    recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
    recorder.onstop=async()=>{
      stream.getTracks().forEach(track=>track.stop());state.recording=false;state.filmPaused=true;
      try{await save(new Blob(chunks,{type}),'film.webm');out.textContent='30 秒角色与航线演出已保存，可运行 scripts/encode-film.sh 生成 MP4。';}
      catch(error){out.textContent=error.message;}finally{setRecordingControls(false);document.querySelector('#pause-film').textContent='重播';}
    };
    recorder.start(1000);out.textContent='录制中：0 / 30 秒';
    const tick=setInterval(()=>{out.textContent='录制中：'+Math.min(30,Math.floor(state.filmAt))+' / 30 秒';if(state.filmAt>=30){clearInterval(tick);recorder.stop();}},250);
  });
  if(new URLSearchParams(location.search).has('studio'))document.querySelector('#studio').hidden=false;
  Promise.all([document.fonts.load('400 18px Archive'),document.fonts.load('900 48px Route'),...Object.values(images).map(img=>img.decode())]).then(()=>{
    state.ready=true;state.sceneAt=performance.now();document.querySelector('#loading').hidden=true;updateControls(false);
    if(new URLSearchParams(location.search).has('film'))startFilm();requestAnimationFrame(loop);
  }).catch(error=>{document.querySelector('#loading p').textContent='素材未能载入，请检查文件或刷新。';console.error(error);});
})();
