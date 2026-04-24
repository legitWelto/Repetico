export function setupMediaSession(title, artist) {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: '', // Requirement: artist should be empty for a cleaner look on some devices
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

export function updateMediaSessionTitle(title) {
  if ('mediaSession' in navigator && navigator.mediaSession.metadata) {
    if (navigator.mediaSession.metadata.title !== title) {
      navigator.mediaSession.metadata.title = title;
    }
  }
}

export function bindMediaSessionControls(handlers) {
  if ('mediaSession' in navigator) {
    if (handlers.onPlay) {
      navigator.mediaSession.setActionHandler('play', handlers.onPlay);
    }
    if (handlers.onPause) {
      navigator.mediaSession.setActionHandler('pause', handlers.onPause);
    }
    if (handlers.onSeekTo) {
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        handlers.onSeekTo(details.seekTime);
      });
    }
    if (handlers.onPrevSection) {
      navigator.mediaSession.setActionHandler('previoustrack', handlers.onPrevSection);
    }
    if (handlers.onNextSection) {
      navigator.mediaSession.setActionHandler('nexttrack', handlers.onNextSection);
    }
  }
}
