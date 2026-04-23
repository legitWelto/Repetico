import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock engine.js
vi.mock('../src/js/audio/engine.js', () => ({
  play: vi.fn(),
  pause: vi.fn(),
  seek: vi.fn(),
  getCurrentTime: vi.fn(),
  setSpeed: vi.fn(),
  audio: {}
}));

// Mock navigator.mediaSession
global.MediaMetadata = class {
  constructor(metadata) {
    Object.assign(this, metadata);
  }
};

global.navigator.mediaSession = {
  metadata: null,
  playbackState: 'none',
  setActionHandler: vi.fn()
};

import { setupMediaSession, updateMediaSessionState, updateMediaSessionTitle, bindMediaSessionControls } from '../src/js/utils/mediaSession.js';

describe('mediaSession.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';
  });

  it('sets up media session metadata', () => {
    setupMediaSession('Test Song', 'Test Artist');
    expect(navigator.mediaSession.metadata.title).toBe('Test Song');
    expect(navigator.mediaSession.metadata.artist).toBe(''); // Artist should be empty as per requirement
  });

  it('updates playback state', () => {
    updateMediaSessionState(true);
    expect(navigator.mediaSession.playbackState).toBe('playing');
    updateMediaSessionState(false);
    expect(navigator.mediaSession.playbackState).toBe('paused');
  });

  it('updates title', () => {
    setupMediaSession('Old Title', 'Artist');
    updateMediaSessionTitle('New Title');
    expect(navigator.mediaSession.metadata.title).toBe('New Title');
  });

  it('binds media session controls', () => {
    const handlers = {
      onPlay: vi.fn(),
      onPause: vi.fn(),
      onSeekTo: vi.fn(),
      onPrevSection: vi.fn(),
      onNextSection: vi.fn()
    };

    bindMediaSessionControls(handlers);

    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('play', expect.any(Function));
    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('pause', expect.any(Function));
    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('seekto', expect.any(Function));
    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('previoustrack', expect.any(Function));
    expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('nexttrack', expect.any(Function));
  });
});
