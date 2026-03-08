import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** CSAT day — Nov 12, 2026 */
export const CSAT_DATE = new Date('2026-11-12T00:00:00+09:00');

export function getDDayCount(): number {
    const now = new Date();
    const diff = CSAT_DATE.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
