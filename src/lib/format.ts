import { ORG_TIMEZONE } from '../theme/tokens';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatWhen(ms: number): string {
  const date = new Date(ms);
  const now = new Date();
  const today = startOfDay(now).getTime();
  const day = startOfDay(date).getTime();
  const diffDays = Math.round((today - day) / 86400000);

  if (diffDays === 0) {
    const time = new Intl.DateTimeFormat('en-GB', {
      timeZone: ORG_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
    return `Today ${time}`;
  }
  if (diffDays === 1) return 'Yesterday';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ORG_TIMEZONE,
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function formatFullDate(ms: number): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: ORG_TIMEZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(ms));
}
