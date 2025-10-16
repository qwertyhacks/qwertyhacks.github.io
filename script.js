const googleDriveFolder = "1IcyoMDVNypdS5hmOXsrrrUJkpi_M8e9n"; // Replace with your folder ID
const audio = document.getElementById("audio");
const trackList = document.getElementById("track-list");
const search = document.getElementById("search");
const pitch = document.getElementById("pitch");
const speed = document.getElementById("speed");

let tracks = [];
let currentTrack = 0;

// Fetch public files from Google Drive folder using public sharing link
async function fetchDriveFiles() {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q='${googleDriveFolder}'+in+parents&key=AIzaSyA-sample-key&fields=files(id,name,mimeType)`
  );
  const data = await res.json();
  tracks = data.files.filter(f => f.mimeType.includes("audio/"));
  renderTrackList(tracks);
  if (tracks.length > 0) loadTrack(0);
}

function renderTrackList(list) {
  trackList.innerHTML = "";
  list.forEach((file, i) => {
    const div = document.createElement("div");
    div.className = "track";
    div.textContent = file.name;
    div.onclick = () => loadTrack(i, true);
    trackList.appendChild(div);
  });
}

function loadTrack(index, autoplay = false) {
  currentTrack = index;
  const file = tracks[index];
  audio.src = `https://drive.google.com/uc?export=download&id=${file.id}`;
  if (autoplay) audio.play();
}

search.addEventListener("input", e => {
  const value = e.target.value.toLowerCase();
  const filtered = tracks.filter(t => t.name.toLowerCase().includes(value));
  renderTrackList(filtered);
});

audio.addEventListener("ended", () => {
  currentTrack = (currentTrack + 1) % tracks.length;
  loadTrack(currentTrack, true);
});

speed.addEventListener("input", () => {
  audio.playbackRate = parseFloat(speed.value);
});

pitch.addEventListener("input", () => {
  audio.preservesPitch = false;
  audio.playbackRate = parseFloat(pitch.value);
});

// Initialize
fetchDriveFiles();
