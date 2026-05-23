import { registerPlugin, Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

// We'll create this custom plugin in Android
const AudioPlayerPlugin = registerPlugin('AudioPlayerPlugin');

export class NativeAudioService {
  constructor() {
    this.sections = [];
    this.onProgressCallback = null;
    this.onLoadedCallback = null;
    this.onPlayCallback = null;
    this.onPauseCallback = null;
    this.onSectionChangeCallback = null;
    this.onSpeedChangeCallback = null;
    this.playing = false;
    
    // Listen for progress updates from the native side
    AudioPlayerPlugin.addListener('onProgress', (info) => {
      if (this.onProgressCallback) {
        this.onProgressCallback(info.currentTime);
      }
    });

    AudioPlayerPlugin.addListener('onLoaded', (info) => {
      if (this.onLoadedCallback) {
        this.onLoadedCallback(info.duration);
      }
    });

    // Listen for play state from native
    AudioPlayerPlugin.addListener('onPlay', () => {
      this.playing = true;
      if (this.onPlayCallback) {
        this.onPlayCallback();
      }
    });

    // Listen for pause state from native
    AudioPlayerPlugin.addListener('onPause', () => {
      this.playing = false;
      if (this.onPauseCallback) {
        this.onPauseCallback();
      }
    });

    // Listen for section changes from the native side
    AudioPlayerPlugin.addListener('onSectionChange', (info) => {
      if (this.onSectionChangeCallback) {
        this.onSectionChangeCallback(info.sectionName);
      }
    });

    // Listen for speed changes from the native side
    AudioPlayerPlugin.addListener('onSpeedChange', (info) => {
      if (this.onSpeedChangeCallback) {
        this.onSpeedChangeCallback(info.rate);
      }
    });

    // Listen for errors from the native side
    AudioPlayerPlugin.addListener('onError', (info) => {
      console.error("Native Audio Player Error:", info.error);
    });
    
    // Listen for state sync from native (e.g. Speed Up clicked)
    // We could dispatch custom events or use a dedicated callback if needed.
  }

  async load(url, sections, blob) {
    this.sections = sections || [];
    
    let finalUrl = url;

    // Handle blob URLs on Android
    if (Capacitor.getPlatform() === 'android' && (blob || url.startsWith('blob:'))) {
      try {
        let audioBlob = blob;
        if (!audioBlob && url.startsWith('blob:')) {
          const response = await fetch(url);
          audioBlob = await response.blob();
        }
        
        if (audioBlob) {
          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
          });
          reader.readAsDataURL(audioBlob);
          const base64Data = await base64Promise;

          // Save to temp file
          const fileName = `temp_audio_${Date.now()}.mp3`;
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache
          });

          finalUrl = savedFile.uri;
        }
      } catch (e) {
        console.error("Failed to process blob URL for native playback", e);
        throw new Error("Failed to process audio data for native playback: " + e.message);
      }
    }

    // Convert sections array to something native can easily parse
    const nativeSections = this.sections.map(s => ({
      name: s.name,
      start: s.start,
      end: s.end
    }));

    await AudioPlayerPlugin.load({
      url: finalUrl,
      sections: nativeSections
    });
  }

  play() {
    AudioPlayerPlugin.play();
  }

  pause() {
    AudioPlayerPlugin.pause();
  }

  isPlaying() {
    return this.playing;
  }

  seek(seconds) {
    AudioPlayerPlugin.seek({ seconds });
  }

  setSpeed(rate) {
    AudioPlayerPlugin.setSpeed({ rate });
  }

  setLoop(start, end, autoLoop, delay) {
    AudioPlayerPlugin.setLoop({
      start,
      end,
      autoLoop,
      delay
    });
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
    AudioPlayerPlugin.destroy();
    this.onProgressCallback = null;
    this.onLoadedCallback = null;
    this.onPlayCallback = null;
    this.onPauseCallback = null;
    this.onSectionChangeCallback = null;
    this.onSpeedChangeCallback = null;
  }
}
