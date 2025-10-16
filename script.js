// script.js (ES module)
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const trackListEl = document.getElementById('track-list');
const titleEl = document.getElementById('title');
const artistEl = document.getElementById('artist');
const artEl = document.getElementById('art');
const searchEl = document.getElementById('search');
const autoplayEl = document.getElementById('autoplay');

const volumeEl = document.getElementById('volume');
const speedEl = document.getElementById('speed');
const speedValEl = document.getElementById('speedVal');
const pitchEl = document.getElementById('pitch');
const pitchValEl = document.getElementById('pitchVal');

let tracks = [];
let filteredTracks = [];
let idx = -1;
let isPlaying = false;

// Pitch + speed combination: we combine speed * pitchFactor into playbackRate.
// NOTE: this changes tempo when pitch is moved. For pitch shift while preserving tempo,
// integrate a library such as soundtouch.js or dsp.js with time-stretching.
function combinedPlaybackRate(){
  const speed = parseFloat(speedEl.value);
  const semitones = parseFloat(pitchEl.value);
  const pitchFactor = Math.pow(2, semitones / 12); // semitone -> multiplier
  return speed * pitchFactor;
}

async function loadTracks(){
  try {
    const resp = await fetch('tracks.json', {cache:'no-cache'});
    tracks = await resp.json();
  } catch (e) {
    console.error('Could not load tracks.json', e);
    tracks = [];
  }
  filteredTracks = tracks.slice();
  renderList(filteredTracks);
  if(tracks.length) loadTrack(0, false);
}

function renderList(list){
  trackListEl.innerHTML = '';
  list.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'track';
    div.innerHTML = `
      <div class="thumb">${(t.art ? '' : t.name[0] || '?')}</div>
      <div class="meta">
        <div class="name">${t.name}</div>
        <div class="sub">${t.artist || ''}</div>
      </div>
    `;
    div.onclick = () => loadTrack(i, true);
    trackListEl.appendChild(div);
  });
}

function loadTrack(index, play = false){
  const track = filteredTracks[index];
  if(!track) return;
  idx = index;
  titleEl.textContent = track.name;
  artistEl.textContent = track.artist || 'Unknown';
  if(track.art){
    artEl.style.backgroundImage = `url(${track.art})`;
    artEl.textContent = '';
  } else {
    artEl.style.backgroundImage = '';
    artEl.textContent = track.name[0] || '♪';
  }

  // trust the provided url (use drive uc links, S3, or other direct links)
  audio.src = track.url;
  audio.crossOrigin = 'anonymous';
  audio.load();

  // apply current speed/pitch
  audio.playbackRate = combinedPlaybackRate();

  if(play || autoplayEl.checked){
    audio.play().catch(e => console.warn('play prevented', e));
  }
  updatePlayButton();
}

playBtn.addEventListener('click', async () => {
  if(audio.src === '') return;
  if(audio.paused){
    try{ await audio.play(); }catch(e){ console.warn(e) }
  } else {
    audio.pause();
  }
  updatePlayButton();
});
prevBtn.addEventListener('click', ()=> {
  if(filteredTracks.length === 0) return;
  idx = (idx - 1 + filteredTracks.length) % filteredTracks.length;
  loadTrack(idx, true);
});
nextBtn.addEventListener('click', ()=> {
  if(filteredTracks.length === 0) return;
  idx = (idx + 1) % filteredTracks.length;
  loadTrack(idx, true);
});

function updatePlayButton(){
  const icon = audio.paused ? '▶' : '⏸';
  playBtn.textContent = audio.paused ? '▶' : '⏸';
}

// progress & time
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration || 0);
});
audio.addEventListener('timeupdate', () => {
  const pct = (audio.currentTime / (audio.duration || 1)) * 100;
  progressFill.style.width = pct + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime || 0);
});
audio.addEventListener('play', ()=> { isPlaying = true; updatePlayButton(); });
audio.addEventListener('pause', ()=> { isPlaying = false; updatePlayButton(); });

