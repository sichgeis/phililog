import { WHO_WEIGHT_GIRLS } from './data/who-weight-girls.ts';
import { KIGGS_WEIGHT_GIRLS } from './data/kiggs-weight-girls.ts';
import { berlinDay } from './report.ts';

export type WeightReference = 'who' | 'kiggs';
export const weightReferences = {
  who: { label: 'WHO · international', source: 'WHO Child Growth Standards · Mädchen', url: 'https://www.who.int/tools/child-growth-standards/standards/weight-for-age' },
  kiggs: { label: 'KiGGS · Deutschland', source: 'RKI · KiGGS und Perinataldaten · Mädchen (2013)', url: 'https://edoc.rki.de/bitstream/handle/176904/3254/28jWMa04ZjppM.pdf?sequence=' },
};
export function readWeightReference(storage?: Pick<Storage, 'getItem'>): WeightReference {
  try { return (storage ?? localStorage).getItem('phililog-weight-reference') === 'kiggs' ? 'kiggs' : 'who'; }
  catch { return 'who'; }
}
export function rememberWeightReference(reference: WeightReference, storage?: Pick<Storage, 'setItem'>): void {
  try { (storage ?? localStorage).setItem('phililog-weight-reference', reference); } catch { /* Selection remains usable in memory. */ }
}
export function kiggsWeightAtAge(days: number): readonly [number, number, number] | null {
  if (!Number.isFinite(days) || days < 0 || days > 1856) return null;
  const months = days / (365.25 / 12);
  const upper = KIGGS_WEIGHT_GIRLS.findIndex(row => row[0] >= months);
  if (upper === 0) return KIGGS_WEIGHT_GIRLS[0].slice(1) as [number, number, number];
  const a = KIGGS_WEIGHT_GIRLS[upper - 1], b = KIGGS_WEIGHT_GIRLS[upper];
  const fraction = (months - a[0]) / (b[0] - a[0]);
  return [1, 2, 3].map(column => a[column] + fraction * (b[column] - a[column])) as [number, number, number];
}

export function validBirthDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}
export function ageInDays(birthDate: string, occurredAt: string): number | null {
  if (!validBirthDate(birthDate) || !Number.isFinite(Date.parse(occurredAt))) return null;
  return Math.round((Date.parse(`${berlinDay(new Date(occurredAt))}T00:00:00Z`) - Date.parse(`${birthDate}T00:00:00Z`)) / 86400000);
}
export function ageLabel(days: number): string {
  if (days === 0) return 'Geburtstag · 0 Tage';
  const weeks = Math.floor(days / 7), rest = days % 7;
  return `${days} ${days === 1 ? 'Tag' : 'Tage'}${weeks ? ` · ${weeks} ${weeks === 1 ? 'Woche' : 'Wochen'}${rest ? ` und ${rest} ${rest === 1 ? 'Tag' : 'Tage'}` : ''}` : ''}`;
}
export function weightComparison(weight: number, occurredAt: string, birthDate: string | null, now = Date.now(), reference: WeightReference = 'who') {
  if (!birthDate) return { reason: 'Für den Vergleich bitte das Geburtsdatum in den Einstellungen hinterlegen.' } as const;
  const days = ageInDays(birthDate, occurredAt);
  if (days === null) return { reason: 'Geburtsdatum oder Messzeitpunkt ist ungültig.' } as const;
  if (days < 0) return { reason: 'Messung vor dem Geburtsdatum · kein Vergleich möglich.' } as const;
  if (Date.parse(occurredAt) > now) return { days, reason: 'Messung liegt in der Zukunft · noch kein Vergleich.' } as const;
  if (days >= WHO_WEIGHT_GIRLS.length) return { days, reason: `Außerhalb der ${reference === 'who' ? 'WHO' : 'KiGGS'}-Referenz (0–1856 Tage) · kein Vergleich möglich.` } as const;
  if (!Number.isFinite(weight) || weight <= 0) return { days, reason: 'Kein gültiger Gewichtswert.' } as const;
  const [p10, median, p90] = reference === 'who' ? WHO_WEIGHT_GIRLS[days] : kiggsWeightAtAge(days)!;
  const padding = (p90 - p10) * 0.18;
  const min = Math.min(p10, weight) - padding, max = Math.max(p90, weight) + padding;
  const position = (value: number) => (value - min) / (max - min) * 100;
  return { days, p10, median, p90, left: position(p10), center: position(median), right: position(p90), point: position(weight),
    relation: weight < p10 ? 'Unter P10' : weight > p90 ? 'Über P90' : 'Zwischen P10 und P90' } as const;
}
