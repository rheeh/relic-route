/* Original Canvas weapon studies. All positions below use a 720 × 530 stage. */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const C = { paper:'#e9e4d6', light:'#fff8e8', ink:'#142330', dark:'#09141d', metal:'#435866', copper:'#b38e60', edge:'#71828a' };
  const ENERGY = ['#a8eef1','#ff9761','#78dbc1','#e4c17b'];
  const clamp = (n, a=0, b=1) => Math.max(a, Math.min(b, n));
  const mix = (a,b,t) => a+(b-a)*t;
  const seed = n => { const v=Math.sin(n*127.1+311.7)*43758.5453; return v-Math.floor(v); };
  const finite = (n,fallback) => Number.isFinite(n) ? n : fallback;

  function polygon(ctx, points, fill, stroke, width=1) {
    ctx.beginPath(); points.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1])); ctx.closePath();
    if(fill) { ctx.fillStyle=fill; ctx.fill(); }
    if(stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=width; ctx.stroke(); }
  }
  function line(ctx, points, color, width=1) {
    ctx.beginPath(); points.forEach((p,i) => i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]));
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.stroke();
  }
  function ellipse(ctx,x,y,rx,ry,fill,stroke,width=1,rotation=0) {
    ctx.beginPath(); ctx.ellipse(x,y,rx,ry,rotation,0,TAU);
    if(fill) {ctx.fillStyle=fill;ctx.fill();}
    if(stroke) {ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
  }
  function gradient(ctx, y1,y2, top,bottom) {
    const g=ctx.createLinearGradient(0,y1,0,y2);g.addColorStop(0,top);g.addColorStop(1,bottom);return g;
  }
  function glow(ctx,x,y,r,color,alpha=.2) {
    ctx.save();ctx.globalAlpha*=alpha;
    const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(.2,color);g.addColorStop(1,'transparent');
    ellipse(ctx,x,y,r,r,g);ctx.restore();
  }
  function litLine(ctx,points,color,width=2,alpha=1) {
    ctx.save();ctx.globalAlpha*=alpha;ctx.shadowColor=color;ctx.shadowBlur=9;
    line(ctx,points,color,width);ctx.shadowBlur=0;line(ctx,points,C.light,Math.max(.55,width*.25));ctx.restore();
  }
  function armor(ctx,points,ivory=true) {
    polygon(ctx,points.map(p=>[p[0]+5,p[1]+7]),ivory?'#5e665f':'#06111a',C.dark,1.2);
    polygon(ctx,points,gradient(ctx,-70,70,ivory?C.light:'#456071',ivory?'#aaa99c':'#112330'),ivory?'#f9efd7':C.edge,1);
  }
  function bolt(ctx,x,y,r=2) {
    ellipse(ctx,x+1,y+1,r+1,r+1,C.dark);ellipse(ctx,x,y,r,r,C.copper);
    line(ctx,[[x-r*.5,y],[x+r*.5,y]],'#4b463a',.7);
  }
  function engraving(ctx,x,y,count=4,step=7) {
    for(let i=0;i<count;i++)line(ctx,[[x+i*step,y],[x+3+i*step,y+8]],'#4c615f',.9);
  }

  function stage(ctx,color,time,reduced) {
    const floor=gradient(ctx,310,530,'rgba(39,61,72,0)','rgba(30,49,62,.62)');
    ctx.fillStyle=floor;ctx.fillRect(0,312,720,218);
    ctx.save();ctx.beginPath();ctx.rect(0,315,720,215);ctx.clip();
    for(let i=-7;i<=9;i++)line(ctx,[[360+i*12,315],[360+i*103,530]],'rgba(133,167,178,.10)',.8);
    [330,350,379,419,476,525].forEach(y=>line(ctx,[[0,y],[720,y]],'rgba(133,167,178,.10)',.8));
    ctx.restore();
    ellipse(ctx,282,441,215,35,'rgba(0,7,12,.34)');
    polygon(ctx,[[72,427],[116,386],[451,386],[505,427],[469,456],[101,456]],'#12232f','#4b6170',1);
    polygon(ctx,[[72,427],[505,427],[469,456],[101,456]],gradient(ctx,427,456,'#223a46','#0b1924'),'#4b6170',.8);
    polygon(ctx,[[84,423],[123,394],[442,394],[490,423],[455,442],[115,442]],gradient(ctx,393,442,'#344a54','#182b36'),'#63818a',.9);
    polygon(ctx,[[119,414],[147,401],[412,401],[444,414],[421,429],[138,429]],'#152731','#49616c',.7);
    line(ctx,[[109,448],[466,448]],color,1);
    [127,418].forEach(x=>{line(ctx,[[x,406],[x+16,414],[x,424]],C.copper,1.4);});
    [151,363].forEach(x=>{
      polygon(ctx,[[x,397],[x+7,348],[x+21,348],[x+29,397]],gradient(ctx,348,397,'#7b8e90','#243946'),'#839693',1);
      polygon(ctx,[[x+2,346],[x+26,346],[x+32,355],[x-4,355]],'#b5b6a7','#e0dfcb',.8);
      line(ctx,[[x+12,358],[x+12,389]],'#142b37',2);
    });
    ellipse(ctx,273,399,104,8,'rgba(9,19,27,.55)');
    // A quiet sample sweep, confined to the platform instead of a full-screen effect.
    const p=reduced?.45:(time%6000)/6000;
    ctx.save();ctx.globalAlpha*=.15;line(ctx,[[135+p*245,406],[160+p*245,424]],color,1);ctx.restore();
  }

  function target(ctx,color,aim,hit,reduced,time) {
    polygon(ctx,[[595,259],[619,259],[631,379],[582,379]],gradient(ctx,250,379,'#425762','#142735'),'#5b7280',.9);
    line(ctx,[[608,280],[608,365]],'#84919a',1);
    polygon(ctx,[[561,386],[579,373],[634,373],[651,386],[638,396],[574,396]],'#243b46','#68808a',.8);
    ellipse(ctx,608,396,65,8,'rgba(0,9,14,.3)');
    polygon(ctx,[[570,149],[594,125],[637,133],[656,158],[651,252],[626,274],[581,264],[564,239]],gradient(ctx,128,275,'#526975','#142733'),'#91a2a5',1);
    polygon(ctx,[[576,153],[597,137],[632,143],[643,163],[639,244],[621,260],[587,252],[577,234]],'#132933','#829693',.8);
    ellipse(ctx,610,200,29,49,'#0d202b','#567a85',1);
    ellipse(ctx,610,200,22,38,'#172f38','rgba(163,212,214,.52)',.75);
    ellipse(ctx,610,200,12,22,null,'#779296',.75);
    line(ctx,[[610,151],[610,171]],'#88a7aa',.8);line(ctx,[[610,229],[610,248]],'#88a7aa',.8);
    line(ctx,[[582,200],[596,200]],'#88a7aa',.8);line(ctx,[[624,200],[639,200]],'#88a7aa',.8);
    [[579,156],[636,160],[581,239],[634,247]].forEach(p=>bolt(ctx,p[0],p[1],1.6));
    ctx.font='8px ui-monospace, SFMono-Regular, monospace';ctx.textAlign='center';ctx.fillStyle='#95b0b8';ctx.fillText('TARGET ACTIVE',610,114);
    const blink=reduced?1:.86+.14*Math.sin(time*.002);
    ctx.save();ctx.globalAlpha*=blink;ellipse(ctx,644,139,1.7,1.7,color);ctx.restore();
    ctx.save();ctx.strokeStyle=hit?color:'#bbd6d3';ctx.lineWidth=1;
    const size=hit?12:9;
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>line(ctx,[[aim.x+a*(size+4),aim.y+b*size],[aim.x+a*size,aim.y+b*size],[aim.x+a*size,aim.y+b*(size+4)]],hit?color:'#bbd6d3',1));
    ellipse(ctx,aim.x,aim.y,1.4,1.4,hit?color:'#d2e6df');
    if(hit&&reduced){ellipse(ctx,aim.x,aim.y,17,24,null,color,1.5);line(ctx,[[aim.x-5,aim.y],[aim.x-1,aim.y+5],[aim.x+7,aim.y-6]],C.light,1.5);}
    ctx.restore();
  }

  function grip(ctx,points) {
    armor(ctx,points,false);
    for(let i=0;i<5;i++)line(ctx,[[points[0][0]+7+i*3,points[0][1]+15+i*10],[points[0][0]+24+i*3,points[0][1]+10+i*10]],'#738181',1.7);
  }
  function pulseWeapon(ctx,color,power,time,reduced) {
    armor(ctx,[[-73,-17],[-55,-41],[-4,-27],[13,-11],[4,8],[-64,6]],false);
    polygon(ctx,[[-59,-24],[-48,-30],[-18,-21],[-25,-9],[-58,-8]],'#090f16',C.copper,.8);
    line(ctx,[[-62,4],[-16,4]],C.copper,2);
    grip(ctx,[[37,22],[63,24],[85,88],[64,97],[48,80]]);
    armor(ctx,[[109,20],[143,20],[151,56],[130,67],[109,57]],false);
    armor(ctx,[[-4,-43],[53,-55],[130,-40],[158,-20],[141,18],[82,33],[14,25],[-8,4]]);
    armor(ctx,[[55,-48],[117,-35],[135,-17],[122,10],[65,22],[44,4]],false);
    armor(ctx,[[139,-38],[172,-59],[224,-54],[264,-37],[250,-24],[208,-34],[177,-34],[154,-16]]);
    armor(ctx,[[149,19],[174,40],[224,39],[264,18],[250,5],[208,17],[178,17],[159,-3]]);
    ellipse(ctx,207,-10,32,34,'#091c26',C.copper,4);
    ellipse(ctx,207,-10,24,26,'#1c3740','#9aada8',1.5);
    glow(ctx,207,-10,39,color,.11+power*.17);
    ellipse(ctx,207,-10,13,14,'#345d66',color,2);
    ellipse(ctx,207,-10,7,8,color,C.light,.8);
    for(let i=0;i<6;i++){
      const a=i*TAU/6+(reduced?0:time*.00012);
      line(ctx,[[207+Math.cos(a)*26,-10+Math.sin(a)*28],[207+Math.cos(a)*30,-10+Math.sin(a)*32]],C.light,1.3);
    }
    armor(ctx,[[246,-24],[279,-23],[293,-14],[293,4],[279,12],[246,9]],false);
    ellipse(ctx,284,-5,7,16,'#081d26',C.copper,2);
    ellipse(ctx,285,-5,3,10,color);
    litLine(ctx,[[95,-16],[126,-10],[153,-10]],color,1.8,.5+power*.4);
    line(ctx,[[17,-26],[34,-29],[41,-15],[26,-11]],'#748177',1);
    engraving(ctx,19,3,4,8);[[12,-33],[43,-39],[125,19],[176,-49],[174,30],[262,-18]].forEach(p=>bolt(ctx,...p));
    armor(ctx,[[67,-57],[75,-71],[104,-71],[114,-56]],false);line(ctx,[[79,-64],[100,-64]],color,1);
  }

  function anchorWeapon(ctx,color,power) {
    armor(ctx,[[-80,-29],[-62,-51],[-17,-42],[3,-27],[-3,13],[-67,18],[-80,7]],false);
    armor(ctx,[[-70,-35],[-37,-39],[-24,-18],[-64,-14]]);
    line(ctx,[[-74,11],[-22,11]],C.copper,3);
    grip(ctx,[[39,27],[70,26],[86,87],[61,95],[48,75]]);
    armor(ctx,[[91,25],[126,20],[145,76],[121,88],[100,75]],false);
    line(ctx,[[108,37],[126,74]],C.copper,3);
    armor(ctx,[[-5,-47],[33,-65],[143,-55],[171,-29],[159,22],[83,39],[16,31],[-9,13]]);
    armor(ctx,[[20,-31],[71,-44],[133,-36],[144,-10],[121,18],[35,20]],false);
    polygon(ctx,[[35,-25],[66,-34],[106,-28],[112,-14],[70,-8],[38,-12]],'#a58050','#e4c795',.8);
    for(let i=0;i<4;i++)line(ctx,[[51+i*14,-26],[47+i*14,-13]],'#263132',3);
    armor(ctx,[[156,-39],[252,-40],[291,-32],[302,-16],[280,-10],[156,-10]],false);
    armor(ctx,[[151,4],[275,4],[296,-6],[302,7],[281,23],[157,27]],false);
    line(ctx,[[166,-33],[271,-30],[290,-20]],C.copper,4);
    line(ctx,[[162,20],[275,18],[291,6]],C.copper,4);
    litLine(ctx,[[166,-17],[271,-15],[293,-10]],color,2.5,.3+power*.65);
    [184,215,246].forEach(x=>{polygon(ctx,[[x,-44],[x+8,-44],[x+8,-8],[x,-8]],'#bbc0ad','#ebdfc6',.7);bolt(ctx,x+4,-35,1.3);});
    armor(ctx,[[272,-23],[293,-23],[308,-13],[308,5],[293,14],[271,11]]);
    polygon(ctx,[[287,-13],[300,-10],[300,3],[287,5]],'#122029',color,1.4);
    ellipse(ctx,10,-7,12,18,'#172832',C.copper,2);ellipse(ctx,10,-7,6,10,'#5c6664','#c4b795',1);
    armor(ctx,[[82,-65],[88,-76],[121,-76],[133,-62]],false);line(ctx,[[92,-69],[117,-69]],C.copper,1.5);
    [[-57,-25],[29,-48],[146,-43],[145,24],[277,-34],[283,18]].forEach(p=>bolt(ctx,...p));
    engraving(ctx,23,5,4,8);
  }

  function latticeWeapon(ctx,color,power) {
    armor(ctx,[[-78,-5],[-50,-47],[-4,-33],[17,-8],[5,15],[-66,20]],false);
    polygon(ctx,[[-57,-3],[-42,-31],[-15,-22],[-8,-6],[-18,5]],'#07111a','#78968e',1);
    line(ctx,[[-68,15],[-28,11]],C.copper,2);
    grip(ctx,[[40,18],[67,19],[76,86],[53,94],[42,68]]);
    armor(ctx,[[-5,-39],[61,-59],[137,-32],[157,-8],[127,24],[57,33],[6,20],[-10,0]]);
    armor(ctx,[[42,-39],[63,-47],[127,-28],[139,-8],[118,13],[60,22],[40,7]],false);
    polygon(ctx,[[59,-28],[78,-32],[117,-20],[117,-9],[78,1],[60,-4]],'#193f40',C.copper,1);
    litLine(ctx,[[63,-17],[80,-25],[92,-7],[106,-18],[118,-14]],color,2,.35+power*.6);
    armor(ctx,[[142,-39],[166,-54],[190,-45],[199,-20],[222,-39],[254,-30],[283,-20],[276,-5],[252,-11],[226,-20],[202,1],[181,-17],[163,-28],[146,-13]],false);
    armor(ctx,[[137,11],[158,32],[194,38],[220,18],[254,27],[280,14],[274,1],[252,11],[218,4],[188,23],[166,18],[149,2]]);
    litLine(ctx,[[154,-13],[174,-23],[194,-7],[216,-26],[238,-12],[262,-13],[289,-7]],color,1.5,.35+power*.6);
    armor(ctx,[[268,-20],[286,-24],[298,-13],[298,6],[285,18],[267,12]]);
    polygon(ctx,[[277,-9],[288,-14],[294,-7],[288,6],[278,6]],'#173b3c',color,1.5);
    [[167,-41],[220,-28],[250,-21]].forEach(([x,y])=>{polygon(ctx,[[x-4,y],[x,y-6],[x+4,y],[x,y+6]],color,C.light,.6);});
    armor(ctx,[[85,-49],[88,-69],[102,-72],[119,-48]],false);polygon(ctx,[[94,-64],[98,-67],[105,-63],[108,-54],[95,-55]],color);
    [[18,-35],[33,22],[123,19],[182,29],[276,-15],[-51,-20]].forEach(p=>bolt(ctx,...p));
    engraving(ctx,5,-12,4,6);line(ctx,[[107,28],[115,59],[132,54],[134,28]],C.copper,2);
  }

  function shieldWeapon(ctx,color,power,time,reduced) {
    // The guard sits behind the blade; the cut edge remains a single readable silhouette.
    ellipse(ctx,72,0,51,64,'#132b35',C.copper,3,.12);
    ellipse(ctx,74,-2,42,54,gradient(ctx,-56,54,'#425b64','#112631'),'#809a9c',1,.12);
    for(let i=0;i<6;i++){
      const a=i*TAU/6;
      line(ctx,[[74+Math.cos(a)*24,-2+Math.sin(a)*29],[74+Math.cos(a)*39,-2+Math.sin(a)*49]],C.copper,1.5);
    }
    glow(ctx,75,-2,50,color,.08+power*.12);
    ellipse(ctx,75,-2,22,29,'#203940',color,1.5);
    ellipse(ctx,76,-3,10,14,'#8c794f',C.light,.8);
    armor(ctx,[[-53,15],[-47,-3],[42,-16],[63,1],[45,20],[-47,31]],false);
    for(let i=0;i<7;i++)line(ctx,[[-38+i*10,5-i*1.3],[-32+i*10,22-i*1.3]],C.copper,2.2);
    armor(ctx,[[-66,6],[-49,-2],[-41,26],[-60,37],[-69,26]]);
    armor(ctx,[[50,-39],[66,-48],[98,24],[92,43],[78,39],[64,8]]);
    armor(ctx,[[105,-30],[134,-43],[199,-44],[290,-77],[313,-71],[285,-43],[213,-19],[158,17],[120,14]],false);
    armor(ctx,[[120,-30],[158,-35],[199,-33],[287,-65],[297,-64],[276,-46],[206,-21],[159,8],[127,7]]);
    polygon(ctx,[[155,-30],[197,-28],[265,-50],[208,-13],[164,4],[147,-8]],'#b7b8a5','#f6f0dc',.8);
    litLine(ctx,[[131,-3],[165,-5],[210,-24],[282,-50],[305,-67]],color,1.6,.45+power*.45);
    line(ctx,[[164,-18],[196,-19],[223,-29]],'#877350',.8);
    [[127,-23],[144,1],[201,-31],[283,-60],[46,-4]].forEach(p=>bolt(ctx,...p,1.6));
    ellipse(ctx,78,-3,28,37,null,'rgba(234,219,175,.45)',.8);
    if(!reduced){
      const a=time*.00025;ctx.save();ctx.translate(78,-3);ctx.scale(.8,1);
      ctx.beginPath();ctx.arc(0,0,34,a,a+.85);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
    }
  }

  const weapons=[pulseWeapon,anchorWeapon,latticeWeapon,shieldWeapon];
  function muzzlePoint(operator,recoil) {
    const p=operator===3?[306,-66]:operator===1?[307,-7]:operator===0?[291,-5]:[297,-7];
    const a=-.09;return {x:148-recoil+p[0]*Math.cos(a)-p[1]*Math.sin(a),y:288+recoil*.12+p[0]*Math.sin(a)+p[1]*Math.cos(a)};
  }

  function chargeEffect(ctx,operator,color,muzzle,charge,age) {
    const core=operator===3?{x:221,y:278}:{x:352,y:248};
    glow(ctx,core.x,core.y,48+charge*20,color,.12+charge*.1);
    ellipse(ctx,core.x,core.y,12+charge*21,18+charge*23,null,color,.6+charge);
    for(let i=0;i<7;i++){
      const p=((age/1000)+seed(i+operator*10))%1;
      const a=seed(i+41+operator)*TAU;
      const r=(1-p)*(42+seed(i+24)*27)+9;
      ctx.save();ctx.globalAlpha*=Math.sin(p*Math.PI)*.65;
      ellipse(ctx,core.x+Math.cos(a)*r,core.y+Math.sin(a)*r*.8,1.1,1.1,color);ctx.restore();
    }
    const length=27+charge*42;
    line(ctx,[[muzzle.x-length,muzzle.y+11],[muzzle.x,muzzle.y+11]],'rgba(151,187,188,.28)',2);
    line(ctx,[[muzzle.x-length,muzzle.y+11],[muzzle.x-length+length*charge,muzzle.y+11]],color,2);
    ctx.font='7px ui-monospace, SFMono-Regular, monospace';ctx.textAlign='right';ctx.fillStyle=color;ctx.fillText('CHARGE',muzzle.x,muzzle.y+26);
  }

  function projectile(ctx,operator,color,muzzle,aim,age,charged) {
    if(age<0)return;
    const dx=aim.x-muzzle.x,dy=aim.y-muzzle.y,angle=Math.atan2(dy,dx),strength=charged?1.35:1;
    const along=(p,offset=0)=>[muzzle.x+dx*p-Math.sin(angle)*offset,muzzle.y+dy*p+Math.cos(angle)*offset];
    const flash=clamp(1-age/110);
    if(flash>0){
      glow(ctx,muzzle.x,muzzle.y,30*strength,color,flash*.24);
      ctx.save();ctx.globalAlpha*=flash;
      ellipse(ctx,muzzle.x,muzzle.y,7*strength,14*strength,null,color,2,angle);ctx.restore();
    }
    if(operator===0){
      for(let i=0;i<(charged?3:2);i++){
        const a=age-i*66,p=a/150;if(p<0||p>1.08)continue;
        const xy=along(clamp(p));ctx.save();ctx.globalAlpha*=clamp((1.15-p)*1.5);
        glow(ctx,xy[0],xy[1],21,color,.21);
        ellipse(ctx,xy[0],xy[1],5*strength,14*strength,null,color,2,angle);
        ellipse(ctx,xy[0],xy[1],2,8,color,C.light,.6,angle);
        litLine(ctx,[along(clamp(p-.2)),xy],color,.9,.35);ctx.restore();
      }
    }else if(operator===1){
      const p=clamp(age/90),fade=clamp(1-(age-90)/170);
      if(fade>0){
        const end=along(p);litLine(ctx,[along(Math.max(0,p-.62)),end],color,2.4*strength,fade);
        litLine(ctx,[along(Math.max(0,p-.72),3),along(p,3)],color,.8,fade*.55);
        ctx.save();ctx.globalAlpha*=fade;ctx.translate(end[0],end[1]);ctx.rotate(angle);
        polygon(ctx,[[-12,-3],[-6,-7],[8,0],[-6,7],[-12,3]],C.light,color,1);ctx.restore();
      }
      if(age>=90&&age<530){
        const fade=clamp(1-(age-90)/440);ctx.save();ctx.globalAlpha*=fade;
        ellipse(ctx,aim.x,aim.y,6,9,'#261f1b',color,1.4);
        for(let i=0;i<4;i++){const a=i*TAU/4+.4;line(ctx,[[aim.x+Math.cos(a)*5,aim.y+Math.sin(a)*5],[aim.x+Math.cos(a)*11,aim.y+Math.sin(a)*11]],color,1.4);}
        ctx.restore();
      }
    }else if(operator===2){
      if(age<340){
        const p=clamp(age/110),fade=clamp(1-(age-110)/230),points=[];
        for(let i=0;i<=8;i++){
          const q=i/8*p,offset=i===0||i===8?0:(seed(i+17)*2-1)*14*strength;
          points.push(along(q,offset));
        }
        litLine(ctx,points,color,2*strength,fade);
        for(let i=2;i<=6;i+=2){
          const start=points[i];litLine(ctx,[start,[start[0]+8,start[1]-12],[start[0]+20,start[1]-8]],color,.8,fade*.45);
        }
      }
    }else{
      const p=age/220;if(p>=0&&p<=1.55){
        const center=along(clamp(p)),fade=clamp(1-(p-1)*2);
        ctx.save();ctx.globalAlpha*=fade;ctx.translate(center[0],center[1]);ctx.rotate(angle);
        ctx.shadowColor=color;ctx.shadowBlur=10;
        ctx.beginPath();ctx.moveTo(-14,-34*strength);ctx.quadraticCurveTo(26,0,-14,34*strength);ctx.quadraticCurveTo(11,0,-14,-34*strength);
        ctx.fillStyle=color;ctx.fill();ctx.shadowBlur=0;
        line(ctx,[[-12,-27*strength],[4,0],[-12,27*strength]],C.light,1.2);
        ctx.restore();litLine(ctx,[along(Math.max(0,p-.27)),along(clamp(p))],color,1,fade*.35);
      }
      if(age<390){
        const fade=clamp(1-age/390);ctx.save();ctx.globalAlpha*=fade*.65;
        ctx.beginPath();ctx.ellipse(226,277,55+age*.03,73+age*.02,-.08,-1.15,1.15);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
      }
    }
  }

  function impact(ctx,operator,color,aim,age,charged) {
    const delays=[150,90,110,220],elapsed=age-delays[operator];
    if(elapsed<0||elapsed>760)return;
    const fade=clamp(1-elapsed/760),p=clamp(elapsed/420),size=charged?1.25:1;
    glow(ctx,aim.x,aim.y,42*size,color,fade*.16);
    ctx.save();ctx.globalAlpha*=fade;
    if(operator===0){
      ellipse(ctx,aim.x,aim.y,(8+p*24)*size,(12+p*35)*size,null,color,1.6);
      ellipse(ctx,aim.x,aim.y,(5+p*14)*size,(8+p*21)*size,null,C.light,.7);
    }else if(operator===1){
      const r=(7+p*19)*size;
      for(let i=0;i<4;i++){
        const a=i*TAU/4+.4;line(ctx,[[aim.x+Math.cos(a)*(r-4),aim.y+Math.sin(a)*(r-4)],[aim.x+Math.cos(a)*r,aim.y+Math.sin(a)*r]],color,2);
      }
      ellipse(ctx,aim.x,aim.y,5,8,color,C.light,.8);
    }else if(operator===2){
      for(let ring=0;ring<2;ring++){
        const r=(9+p*22-ring*5)*size,pts=[];
        for(let i=0;i<6;i++){const a=i*TAU/6+.3;pts.push([aim.x+Math.cos(a)*r*.8,aim.y+Math.sin(a)*r]);}
        polygon(ctx,pts,null,ring?C.light:color,ring?.6:1.5);
      }
    }else{
      const r=(9+p*28)*size;
      polygon(ctx,[[aim.x,aim.y-r],[aim.x+r*.7,aim.y],[aim.x,aim.y+r],[aim.x-r*.7,aim.y]],null,color,1.3);
      litLine(ctx,[[aim.x-11,aim.y+22],[aim.x+12,aim.y-22]],color,2.1,fade);
    }
    const count=charged?12:8;
    for(let i=0;i<count;i++){
      const a=seed(i+operator*53)*TAU;
      const travel=(14+seed(i+92)*34)*p*size;
      const sx=aim.x+Math.cos(a)*travel,sy=aim.y+Math.sin(a)*travel+14*p*p;
      const tail=2+seed(i+12)*3;
      ctx.save();ctx.globalAlpha*=clamp(1-p)*.9;
      line(ctx,[[sx,sy],[sx-Math.cos(a)*tail,sy-Math.sin(a)*tail]],i%3===0?C.light:color,i%3===0?1.2:.8);ctx.restore();
    }
    ctx.restore();
  }

  function draw(ctx,options={}) {
    if(!ctx)return;
    const {x=0,y=0,w=720,h=530}=options;
    if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)return;
    const operator=clamp(Math.trunc(finite(options.operator,0)),0,3);
    const time=finite(options.time,0),shotAt=finite(options.shotAt,0),charged=!!options.charged,reduced=!!options.reduced;
    const age=time-shotAt,active=shotAt>0&&(reduced||(age>=0&&age<1800));
    const chargeDuration=charged?1000:0,releaseAge=active?age-chargeDuration:-1;
    const charging=active&&releaseAge<0,charge=charging?clamp(age/1000):0;
    const released=active&&releaseAge>=0;
    const recoil=(!reduced&&released)?(operator===1?21:operator===3?10:13)*(charged?1.3:1)*Math.exp(-releaseAge/160)*(1-Math.exp(-releaseAge/18)):0;
    const color=ENERGY[operator];
    // Aim coordinates are local. The reticle stays on the actual training plate.
    const aim={x:clamp(finite(options.aimX,610),590,632),y:clamp(finite(options.aimY,200),173,231)};
    const hit=active&&(reduced||releaseAge>=[150,90,110,220][operator]);
    const power=reduced?.3:charging?charge:released?.3+clamp(1-releaseAge/280)*.7:.3;
    ctx.save();
    try {
      ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.translate(x,y);ctx.scale(w/720,h/530);
      ctx.globalCompositeOperation='source-over';ctx.shadowBlur=0;ctx.lineCap='round';ctx.lineJoin='round';
      stage(ctx,color,time,reduced);target(ctx,color,aim,hit,reduced,time);
      ellipse(ctx,259,337,182,20,'rgba(1,11,18,.33)',null,1,-.07);
      ctx.save();ctx.translate(148-recoil,288+recoil*.12);ctx.rotate(-.09);
      weapons[operator](ctx,color,power,time,reduced);ctx.restore();
      const muzzle=muzzlePoint(operator,recoil);
      if(charging&&!reduced)chargeEffect(ctx,operator,color,muzzle,charge,age);
      if(released&&!reduced){projectile(ctx,operator,color,muzzle,aim,releaseAge,charged);impact(ctx,operator,color,aim,releaseAge,charged);}
      // Reduced motion gives the result immediately, with no recoil, flash or moving particles.
      if(hit&&!reduced&&releaseAge>800){
        ctx.save();ctx.globalAlpha*=clamp((1800-age)/260)*.6;
        line(ctx,[[aim.x-4,aim.y],[aim.x,aim.y+4],[aim.x+7,aim.y-6]],color,1.2);ctx.restore();
      }
    } finally { ctx.restore(); }
  }
  window.RelicWeapons={draw};
})();