audio.addEventListener('ended', () => {
  if(autoplayEl.checked){
    idx = (idx + 1) % filteredTracks.length;
    loadTrack(idx, true);
  } else {
    updatePlayButton();
  }
});

progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  if(audio.duration) audio.currentTime = pct * audio.duration;
});

// volume
volumeEl.addEventListener('input', () => {
  audio.volume = parseFloat(volumeEl.value);
});

// speed
speedEl.addEventListener('input', () => {
  speedValEl.textContent = parseFloat(speedEl.value).toFixed(2) + '×';
  audio.playbackRate = combinedPlaybackRate();
});

// pitch
pitchEl.addEventListener('input', () => {
  pitchValEl.textContent = Math.round(parseFloat(pitchEl.value));
  audio.playbackRate = combinedPlaybackRate();
});

// search
searchEl.addEventListener('input', () => {
  const q = searchEl.value.trim().toLowerCase();
  filteredTracks = tracks.filter(t => {
    return (t.name || '').toLowerCase().includes(q) || (t.artist || '').toLowerCase().includes(q);
  });
  renderList(filteredTracks);
  // if current selection filtered out, reset display
  if(filteredTracks.length && idx >= filteredTracks.length) idx = 0;
});

// utils
function formatTime(s){
  if(!isFinite(s)) return '0:00';
  s = Math.floor(s);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

// initial
loadTracks();


// ------------------
// Custom cursor with trailing path
// ------------------
const cursorDot = document.getElementById('cursor-dot');
const svg = document.getElementById('cursor-trail');
const svgNS = "http://www.w3.org/2000/svg";
const pathEl = document.createElementNS(svgNS, 'path');
pathEl.setAttribute('stroke', 'rgba(124,92,255,0.25)');
pathEl.setAttribute('stroke-width', '2');
pathEl.setAttribute('fill', 'none');
svg.appendChild(pathEl);

const points = [];
const POINTS = 10;
for(let i=0;i<POINTS;i++){
  points.push({x: window.innerWidth/2, y: window.innerHeight/2});
}
let mouse = {x: window.innerWidth/2, y: window.innerHeight/2};
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if(t){ mouse.x = t.clientX; mouse.y = t.clientY; }
}, {passive:true});

function lerp(a,b,t){ return a + (b-a) * t; }
function animateCursor(){
  // first point follows the mouse
  points[0].x = lerp(points[0].x, mouse.x, 0.2);
  points[0].y = lerp(points[0].y, mouse.y, 0.2);
  // others follow previous
  for(let i=1;i<POINTS;i++){
    points[i].x = lerp(points[i].x, points[i-1].x, 0.12);
    points[i].y = lerp(points[i].y, points[i-1].y, 0.12);
  }
  // place main dot at first point
  cursorDot.style.transform = `translate(${points[0].x}px, ${points[0].y}px) translate(-50%,-50%)`;

  // build a smooth SVG path through points using quadratic beziers
  if(points.length>1){
    let d = `M ${points[0].x} ${points[0].y} `;
    for(let i=1;i<points.length;i++){
      const prev = points[i-1];
      const cur = points[i];
      const cx = (prev.x + cur.x)/2;
      const cy = (prev.y + cur.y)/2;
      d += `Q ${prev.x} ${prev.y} ${cx} ${cy} `;
    }
    // final line to last
    const last = points[points.length-1];
    d += `T ${last.x} ${last.y}`;
    pathEl.setAttribute('d', d);
    // fade tail by stroke-opacity
    pathEl.style.opacity = '1';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();


// Accessibility: pause cursor when focusing input
['focusin','focusout'].forEach(ev=>{
  window.addEventListener(ev, (e)=>{
    if(ev === 'focusin' && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')){
      cursorDot.style.display = 'none';
      svg.style.display = 'none';
    } else if(ev === 'focusout'){
      cursorDot.style.display = '';
      svg.style.display = '';
    }
  }, true);
});

// Hide cursor dot on small screens (mobile)
if(window.innerWidth < 700){
  cursorDot.style.display = 'none';
  svg.style.display = 'none';
}
