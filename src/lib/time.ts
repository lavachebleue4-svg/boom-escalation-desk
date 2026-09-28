export const MIN = 60_000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;

/** Format a demo-clock timestamp (ms) as a readable date/time string. */
export function formatDemoTime(ms: number | undefined | null): string {
  if (ms === undefined || ms === null) return '—';
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatClock(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Human duration like "2h 15m", used for "how overdue" displays. */
export function formatDuration(ms: number): string {
  if (ms <= 0) return '0m';
  const totalMin = Math.round(ms / MIN);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(' ');
}

/** Relative label like "in 12m" or "overdue by 5m", from now (demoNow). */
export function formatRelative(target: number | undefined | null, demoNow: number): string {
  if (target === undefined || target === null) return '—';
  const diff = target - demoNow;
  if (diff >= 0) return `in ${formatDuration(diff)}`;
  return `overdue by ${formatDuration(-diff)}`;
}

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

/** ms -> value for an <input type="datetime-local">, in the browser's local time. */
export function toLocalInputValue(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Reverse of toLocalInputValue. */
export function fromLocalInputValue(value: string): number {
  return new Date(value).getTime();
}
