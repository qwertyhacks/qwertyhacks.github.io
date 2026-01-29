const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles=[];
function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight}
addEventListener('resize',resize);resize();
function spawn(){particles.push({x:Math.random()*W,y:H+10,r:Math.random()*2+0.8,vy:-(0.2+Math.random()*0.9),alpha:0.2+Math.random()*0.8})}
for(let i=0;i<120;i++)spawn();
function frame(){ctx.clearRect(0,0,W,H);for(let p of particles){p.y+=p.vy;p.alpha-=0.001;if(p.y<-20||p.alpha<=0){p.x=Math.random()*W;p.y=H+10;p.r=Math.random()*2+0.8;p.vy=-(0.2+Math.random()*0.9);p.alpha=0.2+Math.random()*0.8}ctx.globalAlpha=p.alpha;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;requestAnimationFrame(frame)}
requestAnimationFrame(frame);

async function loadGames(){
  try{const res=await fetch('games.json');const games=await res.json();renderGames(games)}catch(e){console.error('Failed loading games.json',e)}
}

function renderGames(games){const grid=document.getElementById('grid');grid.innerHTML='';for(const g of games){const card=document.createElement('div');card.className='card';
  const pfp=document.createElement('div');pfp.className='pfp';
  const img=document.createElement('img');img.src=g.pfp;img.alt='pfp';img.style.width='100%';img.style.height='100%';img.style.objectFit='cover';pfp.appendChild(img);
  const meta=document.createElement('div');meta.className='meta';
  const title=document.createElement('div');title.className='title';title.textContent=g.title;
  const btn=document.createElement('button');btn.className='btn';btn.textContent=g.buttonLabel||'Play';btn.onclick=()=>window.open(g.path,'_blank');
  meta.appendChild(title);meta.appendChild(btn);
  card.appendChild(pfp);card.appendChild(meta);grid.appendChild(card);
}
}

document.getElementById('search').addEventListener('input',e=>{
  const q=e.target.value.toLowerCase();const cards=document.querySelectorAll('.card');cards.forEach(c=>{const t=c.querySelector('.title').textContent.toLowerCase();c.style.display=t.includes(q)?'flex':'none'})
});

loadGames();
