import { SPANISH_MONTH_ABBREVIATIONS } from '../constants';

export const Format = {
  seconds(secs: number): string {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = Math.floor(secs % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  },

  totalDuration(totalSecs: number): string {
    const totalMinutes = Math.floor(Math.max(0, totalSecs) / 60);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}min`;
  },

  date(date: Date): string {
    return `${date.getDate()} ${SPANISH_MONTH_ABBREVIATIONS[date.getMonth()]} ${date.getFullYear()}`;
  },
};

