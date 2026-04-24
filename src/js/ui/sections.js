import { formatTime } from '../utils/helpers.js';

export function renderSections(sections, containerId, onClick) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  if (!sections || sections.length === 0) {
    container.innerHTML = '<div style="color:var(--muted); font-size:0.8em; padding: 1em; text-align:center;">No sections defined.</div>';
    return;
  }

  sections.forEach((sec, idx) => {
    const div = document.createElement('div');
    div.className = 'sec-btn';
    div.innerHTML = `<span>${sec.name}</span><span class="ts">${formatTime(sec.start)}</span>`;
    
    div.addEventListener('click', () => {
      // remove active class
      Array.from(container.children).forEach(c => c.classList.remove('active'));
      div.classList.add('active');
      onClick(sec);
    });

    container.appendChild(div);
  });

  // Quadratic grid layout logic
  const ro = new ResizeObserver(entries => {
    for (let entry of entries) {
      const W = entry.contentRect.width - 24; 
      const H = entry.contentRect.height - 30; 
      const N = container.children.length;
      if (N === 0) continue;
      
      let bestCols = 1;
      let bestDiff = Infinity;
      
      for (let c = 1; c <= N; c++) {
        const r = Math.ceil(N / c);
        const cellW = W / c;
        const cellH = H / r;
        const ratio = cellW > cellH ? cellW / cellH : cellH / cellW;
        
        if (ratio < bestDiff) {
          bestDiff = ratio;
          bestCols = c;
        }
      }
      container.style.gridTemplateColumns = `repeat(${bestCols}, 1fr)`;
    }
  });
  const secArea = container.parentElement;
  if (secArea) ro.observe(secArea);
}
