import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

// Use a mock class for Audio
class MockAudio {
  constructor() {
    this.src = '';
    this._currentTime = 0;
    this.playbackRate = 1;
    this._paused = true;
    this.duration = 100;
    this.listeners = {};
    this.preservesPitch = true;
  }

  get currentTime() { return this._currentTime; }
  set currentTime(v) { this._currentTime = v; }

  get paused() { return this._paused; }
  set paused(v) { this._paused = v; }

  addEventListener(event, cb) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(cb);
  }

  removeEventListener(event, cb) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(l => l !== cb);
    }
  }

  load() {}

  play() {
    this.paused = false;
    if (this.listeners['play']) {
      this.listeners['play'].forEach(cb => cb());
    }
    return Promise.resolve();
  }

  pause() {
    this.paused = true;
    if (this.listeners['pause']) {
      this.listeners['pause'].forEach(cb => cb());
    }
  }

  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
}

// Stub global Audio BEFORE importing engine
vi.stubGlobal('Audio', MockAudio);

// Import engine dynamically to ensure it uses the stubbed Audio
const engine = await import('../src/js/audio/engine.js');

describe('engine.js', () => {
  beforeEach(() => {
    engine.audio.currentTime = 0;
    engine.audio.playbackRate = 1;
    engine.audio.paused = true;
  });

  it('loads audio', () => {
    engine.loadAudio('test.mp3');
    expect(engine.audio.src).toBe('test.mp3');
  });

  it('plays audio', async () => {
    await engine.play();
    expect(engine.audio.paused).toBe(false);
  });

  it('pauses audio', () => {
    engine.play();
    engine.pause();
    expect(engine.audio.paused).toBe(true);
  });

  it('seeks audio', () => {
    engine.seek(50);
    expect(engine.audio.currentTime).toBe(50);
  });

  it('sets speed', () => {
    engine.setSpeed(1.5);
    expect(engine.audio.playbackRate).toBe(1.5);
  });

  it('gets current time', () => {
    engine.audio.currentTime = 10;
    expect(engine.getCurrentTime()).toBe(10);
  });

  it('gets duration', () => {
    engine.audio.duration = 200;
    expect(engine.getDuration()).toBe(200);
  });

  it('checks if playing', () => {
    engine.audio.paused = true;
    expect(engine.isPlaying()).toBe(false);
    engine.audio.paused = false;
    expect(engine.isPlaying()).toBe(true);
  });

  it('registers and triggers events', () => {
    const callback = vi.fn();
    engine.on('timeupdate', callback);
    
    // Simulate timeupdate from the audio object
    engine.audio.currentTime = 15;
    engine.audio.trigger('timeupdate');
    
    expect(callback).toHaveBeenCalledWith(15);
  });
});
