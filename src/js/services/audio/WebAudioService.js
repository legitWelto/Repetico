import { setupMediaSession, updateMediaSessionState, updateMediaSessionTitle, bindMediaSessionControls } from '../../utils/mediaSession.js';

export class WebAudioService {
  constructor() {
    this.audio = new Audio();
    this.audio.preservesPitch = true;
    
    this.sections = [];
    this.currentSectionIndex = 0;
    
    this.loopStart = 0;
    this.loopEnd = 0;
    this.autoLoop = false;
    this.loopDelay = 0;
    
    this.onProgressCallback = null;
    this.onLoadedCallback = null;
    this.onPlayCallback = null;
    this.onPauseCallback = null;
    this.onSectionChangeCallback = null;
    this.onSpeedChangeCallback = null;
    
    this.rafId = null;
    this.isLoopingDelay = false;
    
    this._bindEvents();
  }

  _bindEvents() {
    this.audio.addEventListener('timeupdate', () => {
      if (this.onProgressCallback) {
        this.onProgressCallback(this.audio.currentTime);
      }
      this._checkSectionChange();
    });

    this.audio.addEventListener('loadedmetadata', () => {
      if (this.onLoadedCallback) {
        this.onLoadedCallback(this.audio.duration);
      }
    });

    this.audio.addEventListener('play', () => {
      this._startLoopCheck();
      updateMediaSessionState(true);
      if (this.onPlayCallback) this.onPlayCallback();
    });

    this.audio.addEventListener('pause', () => {
      this._stopLoopCheck();
      updateMediaSessionState(false);
      if (this.onPauseCallback) this.onPauseCallback();
    });

    this.audio.addEventListener('ratechange', () => {
      if (this.onSpeedChangeCallback) {
        this.onSpeedChangeCallback(this.audio.playbackRate);
      }
    });
  }

  async load(url, sections) {
    this.audio.src = url;
    this.sections = sections || [];
    this.currentSectionIndex = 0;
    this.audio.load();
    this._initMediaSession();
  }

  play() {
    if (this.isLoopingDelay) return;
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  isPlaying() {
    return !this.audio.paused;
  }

  seek(seconds) {
    this.audio.currentTime = seconds;
    this._checkSectionChange();
  }

  setSpeed(rate) {
    this.audio.playbackRate = rate;
  }

  setLoop(start, end, autoLoop, delay) {
    this.loopStart = start;
    this.loopEnd = end;
    this.autoLoop = autoLoop;
    this.loopDelay = delay;
  }

  onProgress(callback) {
    this.onProgressCallback = callback;
  }

  onLoaded(callback) {
    this.onLoadedCallback = callback;
  }

  onPlay(callback) {
    this.onPlayCallback = callback;
  }

  onPause(callback) {
    this.onPauseCallback = callback;
  }

  onSectionChange(callback) {
    this.onSectionChangeCallback = callback;
  }

  onSpeedChange(callback) {
    this.onSpeedChangeCallback = callback;
  }

  destroy() {
    this.pause();
    this._stopLoopCheck();
    this.audio.src = '';
    this.onProgressCallback = null;
    this.onSectionChangeCallback = null;
    this.onSpeedChangeCallback = null;
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    }
  }

  _startLoopCheck() {
    if (this.rafId) return;
    const checkLoop = () => {
      if (this.autoLoop && !this.isLoopingDelay && this.loopEnd > 0) {
        if (this.audio.currentTime >= this.loopEnd) {
          if (this.loopDelay > 0) {
            this.pause();
            this.isLoopingDelay = true;
            setTimeout(() => {
              this.seek(this.loopStart);
              this.isLoopingDelay = false;
              this.play();
            }, this.loopDelay);
          } else {
            // Gapless loop
            this.seek(this.loopStart);
          }
        }
      }
      this.rafId = requestAnimationFrame(checkLoop);
    };
    this.rafId = requestAnimationFrame(checkLoop);
  }

  _stopLoopCheck() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  _checkSectionChange() {
    if (!this.sections.length) return;
    const currentTime = this.audio.currentTime;
    
    let activeIndex = -1;
    for (let i = 0; i < this.sections.length; i++) {
      const section = this.sections[i];
      if (currentTime >= section.start && currentTime <= section.end) {
        activeIndex = i;
        break;
      }
    }

    if (activeIndex !== -1 && activeIndex !== this.currentSectionIndex) {
      this.currentSectionIndex = activeIndex;
      const sectionName = this.sections[activeIndex].name;
      if (this.onSectionChangeCallback) {
        this.onSectionChangeCallback(sectionName);
      }
      updateMediaSessionTitle(sectionName);
    }
  }

  _initMediaSession() {
    const initialTitle = this.sections.length > 0 ? this.sections[0].name : 'Repetico';
    setupMediaSession(initialTitle, '');
    
    bindMediaSessionControls({
      onPlay: () => this.play(),
      onPause: () => this.pause(),
      onSeekTo: (time) => this.seek(time),
      onPrevSection: () => {
        const t = this.audio.currentTime;
        const prev = [...this.sections].reverse().find(s => s.start < t - 2);
        if (prev) this.seek(prev.start);
        else this.seek(0);
      },
      onNextSection: () => {
        const t = this.audio.currentTime;
        const next = this.sections.find(s => s.start > t + 1);
        if (next) this.seek(next.start);
      }
    });
  }
}
