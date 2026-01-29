(() => {
  const SELECTORS = {
    grid: 'grid', balance: 'balance', bet: 'bet', potential: 'potential',
    startBtn: 'startBtn', cashoutBtn: 'cashoutBtn', shopBtn: 'shopBtn',
    scanBtn: 'scanBtn', scryBtn: 'scryBtn', defuseBtn: 'defuseBtn', shopModal: 'shopModal', closeShop: 'closeShop'
  };

  const LS_KEYS = {BAL:'ml_balance', UPGR:'ml_upgrades'};

  // defaults
  let state = {
    rows: 7, cols: 7, bombs: 8, running: false, revealed: 0, clicked: new Set(),
    defuseCharges: 0, scanPower: 1, multiBoost: 0
  };

  const el = id => document.getElementById(id);

  function loadUpgrades(){
    const raw = localStorage.getItem(LS_KEYS.UPGR);
    if(raw) Object.assign(state, JSON.parse(raw));
  }
  function saveUpgrades(){
    localStorage.setItem(LS_KEYS.UPGR, JSON.stringify({defuseCharges:state.defuseCharges,scanPower:state.scanPower,multiBoost:state.multiBoost}));
  }

  function init(){
    if(!localStorage.getItem(LS_KEYS.BAL)) localStorage.setItem(LS_KEYS.BAL, '200');
    loadUpgrades();
    bind();
    renderBalance();
    makeGrid();
  }

  // grid and bombs
  function makeGrid(){
    const grid = el(SELECTORS.grid);
    grid.innerHTML = '';
    const cells = state.rows*state.cols;
    for(let i=0;i<cells;i++){
      const d = document.createElement('div');
      d.className = 'tile';
      d.dataset.index = i;
      d.addEventListener('click', onTileClick);
      grid.appendChild(d);
    }
    state.running = false; state.revealed = 0; state.clicked = new Set();
    el(SELECTORS.cashoutBtn).disabled = true;
    updatePotential();
  }

  let bombs = new Set();
  function plantBombs(firstIndex){
    bombs.clear();
    const cells = state.rows*state.cols;
    while(bombs.size < state.bombs){
      const r = Math.floor(Math.random()*cells);
      if(r===firstIndex) continue;
      bombs.add(r);
    }
  }

  function neighbors(index){
    const r = Math.floor(index/state.cols), c = index%state.cols; const out=[];
    for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
      if(dr===0&&dc===0) continue; const rr=r+dr, cc=c+dc;
      if(rr<0||rr>=state.rows||cc<0||cc>=state.cols) continue; out.push(rr*state.cols+cc);
    }
    return out;
  }

  function countBombsAround(i){
    return neighbors(i).filter(x=>bombs.has(x)).length;
  }

  // gameplay
  function onTileClick(e){
    const idx = Number(e.currentTarget.dataset.index);
    if(!state.running){
      state.running = true;
      plantBombs(idx);
      el(SELECTORS.cashoutBtn).disabled = false;
    }
    if(state.clicked.has(idx)) return;
    state.clicked.add(idx);
    const tile = e.currentTarget;
    if(bombs.has(idx)) return onBomb(tile, idx);
    revealSafe(tile, idx);
  }

  function revealSafe(tile, idx){
    tile.classList.add('revealed');
    const n = countBombsAround(idx);
    tile.textContent = n>0? n : '';
    state.revealed++;
    updatePotential();
  }

  function onBomb(tile, idx){
    if(state.defuseCharges>0){
      state.defuseCharges--; saveUpgrades(); revealSafe(tile, idx); updateAbilityButtons(); return;
    }
    tile.classList.add('bomb');
    gameOver(false);
  }

  function updatePotential(){
    const bet = Number(el(SELECTORS.bet).value)||1;
    // potential scales with reveals and upgrades
    const base = 1 + state.revealed*0.15;
    const multi = 1 + (state.multiBoost||0);
    const p = (base * multi).toFixed(2);
    el(SELECTORS.potential).textContent = p + 'x';
  }

  function cashOut(){
    if(!state.running) return;
    const bet = Number(el(SELECTORS.bet).value)||1;
    const base = 1 + state.revealed*0.15;
    const multi = 1 + (state.multiBoost||0);
    const payout = Math.max(0, Math.floor(bet * base * multi));
    const bal = Number(localStorage.getItem(LS_KEYS.BAL)||0) + payout;
    localStorage.setItem(LS_KEYS.BAL, String(bal));
    renderBalance();
    spawnFX(payout);
    gameOver(true,payout);
  }

  function gameOver(won, payout=0){
    state.running = false;
    el(SELECTORS.cashoutBtn).disabled = true;
    // reveal bombs
    const grid = el(SELECTORS.grid);
    grid.querySelectorAll('.tile').forEach((t,i)=>{
      if(bombs.has(i)) t.classList.add('bomb');
      t.removeEventListener('click', onTileClick);
    });
    // re-enable clicking by remaking grid (player starts new run)
  }

  // abilities
  function useScan(){
    // next click will show nearby bomb count overlay for that tile's neighborhood
    temporarilyBindOnce(el(SELECTORS.grid), (e)=>{
      const idx = Number(e.target.dataset.index);
      const near = neighbors(idx);
      const count = near.filter(x=>bombs.has(x)).length;
      alert('Scan: bombs nearby in neighborhood: '+count);
    });
  }

  function useScry(){
    // reveal a guaranteed safe tile
    const cells = state.rows*state.cols;
    for(let i=0;i<cells;i++){
      if(!state.clicked.has(i) && !bombs.has(i)){
        const tile = el(SELECTORS.grid).querySelector(`[data-index="${i}"]`);
        state.clicked.add(i); revealSafe(tile,i); break;
      }
    }
  }

  function useDefuse(){
    state.defuseCharges++; saveUpgrades(); updateAbilityButtons();
  }

  function updateAbilityButtons(){
    el(SELECTORS.defuseBtn).textContent = `Defuse (${state.defuseCharges})`;
    el(SELECTORS.scanBtn).textContent = `Scan (p${state.scanPower})`;
  }

  function temporarilyBindOnce(container, handler){
    function clickOnce(e){
      if(!e.target.dataset.index) return;
      handler(e);
      container.removeEventListener('click', clickOnce);
    }
    container.addEventListener('click', clickOnce);
  }

  // shop
  function openShop(){ el(SELECTORS.shopModal).classList.remove('hidden'); }
  function closeShop(){ el(SELECTORS.shopModal).classList.add('hidden'); }
  function buy(key){
    let cost = {multi:50,defuse:100,scan:75}[key]||50;
    let bal = Number(localStorage.getItem(LS_KEYS.BAL)||0);
    if(bal < cost){ alert('Not enough balance'); return; }
    bal -= cost; localStorage.setItem(LS_KEYS.BAL, String(bal));
    if(key==='multi') state.multiBoost = (state.multiBoost||0) + 0.05;
    if(key==='defuse') state.defuseCharges = (state.defuseCharges||0) + 1;
    if(key==='scan') state.scanPower = (state.scanPower||0) + 1;
    saveUpgrades(); renderBalance(); updateAbilityButtons();
  }

  // simple particle FX scaled by payout
  const cx = el('fx');
  const ctx = (cx && cx.getContext) ? cx.getContext('2d') : null;
  function resizeCanvas(){ if(!cx) return; cx.width = innerWidth; cx.height = innerHeight; }
  function spawnFX(amount){ if(!ctx) return; const count = Math.min(200, 10 + Math.floor(amount/5));
    const parts = [];
    for(let i=0;i<count;i++){ parts.push({x:innerWidth/2,y:innerHeight/3, vx:(Math.random()-0.5)*8, vy:-Math.random()*6-2, life:60, color:`hsl(${Math.random()*60+40},90%,60%)`}); }
    let t=0; resizeCanvas(); const id = setInterval(()=>{
      ctx.clearRect(0,0,innerWidth,innerHeight); t++; parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.2; p.life--; ctx.globalAlpha = Math.max(0, p.life/60); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2); ctx.fill(); });
      if(t>90){ clearInterval(id); ctx.clearRect(0,0,innerWidth,innerHeight); }
    },16);
  }

  // UI binding
  function bind(){
    el(SELECTORS.startBtn).addEventListener('click', ()=>{ makeGrid(); });
    el(SELECTORS.cashoutBtn).addEventListener('click', cashOut);
    el(SELECTORS.shopBtn).addEventListener('click', openShop);
    el(SELECTORS.closeShop).addEventListener('click', closeShop);
    document.querySelectorAll('.buy').forEach(b=>b.addEventListener('click', e=>buy(e.currentTarget.dataset.key)));
    el(SELECTORS.scanBtn).addEventListener('click', useScan);
    el(SELECTORS.scryBtn).addEventListener('click', useScry);
    el(SELECTORS.defuseBtn).addEventListener('click', useDefuse);
    window.addEventListener('resize', resizeCanvas);
    updateAbilityButtons();
  }

  function renderBalance(){ el(SELECTORS.balance).textContent = localStorage.getItem(LS_KEYS.BAL)||'0'; }

  // expose small helpers to global for debugging
  window.MR = {state, plantBombs, makeGrid};

  init();
})();
