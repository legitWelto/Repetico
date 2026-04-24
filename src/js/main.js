import { checkAndLoadDemo, getSongData, getAllMetadata, saveSongData, deleteSongData } from './storage/library.js';
import { AudioEngine } from './services/audio/index.js';
import { initPlayerUI } from './ui/player.js';
import { initSettingsUI, renderIntervalSections, updateIntervalBoundsUI } from './ui/settings.js';
import { renderSections } from './ui/sections.js';
import { formatTime } from './utils/helpers.js';

const appState = {
  activeSongId: null,
  metadata: null,
  intervalsEnabled: false,
  autoRestart: true,
  loopDelay: 2,
  intervalStart: 0,
  intervalEnd: 0,
  isWaitingDelay: false,
  activeSongFile: null, // Store the blob for saving metadata updates

  // UI callbacks
  onTimeUpdate: null,
  onAudioPlay: null,
  onAudioPause: null,
  onAudioLoaded: null,
  onFileUpload: async (file) => {
    let name = file.name.replace(/\.[^/.]+$/, "");
    const newName = prompt("Enter a name for this song:", name);
    if (newName === null) return; // cancelled
    if (newName.trim() !== "") name = newName.trim();

    const id = Date.now().toString();
    const metadata = {
      name: name,
      artist: "",
      sections: []
    };
    await saveSongData(id, file, metadata);
    loadLibrary();
    loadSong(id);
  },
  onFileImport: async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.id && data.metadata && data.audioBase64) {
        // Decode base64 to blob
        const res = await fetch(`data:audio/mp3;base64,${data.audioBase64}`);
        const blob = await res.blob();
        await saveSongData(data.id, blob, data.metadata);
        loadLibrary();
        loadSong(data.id);
      } else {
        alert("Invalid repetico file format.");
      }
    } catch (e) {
      alert("Error importing file.");
      console.error(e);
    }
  },
  onExport: async () => {
    if (!appState.activeSongId) return;
    const { song, metadata } = await getSongData(appState.activeSongId);
    if (!song || !metadata) return;

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(song.file);
    reader.onloadend = () => {
      const base64data = reader.result.split(',')[1];
      const exportObj = {
        id: appState.activeSongId,
        metadata,
        audioBase64: base64data
      };
      const blob = new Blob([JSON.stringify(exportObj)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${metadata.name}.repetico`;
      a.click();
      URL.revokeObjectURL(url);
    };
  }
};

async function loadLibrary() {
  const allMeta = await getAllMetadata();
  const list = document.getElementById('libraryList');
  list.innerHTML = '';
  allMeta.forEach(m => {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <div><div class="list-item-title" ${m.id === appState.activeSongId ? 'style="color:var(--accent); font-weight:600;"' : ''}>${m.name}</div></div>
      <div style="color:var(--accent); font-size:1.2em; padding: 0 0.5em;" class="delete-btn" title="Delete Song">🗑</div>
    `;
    // Click on name to load
    div.firstElementChild.addEventListener('click', () => loadSong(m.id));
    // Click on delete to remove
    div.querySelector('.delete-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Are you sure you want to delete "${m.name}"?`)) {
        await deleteSongData(m.id);
        if (appState.activeSongId === m.id) {
          appState.activeSongId = null;
          appState.metadata = null;
          document.getElementById('uiSongTitle').textContent = "No Song Loaded";
          renderSectionsList([]);
          renderSections([], 'secGrid', ()=>{});
          renderIntervalSections([], calculateIntervalBounds);
          AudioEngine.pause();
        }
        loadLibrary();
      }
    });
    list.appendChild(div);
  });
}

