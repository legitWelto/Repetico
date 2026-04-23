export function formatTime(secs) {
  if (isNaN(secs) || !isFinite(secs)) return '0:00';
  const isNeg = secs < 0;
  secs = Math.abs(secs);
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${isNeg ? '-' : ''}${m}:${s.toString().padStart(2, '0')}`;
}

export function parseTime(timeStr) {
  // Parses "M:SS.ms" or just seconds
  if (!timeStr.includes(':')) return parseFloat(timeStr) || 0;
  const parts = timeStr.split(':');
  const m = parseInt(parts[0], 10);
  const s = parseFloat(parts[1]);
  return (m * 60) + s;
}
