export const progressColor = (p: number): string =>
  p >= 75 ? '#10b981' : p >= 50 ? '#f59e0b' : '#ef4444';

export const progressTrackBg = (p: number): string =>
  p >= 75 ? 'rgba(16,185,129,0.12)' : p >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)';

export const progressGlowDot = (p: number): string =>
  p >= 75 ? 'rgba(16,185,129,0.35)' : p >= 50 ? 'rgba(245,158,11,0.35)' : 'rgba(239,68,68,0.35)';

export const progressBadgeBg = (p: number): string =>
  p >= 75 ? 'rgba(16,185,129,0.1)' : p >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
