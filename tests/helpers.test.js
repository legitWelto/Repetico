import { describe, it, expect } from 'vitest';
import { formatTime, parseTime } from '../src/js/utils/helpers.js';

describe('helpers.js', () => {
  describe('formatTime', () => {
    it('formats positive seconds correctly', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(3600)).toBe('60:00');
    });

    it('formats negative seconds correctly', () => {
      expect(formatTime(-5)).toBe('-0:05');
      expect(formatTime(-65)).toBe('-1:05');
    });

    it('handles NaN and non-finite values', () => {
      expect(formatTime(NaN)).toBe('0:00');
      expect(formatTime(Infinity)).toBe('0:00');
    });
  });

  describe('parseTime', () => {
    it('parses "M:SS" format correctly', () => {
      expect(parseTime('0:05')).toBe(5);
      expect(parseTime('1:00')).toBe(60);
      expect(parseTime('1:05')).toBe(65);
      expect(parseTime('60:00')).toBe(3600);
    });

    it('parses plain seconds correctly', () => {
      expect(parseTime('5')).toBe(5);
      expect(parseTime('65.5')).toBe(65.5);
    });

    it('handles invalid input', () => {
      expect(parseTime('')).toBe(0);
      expect(parseTime('abc')).toBe(0);
    });
  });
});
