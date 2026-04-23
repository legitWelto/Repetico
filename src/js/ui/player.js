import { play, pause, seek, setSpeed, isPlaying, getDuration, audio } from '../audio/engine.js';
import { formatTime } from '../utils/helpers.js';

let duration = 0;
let currentSpeed = 1.0;
let posRotation = 0;

export function initPlayerUI(appState) {
  const uiTime = document.getElementById('uiCurrentTime');
  const uiLeft = document.getElementById('uiTimeLeft');
  const playBtnGroup = document.getElementById('playBtnGroup');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const speedVal = document.getElementById('uiSpeedVal');
  const posDial = document.getElementById('posDial');
  const spdDial = document.getElementById('spdDial');

  // Draw ticks
  const posTicks = document.getElementById('posDialTicks');
  for(let i=0; i<36; i++){
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', '148'); line.setAttribute('y1', '48');
    line.setAttribute('x2', '148'); line.setAttribute('y2', '56');
    line.setAttribute('transform', `rotate(${i*10} 148 170)`);
    if(i%6 === 0) { line.setAttribute('stroke', '#7c6ef5'); line.setAttribute('y2', '60'); }
    posTicks.appendChild(line);
  }
  const spdTicks = document.getElementById('spdDialTicks');
  for(let i=0; i<24; i++){
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', '268'); line.setAttribute('y1', '10');
    line.setAttribute('x2', '268'); line.setAttribute('y2', '16');
    line.setAttribute('transform', `rotate(${i*15} 268 90)`);
    if(i%4 === 0) { line.setAttribute('stroke', '#4fd1c5'); line.setAttribute('y2', '20'); }
    spdTicks.appendChild(line);
  }

  // Play/Pause
  playBtnGroup.addEventListener('click', () => {
    if (isPlaying()) pause();
    else play();
  });

  appState.onAudioPlay = () => {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  };
  
  appState.onAudioPause = () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  };

  appState.onAudioLoaded = (dur) => {
    duration = dur;
    uiLeft.textContent = `-${formatTime(duration)}`;
  };

  appState.onTimeUpdate = (time) => {
    uiTime.textContent = formatTime(time);
    uiLeft.textContent = `-${formatTime(duration - time)}`;
    // Only update rotation if not dragging
    if (!posDragging && duration > 0) {
      posRotation = (time / duration) * 360;
      posDial.setAttribute('transform', `rotate(${posRotation} 148 170)`);
    }
  };

  // Drag logic
  let posDragging = false;
  let spdDragging = false;

  function makeDraggable(groupId, cx, cy, onDragStart, onDragMove, onDragEnd) {
    const svg = document.getElementById('mainSvg');
    const group = document.getElementById(groupId);
    let dragging = false, lastAngle = 0, rotation = 0;

    function svgPoint(e) {
      const r = svg.getBoundingClientRect();
      const sx = svg.viewBox.baseVal.width / r.width;
      const sy = svg.viewBox.baseVal.height / r.height;
      const src = e.touches ? e.touches[0] : e;
      return { x:(src.clientX - r.left)*sx - cx, y:(src.clientY - r.top)*sy - cy };
    }
    function angle(p){ return Math.atan2(p.y, p.x) * 180 / Math.PI; }

    function onDown(e){
      e.preventDefault();
      dragging = true;
      lastAngle = angle(svgPoint(e));
      group.style.cursor = 'grabbing';
      if (onDragStart) {
        rotation = onDragStart();
      }
    }
    function onMove(e){
      if(!dragging) return;
      e.preventDefault();
      const a = angle(svgPoint(e));
      let d = a - lastAngle;
      if(d > 180) d -= 360;
      if(d < -180) d += 360;
      rotation += d;
      lastAngle = a;
      group.setAttribute('transform', `rotate(${rotation} ${cx} ${cy})`);
      if (onDragMove) onDragMove(rotation, d);
    }
    function onUp(){ 
      if(dragging) {
        dragging = false; 
        group.style.cursor = 'grab'; 
        if (onDragEnd) onDragEnd(rotation);
      }
    }

    const r = groupId === 'posDial' ? 122 : 80;
    const circ = document.createElementNS('http://www.w3.org/2000/svg','circle');
    circ.setAttribute('cx', cx); circ.setAttribute('cy', cy); circ.setAttribute('r', r);
    circ.setAttribute('fill','none'); circ.setAttribute('stroke','transparent');
    circ.setAttribute('stroke-width','40');
    circ.style.cursor = 'grab';
    group.prepend(circ);

    group.addEventListener('mousedown',  onDown);
    group.addEventListener('touchstart', onDown, {passive:false});
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, {passive:false});
    window.addEventListener('mouseup',   onUp);
    window.addEventListener('touchend',  onUp);
  }

  // Position Dial Drag
  makeDraggable('posDial', 148, 170, 
    () => { posDragging = true; return posRotation; },
    (rot, delta) => {
      posRotation = rot;
      // Wrap around logic or clamp
      if (duration > 0) {
        let t = (rot % 360) / 360 * duration;
        if (t < 0) t += duration;
        seek(t);
        uiTime.textContent = formatTime(t);
      }
    },
    () => { posDragging = false; }
  );

  // Speed Dial Drag
  makeDraggable('spdDial', 268, 90, 
    () => { spdDragging = true; return (currentSpeed - 1) * 360; }, // Map speed to angle roughly
    (rot, delta) => {
      // Each degree is e.g. 0.5% speed
      currentSpeed += delta * 0.005;
      if (currentSpeed < 0.25) currentSpeed = 0.25;
      if (currentSpeed > 3.0) currentSpeed = 3.0;
      setSpeed(currentSpeed);
      speedVal.textContent = `${Math.round(currentSpeed * 100)}%`;
    },
    () => { spdDragging = false; }
  );
}
