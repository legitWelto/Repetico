import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockAudioPlayerPlugin, mockFilesystem } = vi.hoisted(() => {
  return {
    mockAudioPlayerPlugin: {
      load: vi.fn().mockResolvedValue(undefined),
      play: vi.fn(),
      pause: vi.fn(),
      seek: vi.fn(),
      setSpeed: vi.fn(),
      setLoop: vi.fn(),
      destroy: vi.fn(),
      addListener: vi.fn()
    },
    mockFilesystem: {
      writeFile: vi.fn()
    }
  };
});

vi.mock('@capacitor/core', () => {
  return {
    registerPlugin: vi.fn().mockReturnValue(mockAudioPlayerPlugin),
    Capacitor: {
      getPlatform: vi.fn().mockReturnValue('android'),
      isNativePlatform: vi.fn().mockReturnValue(true)
    }
  };
});

vi.mock('@capacitor/filesystem', () => {
  return {
    Filesystem: mockFilesystem,
    Directory: {
      Cache: 'CACHE'
    }
  };
});

// Import the service under test
import { NativeAudioService } from '../src/js/services/audio/NativeAudioService.js';

describe('NativeAudioService', () => {
  let service;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new NativeAudioService();
  });

  it('initializes correctly and binds listeners', () => {
    expect(mockAudioPlayerPlugin.addListener).toHaveBeenCalledWith('onProgress', expect.any(Function));
    expect(mockAudioPlayerPlugin.addListener).toHaveBeenCalledWith('onLoaded', expect.any(Function));
    expect(mockAudioPlayerPlugin.addListener).toHaveBeenCalledWith('onPlay', expect.any(Function));
    expect(mockAudioPlayerPlugin.addListener).toHaveBeenCalledWith('onPause', expect.any(Function));
    expect(mockAudioPlayerPlugin.addListener).toHaveBeenCalledWith('onSectionChange', expect.any(Function));
    expect(mockAudioPlayerPlugin.addListener).toHaveBeenCalledWith('onSpeedChange', expect.any(Function));
    expect(mockAudioPlayerPlugin.addListener).toHaveBeenCalledWith('onError', expect.any(Function));
  });

  it('triggers listeners when plugin emits events', () => {
    const playCallback = vi.fn();
    service.onPlay(playCallback);

    // Find the onPlay handler registered with addListener
    const onPlayHandler = mockAudioPlayerPlugin.addListener.mock.calls.find(c => c[0] === 'onPlay')[1];
    onPlayHandler();

    expect(service.isPlaying()).toBe(true);
    expect(playCallback).toHaveBeenCalled();
  });

  it('logs error when native plugin emits onError event', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Find the onError handler registered with addListener
    const onErrorHandler = mockAudioPlayerPlugin.addListener.mock.calls.find(c => c[0] === 'onError')[1];
    onErrorHandler({ error: 'ExoPlayer loading failed' });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Native Audio Player Error:', 'ExoPlayer loading failed');
    consoleErrorSpy.mockRestore();
  });

  it('delegates basic control methods to the native plugin', () => {
    service.play();
    expect(mockAudioPlayerPlugin.play).toHaveBeenCalled();

    service.pause();
    expect(mockAudioPlayerPlugin.pause).toHaveBeenCalled();

    service.seek(42);
    expect(mockAudioPlayerPlugin.seek).toHaveBeenCalledWith({ seconds: 42 });

    service.setSpeed(1.25);
    expect(mockAudioPlayerPlugin.setSpeed).toHaveBeenCalledWith({ rate: 1.25 });

    service.setLoop(10, 20, true, 500);
    expect(mockAudioPlayerPlugin.setLoop).toHaveBeenCalledWith({
      start: 10,
      end: 20,
      autoLoop: true,
      delay: 500
    });
  });

  it('loads non-blob URL without writing to filesystem even on android', async () => {
    const sections = [{ name: 'Intro', start: 0, end: 10 }];
    await service.load('https://example.com/audio.mp3', sections, null);

    expect(mockFilesystem.writeFile).not.toHaveBeenCalled();
    expect(mockAudioPlayerPlugin.load).toHaveBeenCalledWith({
      url: 'https://example.com/audio.mp3',
      sections: sections
    });
  });

  it('converts and writes blob to cache filesystem on android', async () => {
    // Mock FileReader
    class MockFileReader {
      readAsDataURL(blob) {
        this.result = 'data:audio/mp3;base64,mockBase64DataString';
        if (this.onloadend) {
          this.onloadend();
        }
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);

    mockFilesystem.writeFile.mockResolvedValue({
      uri: 'file:///cache/temp_audio_123.mp3'
    });

    const mockBlob = new Blob(['mock audio data'], { type: 'audio/mp3' });
    const sections = [{ name: 'Intro', start: 0, end: 10 }];

    await service.load('blob:http://localhost/abc', sections, mockBlob);

    expect(mockFilesystem.writeFile).toHaveBeenCalledWith({
      path: expect.stringMatching(/^temp_audio_\d+\.mp3$/),
      data: 'mockBase64DataString',
      directory: 'CACHE'
    });

    expect(mockAudioPlayerPlugin.load).toHaveBeenCalledWith({
      url: 'file:///cache/temp_audio_123.mp3',
      sections: sections
    });

    vi.unstubAllGlobals();
  });
});
