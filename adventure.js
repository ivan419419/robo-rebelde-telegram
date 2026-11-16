const scenery=[
 ['🌳 Bosque das Raízes','forest','🍃'],['🍄 Vilarejo dos Cogumelos','village','🍄'],['💎 Caverna dos Cristais','cave','💎'],['🌵 Deserto Dourado','desert','🌵'],['🪷 Pântano das Lanternas','swamp','🪷'],['❄️ Montanhas Nevadas','snow','❄️'],['🗿 Ruínas do Templo','temple','🗿'],['✨ Floresta Noturna','night','✨'],['🌋 Vulcão Adormecido','volcano','🔥'],['🐚 Praia dos Naufrágios','beach','🐚'],['☁️ Ilhas das Nuvens','cloud','☁️'],['🏚️ Cidade Abandonada','city','🏚️'],['🌻 Jardim Gigante','garden','🌻'],['⛏️ Mina dos Anões','mine','⛏️'],['🌈 Vale Arco-íris','rainbow','🌈']
];
const portalPairs=[
 {a:2,pa:{x:13,y:1},b:6,pb:{x:2,y:8}},
 {a:4,pa:{x:14,y:1},b:9,pb:{x:1,y:8}},
 {a:11,pa:{x:14,y:1},b:14,pb:{x:1,y:8}}
];
const MOD=2147483647;
function randFactory(seed){let n=seed+1;return()=>{n=n*48271%MOD;return n/MOD;};}
function buildLevel(index){
 const [name,theme,prop]=scenery[index],seed=index+1,rand=randFactory(seed),W=16,H=10;
 const cells=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>(x===0||x===W-1||y===0||y===H-1)?'#':'.'));
 // Reinforced-looking cross walls split the scenery into chambers, with alternating open passages.
 for(const y of [3,6]){const gapA=2+((seed*3+y)%5),gapB=9+((seed*7+y)%5);for(let x=2;x<=13;x++)if(x!==gapA&&x!==gapB)cells[y][x]='#';}
 // Earth barriers form little optional obstacles, but the whole floor remains explorable.
 for(let i=0;i<14;i++){const x=2+Math.floor(rand()*12),y=1+Math.floor(rand()*8);if(cells[y][x]==='.')cells[y][x]='D';}
 const portals=[];
 for(const pair of portalPairs){if(index===pair.a){cells[pair.pa.y][pair.pa.x]='O';portals.push({x:pair.pa.x,y:pair.pa.y,to:{stage:pair.b,x:pair.pb.x,y:pair.pb.y}});}if(index===pair.b){cells[pair.pb.y][pair.pb.x]='O';portals.push({x:pair.pb.x,y:pair.pb.y,to:{stage:pair.a,x:pair.pa.x,y:pair.pa.y}});}}
 const start={x:1,y:1},exit={x:14,y:8};
 // Guaranteed winding corridors connect all chambers and objectives before collectibles spawn.
 for(let x=1;x<=14;x++)cells[1][x]='.';
 for(let y=1;y<=8;y++)cells[y][14]='.';
 for(let x=2;x<=14;x++)cells[8][x]='.';
 cells[start.y][start.x]='S';cells[exit.y][exit.x]='E';
 const reserved=new Set([`${start.x},${start.y}`,`${exit.x},${exit.y}`,...portals.map(p=>`${p.x},${p.y}`)]);
 const available=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(cells[y][x]==='.'||cells[y][x]==='D')available.push({x,y});
 const pick=(fraction)=>{let target=Math.floor(available.length*fraction);for(let offset=0;offset<available.length;offset++){const p=available[(target+offset)%available.length],key=`${p.x},${p.y}`;if(!reserved.has(key)){reserved.add(key);return p;}}throw Error('Mapa sem espaço para os objetivos');};
 const bones=[pick(.12),pick(.48),pick(.82)];const predatorCount=2+(index%2);const predators=[];
 for(let i=0;i<predatorCount;i++){const p=pick((.26+i*.22)%1);cells[p.y][p.x]='.';predators.push({x:p.x,y:p.y,wait:rand()*.4,kind:['🐺','🐍','🦊','🐊','🦇','🦂'][index%6]});}
 for(const p of bones)cells[p.y][p.x]='.';for(const p of portals)cells[p.y][p.x]='.';cells[start.y][start.x]='.';cells[exit.y][exit.x]='.';
 return{name,theme,prop,layout:cells.map(r=>r.join('')),start,exit,bones,predators,portals};
}
export const levels=Array.from({length:15},(_,i)=>buildLevel(i));
export function makeWorld(level){return{cells:level.layout.map(r=>r.split('')),bones:level.bones.map(p=>({...p})),predators:level.predators.map(p=>({...p})),start:{...level.start},exit:{...level.exit},portals:level.portals.map(p=>({...p,to:{...p.to}})),prop:level.prop,theme:level.theme,name:level.name,stones:[]};}
export function shortestPath(cells,start,goal){const q=[start],key=p=>`${p.x},${p.y}`,seen=new Map([[key(start),null]]);for(let i=0;i<q.length;i++){const p=q[i];if(p.x===goal.x&&p.y===goal.y)break;for(const [dx,dy] of [[0,1],[1,0],[0,-1],[-1,0]]){const n={x:p.x+dx,y:p.y+dy};if(cells[n.y]?.[n.x]!=='.'||seen.has(key(n)))continue;seen.set(key(n),p);q.push(n);}}if(!seen.has(key(goal)))return[];let p=goal,out=[];while(p){out.push(p);p=seen.get(key(p));}return out.reverse();}
export function dig(world,player,dir){const x=player.x+dir.x,y=player.y+dir.y;if(world.cells[y]?.[x]!=='D')return false;world.cells[y][x]='.';return true;}
export function advance(world,player,dir){const x=player.x+dir.x,y=player.y+dir.y;if(world.cells[y]?.[x]!=='.')return false;player.x=x;player.y=y;return true;}
export function collect(world,player){const i=world.bones.findIndex(b=>b.x===player.x&&b.y===player.y);if(i<0)return false;world.bones.splice(i,1);return true;}
export function completed(world,player){return world.bones.length===0&&player.x===world.exit.x&&player.y===world.exit.y;}
export function dogScale(score){return Math.min(1.75,1+Math.floor(Math.max(0,score)/100)*.12);}
export function fireStone(world,player,dir){world.stones??=[];const s={x:player.x,y:player.y,dx:dir.x,dy:dir.y,clock:0};world.stones.push(s);return s;}
export function advanceStone(world,stone){const x=stone.x+stone.dx,y=stone.y+stone.dy;if(!world.cells[y]||x<=0||x>=world.cells[y].length-1||y<=0||y>=world.cells.length-1)return'edge';if(world.cells[y][x]==='#'||world.cells[y][x]==='D'){world.cells[y][x]='.';return'wall';}const enemy=world.predators.findIndex(p=>p.x===x&&p.y===y);if(enemy>=0){world.predators.splice(enemy,1);return'enemy';}if(world.cells[y][x]!=='.')return'blocked';stone.x=x;stone.y=y;return'move';}
export function teleport(levelList,stage,player){const w=makeWorld(levelList[stage]),p=w.portals.find(q=>q.x===player.x&&q.y===player.y);return p?{stage:p.to.stage,player:{x:p.to.x,y:p.to.y},world:makeWorld(levelList[p.to.stage])}:null;}
if(typeof document!=='undefined'){
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),size=48;
const ui=Object.fromEntries(['scene','bones','hearts','score','size','mission','overlay','title','description','start','dig'].map(id=>[id,document.getElementById(id)]));
const sprite=new Image();sprite.src='assets/dog-run-sheet.png';let world,player,stage=0,lives=3,state='title',direction={x:1,y:0},held=null,last=0,moveTimer=0,invulnerable=0,t=0,collected=0,score=0,shotAnim=0,portalCooldown=0,worlds=[],finishedStages=new Set(),nextStage=0;
const growScale=()=>dogScale(score);const dirs={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};let noticeUntil=0;
function showNotice(text){noticeUntil=t+2;ui.mission.textContent=text;}
function loadStage(n,entry=null){stage=n;world=worlds[n]??(worlds[n]=makeWorld(levels[n]));world.stones=[];player=entry?{...entry}:{...world.start};direction=dirs.right;collected=3-world.bones.length;invulnerable=1.5;portalCooldown=.8;updateHud();showNotice(`Fase ${stage+1}/15 — encontre os ossos!`);}
function updateHud(){ui.scene.textContent=`${levels[stage].name} · ${stage+1}/15`;ui.bones.textContent=`🦴 ${collected}/3`;ui.hearts.textContent='❤️'.repeat(Math.max(0,lives))||'—';ui.score.textContent=`⭐ ${score}`;ui.size.textContent=`🐕 ${Math.round(growScale()*100)}%`;}
function overlay(title,description,button){ui.title.textContent=title;ui.description.textContent=description;ui.start.textContent=button;ui.overlay.hidden=false;held=null;}
function start(){if(state==='title'||state==='gameover'||state==='won'){lives=3;score=0;worlds=[];finishedStages=new Set();loadStage(0);}else if(state==='next'){loadStage(nextStage);}state='playing';last=0;portalCooldown=.8;ui.overlay.hidden=true;}
ui.start.addEventListener('click',start);
function step(){if(state!=='playing'||!held)return;direction=held;fireStone(world,player,direction);shotAnim=.28;if(!advance(world,player,direction)){if(world.cells[player.y+direction.y]?.[player.x+direction.x]==='D')showNotice('Terra à frente! Toque em CAVAR.');return;}if(collect(world,player)){collected++;updateHud();showNotice(world.bones.length?'Osso encontrado! Continue farejando.':'Todos os ossos! Vá até a saída dourada.');}checkDanger();if(state!=='playing')return;
 if(portalCooldown<=0){const trip=teleport(levels,stage,player);if(trip){loadStage(trip.stage,trip.player);portalCooldown=1.1;showNotice(`🌀 A espiral lançou você para ${levels[stage].name}!`);return;}}
 if(completed(world,player)){finishedStages.add(stage);if(finishedStages.size===levels.length){state='won';overlay('Aventura concluída!','Você completou todos os 15 cenários e encontrou os ossos!','JOGAR NOVAMENTE');}else{nextStage=Array.from({length:levels.length},(_,i)=>(stage+1+i)%levels.length).find(i=>!finishedStages.has(i));state='next';overlay('Cenário concluído!',`Fases concluídas: ${finishedStages.size}/15. Continue na fase ${nextStage+1}!`,'PRÓXIMA FASE');}}}
