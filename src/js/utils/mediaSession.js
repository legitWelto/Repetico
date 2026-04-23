import { play, pause, seek, getCurrentTime, setSpeed, audio } from '../audio/engine.js';

// Detect if running inside Capacitor Android WebView
let CapMediaSession = null;
async function loadCapMediaSession() {
  try {
    const mod = await import('@jofr/capacitor-media-session');
    CapMediaSession = mod.MediaSession;
  } catch (e) {
    // Not available (web), will fall back to navigator.mediaSession
  }
}
const capReady = loadCapMediaSession();

const isNativeAndroid = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform() === 'android';

export function setupMediaSession(songTitle, artist) {
  const metadata = {
    title: songTitle || 'Unknown Title',
    artist: '', // User requested no artist name
    album: 'Repetico',
    artwork: [
      { src: '/Icon.png', sizes: '512x512', type: 'image/png' }
    ]
  };

  if (isNativeAndroid && CapMediaSession) {
    CapMediaSession.setMetadata(metadata);
  } else if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata(metadata);
  }
}

export function updateMediaSessionState(isPlaying) {
  if (isNativeAndroid && CapMediaSession) {
    CapMediaSession.setPlaybackState({ playbackState: isPlaying ? 'playing' : 'paused' });
  } else if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }
}

export function updateMediaSessionTitle(title) {
  if (isNativeAndroid && CapMediaSession) {
    CapMediaSession.setMetadata({
      title: title,
      artist: '',
      album: 'Repetico',
      artwork: [
        { src: '/Icon.png', sizes: '512x512', type: 'image/png' }
      ]
    });
  } else if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
    if (navigator.mediaSession.metadata.title !== title) {
      navigator.mediaSession.metadata.title = title;
    }
  }
}

export function bindMediaSessionControls(handlers) {
  if (isNativeAndroid && CapMediaSession) {
    // Use Capacitor plugin API
    CapMediaSession.setActionHandler({ action: 'play' }, () => handlers.onPlay());
    CapMediaSession.setActionHandler({ action: 'pause' }, () => handlers.onPause());
    CapMediaSession.setActionHandler({ action: 'seekto' }, (details) => handlers.onSeekTo(details.seekTime));
    CapMediaSession.setActionHandler({ action: 'previoustrack' }, () => handlers.onPrevSection());
    CapMediaSession.setActionHandler({ action: 'nexttrack' }, () => handlers.onNextSection());
  } else if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => handlers.onPlay());
    navigator.mediaSession.setActionHandler('pause', () => handlers.onPause());
    navigator.mediaSession.setActionHandler('seekto', (details) => handlers.onSeekTo(details.seekTime));
    navigator.mediaSession.setActionHandler('previoustrack', () => handlers.onPrevSection());
    navigator.mediaSession.setActionHandler('nexttrack', () => handlers.onNextSection());
  }
}

// Call after capReady resolves for native controls
export async function ensureCapReady() {
  await capReady;
}
