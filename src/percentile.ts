import { WHO_WEIGHT_LMS } from './data/who-growth-girls.ts';

export type Lms = readonly [number, number, number];
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

// Standardnormal-CDF, Abramowitz/Stegun 26.2.17 (absoluter Fehler < 7,5e-8).
export function zPercentile(z: number): number {
  if (z === 0) return 50;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const tail = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) * t
    * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 100 * (z < 0 ? tail : 1 - tail);
}
export function percentileLabel(value: number): string {
  if (value < 0.1) return 'unter P0,1';
  if (value > 99.9) return 'über P99,9';
  return `ca. P${value.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`;
}

export function interpolateCentiles(rows: readonly (readonly number[])[], days: number): number[] | null {
  if (!Number.isFinite(days) || days < 0) return null;
  const months = days / 30.4375;
  const upper = rows.findIndex(row => row[0] >= months);
  if (upper < 0) return null;
  if (upper === 0) return rows[0].slice(1);
  const a = rows[upper - 1], b = rows[upper];
  const fraction = (months - a[0]) / (b[0] - a[0]);
  return a.slice(1).map((value, i) => value + fraction * (b[i + 1] - value));
}

export function estimateCentile(measurement: number, values: readonly number[]): string {
  if (measurement < values[0]) return 'unter P3';
  if (measurement > values[6]) return 'über P97';
  const centiles = [3, 10, 25, 50, 75, 90, 97];
  const upper = values.findIndex(value => value >= measurement);
  const value = upper === 0 ? 3 : centiles[upper - 1] + (measurement - values[upper - 1])
    / (values[upper] - values[upper - 1]) * (centiles[upper] - centiles[upper - 1]);
  return `${percentileLabel(value)} (geschätzt)`;
}