async function loadSong(id) {
  appState.activeSongId = id;
  const { song, metadata } = await getSongData(id);
  if (!song || !metadata) return;

  appState.metadata = metadata;
  appState.activeSongFile = song.file;
  
  // Update UI headers
  document.getElementById('uiSongTitle').textContent = metadata.name;

  // Load Audio
  const url = URL.createObjectURL(song.file);
  await AudioEngine.load(url, metadata.sections || []);

  // Render sections
  const safeSections = metadata.sections || [];
  renderSections(safeSections, 'secGrid', (sec) => {
    AudioEngine.seek(sec.start);
    AudioEngine.play();
  });
  
  renderSectionsList(safeSections);

  // Interval settings
  renderIntervalSections(safeSections, calculateIntervalBounds);

  loadLibrary(); // update active state in list
}

function updateSectionsUI() {
  const safeSections = appState.metadata.sections || [];
  renderSections(safeSections, 'secGrid', (sec) => {
    AudioEngine.seek(sec.start);
    AudioEngine.play();
  });
  renderSectionsList(safeSections);
  renderIntervalSections(safeSections, calculateIntervalBounds);
}

function renderSectionsList(sections) {
  const list = document.getElementById('sectionsList');
  list.innerHTML = '';
  sections.forEach((sec, index) => {
    const div = document.createElement('div');
    div.className = 'list-item';
    div.innerHTML = `
      <div><div class="list-item-title">${sec.name}</div><div class="list-item-meta">${formatTime(sec.start)} - ${formatTime(sec.end)}</div></div>
      <div style="display:flex; gap:0.8rem; align-items:center;">
        <div class="edit-ico" style="color:var(--muted); cursor:pointer;">✎</div>
        <div class="del-ico" style="color:var(--muted); cursor:pointer; font-size:1.1em;">🗑</div>
      </div>
    `;
    
    // Clicking the item opens the edit modal
    div.addEventListener('click', () => {
      document.getElementById('editSecName').value = sec.name;
      document.getElementById('editSecStart').value = sec.start;
      document.getElementById('editSecEnd').value = sec.end;
      document.getElementById('previewTimeline').value = 0;
      appState.previewEnd = null;
      document.getElementById('editModal').style.display = 'flex';
      appState.editingSectionIndex = index;
    });

    // Clicking delete specifically
    div.querySelector('.del-ico').addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm(`Remove section "${sec.name}"?`)) {
        appState.metadata.sections.splice(index, 1);
        await saveSongData(appState.activeSongId, appState.activeSongFile, appState.metadata);
        updateSectionsUI();
      }
    });

    list.appendChild(div);
  });
}

// Add Section Logic
function bindSectionEditor() {
  document.getElementById('btnAddSection').addEventListener('click', async () => {
    if (!appState.metadata) return;
    const newSec = { name: `Section ${appState.metadata.sections.length + 1}`, start: 0, end: 10 };
    appState.metadata.sections.push(newSec);
    appState.metadata.sections.sort((a, b) => a.start - b.start);
    await saveSongData(appState.activeSongId, appState.activeSongFile, appState.metadata);
    updateSectionsUI();
  });

  // Save Section Logic
  document.getElementById('btnSaveEdit').addEventListener('click', async () => {
    if (!appState.metadata || appState.editingSectionIndex === undefined) return;
    const idx = appState.editingSectionIndex;
    appState.metadata.sections[idx] = {
      name: document.getElementById('editSecName').value,
      start: parseFloat(document.getElementById('editSecStart').value) || 0,
      end: parseFloat(document.getElementById('editSecEnd').value) || 0
    };
    appState.metadata.sections.sort((a, b) => a.start - b.start);
    await saveSongData(appState.activeSongId, appState.activeSongFile, appState.metadata);
    document.getElementById('editModal').style.display = 'none';
    updateSectionsUI();
  });

  // Delete Section Logic (from modal)
  document.getElementById('btnDeleteSection').addEventListener('click', async () => {
    if (!appState.metadata || appState.editingSectionIndex === undefined) return;
    const idx = appState.editingSectionIndex;
    const sec = appState.metadata.sections[idx];
    if (confirm(`Remove section "${sec.name}"?`)) {
      appState.metadata.sections.splice(idx, 1);
      await saveSongData(appState.activeSongId, appState.activeSongFile, appState.metadata);
      document.getElementById('editModal').style.display = 'none';
      updateSectionsUI();
    }
  });

  // Play Preview Logic
  const previewTimeline = document.getElementById('previewTimeline');
  document.getElementById('btnPreviewSection').addEventListener('click', () => {
    const start = parseFloat(document.getElementById('editSecStart').value) || 0;
    const end = parseFloat(document.getElementById('editSecEnd').value) || 0;
    appState.previewEnd = end;
    AudioEngine.seek(start);
    AudioEngine.play();
  });

  previewTimeline.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    const start = parseFloat(document.getElementById('editSecStart').value) || 0;
    const end = parseFloat(document.getElementById('editSecEnd').value) || 0;
    const targetTime = start + (end - start) * (val / 100);
    AudioEngine.seek(targetTime);
  });
}