function doDig(){if(state==='playing'){if(dig(world,player,direction))showNotice('Túnel aberto! Continue explorando.');else showNotice('Vire para um bloco de terra marrom para cavar.');}}
ui.dig.addEventListener('click',doDig);
for(const button of document.querySelectorAll('[data-dir]')){button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);held=dirs[button.dataset.dir];direction=held;moveTimer=0;step();});for(const ev of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(ev,()=>{held=null;});}
const keys={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};window.addEventListener('keydown',e=>{if(keys[e.key]){e.preventDefault();if(!e.repeat){held=dirs[keys[e.key]];direction=held;moveTimer=0;step();}}else if((e.key===' '||e.key.toLowerCase()==='e')&&!e.repeat){e.preventDefault();doDig();}});window.addEventListener('keyup',e=>{if(keys[e.key])held=null;});window.addEventListener('blur',()=>{held=null;});document.addEventListener('visibilitychange',()=>{held=null;if(document.hidden&&state==='playing'){state='paused';overlay('Pausa automática','Toque em continuar quando voltar ao jogo.','CONTINUAR');}});
function checkDanger(){if(invulnerable>0||state!=='playing')return;if(world.predators.some(p=>p.x===player.x&&p.y===player.y)){lives--;updateHud();if(!lives){state='gameover';overlay('O cachorro se cansou','Os predadores pegaram você. Tente outra vez!','JOGAR NOVAMENTE');}else{player={...world.start};invulnerable=2;showNotice('Cuidado! Você perdeu um coração.');}}}
function tick(dt){t+=dt;invulnerable=Math.max(0,invulnerable-dt);portalCooldown=Math.max(0,portalCooldown-dt);shotAnim=Math.max(0,shotAnim-dt);if(held){moveTimer+=dt;if(moveTimer>=.16){moveTimer=0;step();}}if(state!=='playing')return;
 for(const stone of world.stones){stone.clock+=dt;if(stone.clock>=.075){stone.clock=0;const result=advanceStone(world,stone);if(result==='wall'){stone.dead=true;showNotice('PAREDE QUEBRADA! Caminho aberto.');}else if(result==='enemy'){stone.dead=true;score+=100;updateHud();showNotice('ACERTOU O PREDADOR! +100 • CACHORRO MAIOR!');}else if(result!=='move')stone.dead=true;}}
 world.stones=world.stones.filter(s=>!s.dead);for(const p of world.predators){p.wait-=dt;if(p.wait>0)continue;p.wait=.72;const path=shortestPath(world.cells,p,player);if(path.length>1){p.x=path[1].x;p.y=path[1].y;}checkDanger();if(state!=='playing')break;}if(t>noticeUntil)ui.mission.textContent=world.bones.length?`Fase ${stage+1}/15 • encontre ${world.bones.length} osso(s), quebre paredes e fuja dos predadores.`:'Saída aberta! Vá até a bandeira dourada.';}
