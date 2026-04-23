import { play, pause, seek, getCurrentTime, setSpeed, audio } from '../audio/engine.js';

export function setupMediaSession(songTitle, artist) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: songTitle || 'Unknown Title',
      artist: artist || 'Unknown Artist',
      album: 'Repetico',
      artwork: [
        { src: '/Icon.png', sizes: '512x512', type: 'image/png' }
      ]
    });
  }
}

export function updateMediaSessionState(isPlaying) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }
}

export function bindMediaSessionControls(handlers) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => handlers.onPlay());
    navigator.mediaSession.setActionHandler('pause', () => handlers.onPause());
    navigator.mediaSession.setActionHandler('seekto', (details) => handlers.onSeekTo(details.seekTime));
    navigator.mediaSession.setActionHandler('previoustrack', () => handlers.onPrevSection());
    navigator.mediaSession.setActionHandler('nexttrack', () => handlers.onNextSection());
  }
}
