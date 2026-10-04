import { WHO_WEIGHT_LMS, WHO_LENGTH_LMS, WHO_VELOCITY, WHO_BIRTH_VELOCITY } from './data/who-growth-girls.ts';
import { weightComparison, type WeightReference } from './weight.ts';
import { berlinDay } from './report.ts';
import type { Feeding } from './domain.ts';

type Lms = readonly [number, number, number];
export function lmsCentile(z: number, [l, m, s]: Lms): number {
  return l === 0 ? m * Math.exp(s * z) : m * Math.pow(1 + l * s * z, 1 / l);
}
export function whoZScore(grams: number, lms: Lms): number | null {
  if (!Number.isFinite(grams) || grams <= 0) return null;
  const kg = grams / 1000, [l, m, s] = lms;
  const z = l === 0 ? Math.log(kg / m) / s : (Math.pow(kg / m, l) - 1) / (s * l);
  if (z > 3) return 3 + (kg - lmsCentile(3, lms)) / (lmsCentile(3, lms) - lmsCentile(2, lms));
  if (z < -3) return -3 + (kg - lmsCentile(-3, lms)) / (lmsCentile(-2, lms) - lmsCentile(-3, lms));
  return z;
}
export function weightZScore(grams: number, days: number): number | null {
  return Number.isInteger(days) && days >= 0 && days < WHO_WEIGHT_LMS.length ? whoZScore(grams, WHO_WEIGHT_LMS[days]) : null;
}
export function weightForLength(grams: number, cm: number): number | null {
  if (!Number.isFinite(cm) || cm < 45 || cm > 110) return null;
  const index = (cm - 45) * 2, lower = Math.floor(index), upper = Math.ceil(index), fraction = index - lower;
  const a = WHO_LENGTH_LMS[lower], b = WHO_LENGTH_LMS[upper];
  return whoZScore(grams, [1, 2, 3].map(i => a[i] + fraction * (b[i] - a[i])) as unknown as Lms);
}
export function monthDay(birthDate: string, months: number): string {
  const [year, month, day] = birthDate.split('-').map(Number);
  const first = new Date(Date.UTC(year, month - 1 + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(day, last));
  return first.toISOString().slice(0, 10);
}
export interface GrowthPoint {
  entry: Feeding; days: number; time: number; grams: number; z: number; lengthZ: number | null;
  p10: number; median: number; p90: number;
}
export function growthPoints(entries: Feeding[], birthDate: string | null, reference: WeightReference, now = Date.now()): GrowthPoint[] {
  if (!birthDate) return [];
  return entries.flatMap(entry => {
    if (entry.kind !== 'weight') return [];
    const comparison = weightComparison(entry.weight_g!, entry.occurred_at, birthDate, now, reference);
    if ('reason' in comparison) return [];
    const z = weightZScore(entry.weight_g!, comparison.days);
    if (z === null) return [];
    const lengthZ = entry.length_cm != null && berlinDay(new Date(entry.occurred_at)) < monthDay(birthDate, 24) ? weightForLength(entry.weight_g!, entry.length_cm) : null;
    return [{ entry, days: comparison.days, time: Date.parse(entry.occurred_at), grams: entry.weight_g!, z, lengthZ,
      p10: comparison.p10, median: comparison.median, p90: comparison.p90 }];
  }).sort((a, b) => a.time - b.time || a.entry.id.localeCompare(b.entry.id));
}
export function defaultInterval(points: GrowthPoint[]): { start: string; end: string } {
  const end = points.at(-1);
  if (!end) return { start: '', end: '' };
  const before = points.filter(p => p.time < end.time);
  const target = end.time - 14 * 86400000;
  const start = before.reduce<GrowthPoint | undefined>((best, p) => !best || Math.abs(p.time - target) < Math.abs(best.time - target) ? p : best, undefined);
  return { start: start?.entry.id ?? '', end: end.entry.id };
}
export function intervalChange(start: GrowthPoint | undefined, end: GrowthPoint | undefined) {
  if (!start || !end) return { reason: 'Für die Zunahme sind zwei geeignete Messungen nötig.' } as const;
  const days = (end.time - start.time) / 86400000;
  if (days <= 0) return { reason: 'Das Ende muss zeitlich nach dem Start liegen.' } as const;
  const grams = end.grams - start.grams;
  return { grams, days, perDay: grams / days, zChange: end.z - start.z } as const;
}
interface Endpoint { unit: string; age: number }
interface VelocityTable { label: string; start: Endpoint; end: Endpoint; centiles: readonly (readonly [number, number])[] }
export function velocityComparison(start: GrowthPoint, end: GrowthPoint, birthDate: string, birthWeight: number | null) {
  if (end.time <= start.time) return { reason: 'Kein gültiges Messintervall.' } as const;
  const increment = end.grams - start.grams;
  const early = WHO_BIRTH_VELOCITY.find(row => row.start === start.days && row.end === end.days);
  if (early && birthWeight != null) {
    if (!Number.isInteger(birthWeight) || birthWeight < 2000) return { reason: 'Für dieses Geburtsgewicht enthält die WHO-Tabelle keine passende Gruppe.' } as const;
    const group = birthWeight >= 4000 ? 4 : Math.floor((birthWeight - 2000) / 500);
    const labels = ['2000–unter 2500 g', '2500–unter 3000 g', '3000–unter 3500 g', '3500–unter 4000 g', 'ab 4000 g'];
    const lower = [early.p5[group], early.p10[group], early.p25[group]];
    const centiles: [number, number][] = [];
    [5, 10, 25].forEach((p, i) => { if (lower[i] !== null) centiles.push([p, lower[i]!]); });
    centiles.push([50, early.median[group]]);
    return { label: `Alter ${early.start}–${early.end} Tage · Geburtsgewicht ${labels[group]}`, centiles, n: early.n[group], increment,
      note: group === 0 ? 'Kleine Stichprobe: Untere Perzentilen sind nicht verfügbar; es lässt sich kein vollständiger Perzentilbereich bestimmen.' : 'Empirische Perzentilen einer Geburtsgewichtsgruppe; keine persönliche Sollvorgabe.' } as const;
  }
  const endpointMatches = (point: GrowthPoint, endpoint: Endpoint) => endpoint.unit === 'days' ? point.days === endpoint.age : berlinDay(new Date(point.time)) === monthDay(birthDate, endpoint.age);
  const table = (WHO_VELOCITY as readonly VelocityTable[]).find(row => endpointMatches(start, row.start) && endpointMatches(end, row.end));
  if (table) return { label: `WHO · ${table.label.replaceAll('wks', 'Wochen').replaceAll('mo', 'Monate')}`, centiles: table.centiles, n: null, increment, note: 'Zunahmevergleich für Mädchen im veröffentlichten Altersintervall; keine persönliche Sollvorgabe.' } as const;
  return { reason: early && birthWeight == null ? 'Für den Vergleich nach Geburtsgewichtsgruppe bitte das Geburtsgewicht in den Einstellungen hinterlegen.' : 'Für diese Altersgrenzen gibt es keinen passenden WHO-Zunahmevergleich. Die tatsächliche Zunahme bleibt sichtbar; Referenzwerte werden nicht umgerechnet.' } as const;
}
export function velocityPosition(grams: number, centiles: readonly (readonly [number, number])[]): string {
  const equal = centiles.filter(([, value]) => grams === value);
  if (equal.length) return equal.length === 1 ? `Bei P${equal[0][0]}` : `Bei P${equal[0][0]}–P${equal.at(-1)![0]}`;
  const lower = [...centiles].reverse().find(([, value]) => grams > value);
  const upper = centiles.find(([, value]) => grams < value);
  return lower && upper ? `Zwischen P${lower[0]} und P${upper[0]}` : upper ? `Unter P${upper[0]}` : `Über P${lower![0]} · oberes Perzentil nicht bestimmt`;
}
