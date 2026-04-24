import { Capacitor } from '@capacitor/core';
import { WebAudioService } from './WebAudioService.js';
import { NativeAudioService } from './NativeAudioService.js';

let engineInstance = null;

export function getAudioEngine() {
  if (!engineInstance) {
    const isNative = Capacitor.isNativePlatform();
    engineInstance = isNative ? new NativeAudioService() : new WebAudioService();
  }
  return engineInstance;
}

export const AudioEngine = getAudioEngine();