function calculateIntervalBounds() {
  const checkboxes = document.querySelectorAll('#intervalSectionList input[type="checkbox"]');
  let minStart = Infinity;
  let maxEnd = -Infinity;
  let hasSelection = false;
  
  checkboxes.forEach(cb => {
    if (cb.checked) {
      hasSelection = true;
      const s = parseFloat(cb.getAttribute('data-start'));
      const e = parseFloat(cb.getAttribute('data-end'));
      if (s < minStart) minStart = s;
      if (e > maxEnd) maxEnd = e;
    }
  });
  
  if (hasSelection) {
    appState.intervalStart = minStart;
    appState.intervalEnd = maxEnd;
    updateIntervalBoundsUI(minStart, maxEnd);
  } else {
    appState.intervalStart = 0;
    appState.intervalEnd = 0;
    updateIntervalBoundsUI(NaN, NaN);
  }
}

// Event bindings
// Initialize AudioEngine Listeners
function setupAudioEngineListeners() {
  AudioEngine.onProgress((time) => {
    if (appState.onTimeUpdate) appState.onTimeUpdate(time);

    // Preview Logic
    if (appState.previewEnd) {
      if (time >= appState.previewEnd) {
        AudioEngine.pause();
        appState.previewEnd = null; // stop preview
        document.getElementById('previewTimeline').value = 100;
      } else {
        const start = parseFloat(document.getElementById('editSecStart').value) || 0;
        const progress = ((time - start) / (appState.previewEnd - start)) * 100;
        document.getElementById('previewTimeline').value = Math.max(0, Math.min(100, progress));
      }
    }
  });

  AudioEngine.onPlay(() => {
    if (appState.onAudioPlay) appState.onAudioPlay();
  });

  AudioEngine.onPause(() => {
    if (appState.onAudioPause) appState.onAudioPause();
  });

  AudioEngine.onLoaded((dur) => {
    if (appState.onAudioLoaded) appState.onAudioLoaded(dur);
  });

  AudioEngine.onSectionChange((name) => {
    // Current section name is handled by the engine for media session
  });
  
  AudioEngine.onSpeedChange((rate) => {
    // Sync UI if changed via lock screen
    const speedVal = document.getElementById('uiSpeedVal');
    if (speedVal) speedVal.textContent = `${Math.round(rate * 100)}%`;
  });
}

// Initialize
async function init() {
  setupAudioEngineListeners();

  // Theme Toggle
  document.getElementById('btnThemeToggle').addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('repetico-theme', isLight ? 'light' : 'dark');
  });

  if (localStorage.getItem('repetico-theme') === 'light') {
    document.body.classList.add('light-mode');
  }

  bindSectionEditor();
  initPlayerUI(appState);
  initSettingsUI(appState);

  await checkAndLoadDemo();
  loadLibrary();
  loadSong('demo'); // Auto load demo initially
}

document.addEventListener('DOMContentLoaded', init);
