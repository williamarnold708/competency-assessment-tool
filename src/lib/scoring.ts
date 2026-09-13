import { ChecklistItem, RatingValue } from '../types';

// Ported from the Claude Design prototype's Component.score()/level() logic —
// keep this file as the single source of truth for scoring rules.

export function scoreSection(items: ChecklistItem[], ratings: Record<string, RatingValue>): number {
  let got = 0;
  let of = 0;
  for (const item of items) {
    const v = ratings[item.id];
    if (v === undefined || v === 'n') continue;
    of += 1;
    got += v === 'c' ? 1 : v === 'p' ? 0.5 : 0;
  }
  return of ? Math.round((got / of) * 100) : 0;
}

export function ratedCount(items: ChecklistItem[], ratings: Record<string, RatingValue>): number {
  return items.filter((item) => ratings[item.id] !== undefined).length;
}

export function levelFromPct(pct: number): number {
  if (pct >= 95) return 5;
  if (pct >= 90) return 4;
  if (pct >= 80) return 3;
  if (pct >= 65) return 2;
  return 1;
}

export function awardedLevel(kpPct: number, tsPct: number): number {
  return levelFromPct(Math.min(kpPct, tsPct));
}

export function gap(awarded: number, expected: number): number {
  return awarded - expected;
}

export function formatGap(gapValue: number): string {
  return gapValue > 0 ? `+${gapValue}` : String(gapValue);
}

export function criticalFailCount(items: ChecklistItem[], ratings: Record<string, RatingValue>): number {
  return items.filter((item) => item.critical && ratings[item.id] === 'x').length;
}