function draw(){const theme=levels[stage].theme,colors={forest:['#a2ce78','#43814a','#956844','#a2ce78'],village:['#d8c998','#6d8854','#a8734b','#d7d39a'],cave:['#73819b','#384459','#8a6147','#8292ab'],desert:['#e8c67c','#aa7947','#bc7540','#e1bd73'],swamp:['#93ae83','#526b48','#76563e','#98b07f'],snow:['#d7edf0','#829ea6','#9caec0','#e0f2ef'],temple:['#cfba88','#807045','#9c7151','#cfba88'],night:['#70856e','#315440','#826447','#6f826b'],volcano:['#c68761','#65433e','#a45736','#bd7755'],beach:['#efcf91','#8b8062','#9c704d','#e7d09f'],cloud:['#bcd5dc','#718ba0','#947a6a','#b9d5e5'],city:['#a7aa91','#575e55','#76634c','#a2a996'],garden:['#c3d784','#63834b','#967347','#b6d477'],mine:['#96948e','#5b5853','#936d4c','#9c9a93'],rainbow:['#afd08e','#5b8d63','#976749','#a9c987']}[theme];
 ctx.fillStyle=colors[0];ctx.fillRect(0,0,canvas.width,canvas.height);for(let y=0;y<10;y++)for(let x=0;x<16;x++){const c=world.cells[y][x],px=x*size,py=y*size;ctx.fillStyle=(x+y)%2?'#ffffff08':'#00000008';ctx.fillRect(px,py,size,size);if(c==='#'){ctx.fillStyle=colors[1];ctx.fillRect(px+1,py+1,size-2,size-2);ctx.fillStyle='#ffffff18';ctx.fillRect(px+4,py+6,size-8,3);ctx.fillStyle='#00000012';ctx.fillRect(px+4,py+size-8,size-8,3);}else if(c==='D'){ctx.fillStyle=colors[2];ctx.fillRect(px+2,py+2,size-4,size-4);ctx.fillStyle='#f7dfad';ctx.font='21px sans-serif';ctx.textAlign='center';ctx.fillText('⋯',px+24,py+30);}}
 ctx.textAlign='center';ctx.textBaseline='middle';for(let y=1;y<9;y++)for(let x=1;x<15;x++)if((x*7+y*11+stage)%23===0&&world.cells[y][x]==='.'&&!(player.x===x&&player.y===y)&&!world.bones.some(b=>b.x===x&&b.y===y)) {ctx.globalAlpha=.24;ctx.font='18px sans-serif';ctx.fillText(world.prop,x*size+24,y*size+24);}ctx.globalAlpha=1;
 ctx.font='29px sans-serif';ctx.fillStyle='#fff3d1';for(const b of world.bones)ctx.fillText('🦴',b.x*size+24,b.y*size+24);ctx.fillText(world.bones.length?'🔒':'🚩',world.exit.x*size+24,world.exit.y*size+24);for(const p of world.portals){ctx.fillText('🌀',p.x*size+24,p.y*size+24);ctx.strokeStyle='#ffe98a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x*size+24,p.y*size+24,17+Math.sin(t*5)*2,0,Math.PI*2);ctx.stroke();}for(const p of world.predators)ctx.fillText(p.kind,p.x*size+24,p.y*size+24);ctx.font='22px sans-serif';for(const s of world.stones)ctx.fillText('🪨',s.x*size+24,s.y*size+24);
 if(!(invulnerable>0&&Math.floor(t*8)%2===0)){const x=player.x*size,y=player.y*size;if(sprite.complete&&sprite.naturalWidth){const cw=sprite.naturalWidth/2,ch=sprite.naturalHeight/2,frame=held?Math.floor(t*8)%4:0,frames=[[0,0],[1,0],[1,1],[0,1]],f=frames[frame],scale=growScale(),dw=46*scale,dh=40*scale;ctx.save();if(direction.x<0){ctx.translate(x+size,y);ctx.scale(-1,1);ctx.drawImage(sprite,f[0]*cw,f[1]*ch,cw,ch,(48-dw)/2,44-dh,dw,dh);}else ctx.drawImage(sprite,f[0]*cw,f[1]*ch,cw,ch,x+(48-dw)/2,y+44-dh,dw,dh);ctx.restore();}else {ctx.font=`${Math.round(30*growScale())}px sans-serif`;ctx.fillText('🐕',x+24,y+24);}}
 if(shotAnim>0){ctx.font='20px sans-serif';ctx.fillText('💨',player.x*size+24+direction.x*23,player.y*size+24+direction.y*23);}ctx.textBaseline='alphabetic';ctx.textAlign='left';}
function loop(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(state==='playing')tick(dt);draw();requestAnimationFrame(loop);}loadStage(0);const tg=window.Telegram?.WebApp;if(tg){try{tg.ready();tg.expand();}catch{}}requestAnimationFrame(loop);
}
