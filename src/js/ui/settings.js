import { formatTime } from '../utils/helpers.js';

export function initSettingsUI(appState) {
  // Mobile Navigation
  function showScreen(id) {
    if (window.innerWidth >= 1024) return;
    ['playerScreen', 'settingsScreen', 'intervalSettingsScreen'].forEach(s => {
      document.getElementById(s).style.display = (s === id) ? 'flex' : 'none';
    });
  }

  if (window.innerWidth < 1024) showScreen('playerScreen');

  document.getElementById('btnSettings').addEventListener('click', () => showScreen('settingsScreen'));
  document.getElementById('btnCloseSettings').addEventListener('click', () => showScreen('playerScreen'));
  document.getElementById('btnIntervalSettings').addEventListener('click', () => showScreen('intervalSettingsScreen'));
  document.getElementById('btnCloseIntervals').addEventListener('click', () => showScreen('playerScreen'));

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      document.getElementById('playerScreen').style.display = '';
      document.getElementById('settingsScreen').style.display = '';
      document.getElementById('intervalSettingsScreen').style.display = '';
    } else {
      if (document.getElementById('playerScreen').style.display === '') {
        showScreen('playerScreen');
      }
    }
  });

  // Toggles
  const mainToggle = document.getElementById('mainIntToggle');
  const masterToggle = document.getElementById('masterIntervalToggle');
  const autoRestartToggle = document.getElementById('autoRestartToggle');
  const delaySelector = document.getElementById('delaySelector');
  const autoRestartExpl = document.getElementById('autoRestartExpl');
  const noRestartExpl = document.getElementById('noRestartExpl');

  function syncMasterToggles(isOn) {
    if(isOn) {
      mainToggle.classList.add('on');
      masterToggle.classList.add('on');
    } else {
      mainToggle.classList.remove('on');
      masterToggle.classList.remove('on');
    }
    appState.intervalsEnabled = isOn;
  }

  mainToggle.addEventListener('click', function(){ syncMasterToggles(this.classList.toggle('on')); });
  masterToggle.addEventListener('click', function(){ syncMasterToggles(this.classList.toggle('on')); });

  autoRestartToggle.addEventListener('click', function(){
    const isOn = this.classList.toggle('on');
    delaySelector.style.display = isOn ? 'flex' : 'none';
    autoRestartExpl.style.display = isOn ? 'block' : 'none';
    noRestartExpl.style.display = isOn ? 'none' : 'block';
    appState.autoRestart = isOn;
  });

  document.getElementById('loopDelayInput').addEventListener('change', (e) => {
    appState.loopDelay = parseInt(e.target.value, 10) || 0;
  });

  // Modal
  const editModal = document.getElementById('editModal');
  document.getElementById('btnCancelEdit').addEventListener('click', () => {
    editModal.style.display = 'none';
  });
  
  // Library Upload
  document.getElementById('fileUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      appState.onFileUpload(file);
      e.target.value = ''; // Reset input
    }
  });

  document.getElementById('fileImport').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      appState.onFileImport(file);
      e.target.value = ''; // Reset input
    }
  });

  document.getElementById('btnExport').addEventListener('click', () => {
    appState.onExport();
  });
}

export function renderIntervalSections(sections, onSelectionChange) {
  const container = document.getElementById('intervalSectionList');
  container.innerHTML = '';

  if (!sections || sections.length === 0) return;

  sections.forEach((sec, i) => {
    const label = document.createElement('label');
    label.className = 'list-item chk-item';
    
    // Auto-select first section by default if none specified
    const checkedStr = i === 0 ? 'checked' : '';
    
    label.innerHTML = `
      <div><div class="list-item-title">${sec.name}</div><div class="list-item-meta">${formatTime(sec.start)} - ${formatTime(sec.end)}</div></div>
      <input type="checkbox" ${checkedStr} data-start="${sec.start}" data-end="${sec.end}">
    `;
    
    label.querySelector('input').addEventListener('change', () => {
      onSelectionChange();
    });
    
    container.appendChild(label);
  });
  
  // Initial bounds update
  onSelectionChange();
}

export function updateIntervalBoundsUI(start, end) {
  document.getElementById('intStartVal').textContent = isNaN(start) ? '--:--' : formatTime(start);
  document.getElementById('intEndVal').textContent = isNaN(end) ? '--:--' : formatTime(end);
}
