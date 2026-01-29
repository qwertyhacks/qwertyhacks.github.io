(function(){
  const urlInput = document.getElementById('urlInput');
  const loadBtn = document.getElementById('loadBtn');
  const frame = document.getElementById('targetFrame');
  const runBtn = document.getElementById('runBtn');
  const commandInput = document.getElementById('commandInput');
  const output = document.getElementById('output');
  const clearBtn = document.getElementById('clearBtn');
  const presetSelect = document.getElementById('presetSelect');
  const presetArea = document.getElementById('presetArea');
  const gameCode = document.getElementById('gameCode');
  const applyBlooket = document.getElementById('applyBlooket');
  const bookmarkletBtn = document.getElementById('bookmarkletBtn');
  const copyBookmarklet = document.getElementById('copyBookmarklet');

  function log(msg, kind){
    const el = document.createElement('div');
    el.textContent = msg;
    el.className = kind||'';
    output.appendChild(el);
    output.scrollTop = output.scrollHeight;
  }

  loadBtn.addEventListener('click', ()=>{
    const url = urlInput.value.trim();
    if(!url) return;
    frame.src = url;
    log('Loaded: ' + url);
  });

  runBtn.addEventListener('click', async ()=>{
    const code = commandInput.value;
    if(!code.trim()) return;
    // Try to evaluate in iframe (only works for same-origin)
    try{
      const w = frame.contentWindow;
      if(!w) throw new Error('iframe not ready');
      const res = w.eval(code);
      log('=> ' + String(res));
    }catch (err){
      log('Error: cannot access iframe content (cross-origin). Use bookmarklet.');
      log(String(err));
    }
  });

  clearBtn.addEventListener('click', ()=>{ output.innerHTML=''; });

  presetSelect.addEventListener('change', ()=>{
    const v = presetSelect.value;
    if(v==='blooket') presetArea.classList.remove('hidden'); else presetArea.classList.add('hidden');
  });

  applyBlooket.addEventListener('click', ()=>{
    // Populate URL and show instructions (we won't auto-click join)
    urlInput.value = 'https://www.blooket.com/play';
    log('Blooket preset applied: set URL to blooket play page.');
    if(gameCode.value.trim()){
      log('Game code set: ' + gameCode.value.trim());
    }
  });

  bookmarkletBtn.addEventListener('click', ()=>{
    const code = (gameCode.value||'').trim();
    const bm = makeBlooketBookmarklet(code);
    showBookmarklet(bm);
  });

  function makeBlooketBookmarklet(code){
    // Bookmarklet will try to find a numeric code input and set it, then focus it.
    const fill = `(()=>{try{const q=["input[type=text]","input[type=tel]","input"].reduce((a,s)=>a||document.querySelector(s),null); if(q){q.value=${JSON.stringify(code)}; q.focus(); const evt=new Event('input',{bubbles:true}); q.dispatchEvent(evt);}else alert('Code input not found');}catch(e){alert('bookmarklet error:'+e)}})();`;
    return 'javascript:' + encodeURIComponent(fill);
  }

  function showBookmarklet(bm){
    // show the bookmarklet in output and enable copy
    log('Bookmarklet (drag to bookmarks or copy):');
    const pre = document.createElement('pre');
    pre.textContent = decodeURIComponent(bm.replace(/^javascript:/,''));
    output.appendChild(pre);
    copyBookmarklet.classList.remove('hidden');
    copyBookmarklet.onclick = ()=>{
      navigator.clipboard.writeText(bm).then(()=>log('Bookmarklet copied to clipboard.'));
    };
  }

  // handy: allow Enter+Ctrl to run
  commandInput.addEventListener('keydown', (e)=>{
    if(e.key==='Enter' && (e.ctrlKey||e.metaKey)){
      e.preventDefault(); runBtn.click();
    }
  });

  // fullscreen toggle
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const frameContainer = document.querySelector('.frame-container');
  fullscreenBtn.addEventListener('click', async ()=>{
    try{
      if(!document.fullscreenElement){
        await frameContainer.requestFullscreen().catch(err=>log('Fullscreen error: ' + err));
      }else{
        await document.exitFullscreen();
      }
    }catch(e){ log('Fullscreen error: ' + e); }
  });

  // draggable resize handle
  const resizeHandle = document.getElementById('resizeHandle');
  const workspace = document.querySelector('.workspace');
  const console_ = document.querySelector('.console');
  let isResizing = false;

  resizeHandle.addEventListener('mousedown', ()=>{ isResizing = true; });
  document.addEventListener('mouseup', ()=>{ isResizing = false; });
  document.addEventListener('mousemove', (e)=>{
    if(!isResizing) return;
    const rect = workspace.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    if(newWidth > 200 && rect.right - e.clientX > 200){
      frameContainer.style.flex = `0 0 ${newWidth}px`;
      console_.style.width = (rect.width - newWidth - 6) + 'px';
    }
  });

})();
