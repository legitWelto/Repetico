// audio/engine.js

export const audio = new Audio();
audio.preservesPitch = true;

// State listeners
const listeners = {
  timeupdate: [],
  play: [],
  pause: [],
  ended: [],
  loaded: [],
};

export function loadAudio(blobUrl) {
  audio.src = blobUrl;
  audio.load();
}

export function play() {
  return audio.play();
}

export function pause() {
  audio.pause();
}

export function seek(time) {
  audio.currentTime = time;
}

export function setSpeed(rate) {
  audio.playbackRate = rate;
}

export function getCurrentTime() {
  return audio.currentTime;
}

export function getDuration() {
  return audio.duration || 0;
}

export function isPlaying() {
  return !audio.paused;
}

export function on(event, callback) {
  if (listeners[event]) {
    listeners[event].push(callback);
  }
}

// Internal event mapping
audio.addEventListener('timeupdate', () => {
  listeners.timeupdate.forEach(cb => cb(audio.currentTime));
});
audio.addEventListener('play', () => {
  listeners.play.forEach(cb => cb());
});
audio.addEventListener('pause', () => {
  listeners.pause.forEach(cb => cb());
});
audio.addEventListener('ended', () => {
  listeners.ended.forEach(cb => cb());
});
audio.addEventListener('loadedmetadata', () => {
  listeners.loaded.forEach(cb => cb(audio.duration));
});
