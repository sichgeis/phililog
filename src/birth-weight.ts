import { BIRTH_WEIGHT_GIRLS } from './data/intergrowth-birth-girls.ts';
import { percentileLabel } from './percentile.ts';

export const birthWeightSource = 'https://media.tghn.org/articles/INTERGROWTH-21st_Birth_Weight_Standards_Girls_1.pdf';
export function optionalGestation(weeks: string, days: string): number | null {
  if (!weeks.trim() && !days.trim()) return null;
  if (!/^\d+$/.test(weeks) || !/^[0-6]$/.test(days)) throw new Error('Schwangerschaftsalter bitte vollständig in Wochen und Tagen (0–6) eingeben.');
  const total = Number(weeks) * 7 + Number(days);
  if (total < 154 || total > 314) throw new Error('Schwangerschaftsalter bitte zwischen 22+0 und 44+6 eingeben.');
  return total;
}
export function gestationLabel(days: number): string { return `${Math.floor(days / 7)}+${days % 7}`; }
export function birthWeightComparison(grams: number | null | undefined, gestation: number | null | undefined) {
  if (grams == null || gestation == null) return { reason: 'Für die Geburtseinordnung bitte Geburtsgewicht und Schwangerschaftsalter in den Einstellungen hinterlegen.' } as const;
  if (!Number.isInteger(grams) || grams < 300 || grams > 10000) return { reason: 'Kein gültiges Geburtsgewicht.' } as const;
  const row = Number.isInteger(gestation) ? BIRTH_WEIGHT_GIRLS[gestation - 231] : undefined;
  if (!row) return { reason: 'Diese Geburtsreferenz steht für Mädchen von 33+0 bis 42+6 zur Verfügung.' } as const;
  const values = row.slice(1), centiles = [3, 5, 10, 50, 90, 95, 97];
  let percentile: string;
  if (grams < values[0]) percentile = 'unter P3';
  else if (grams > values[6]) percentile = 'über P97';
  else {
    const upper = values.findIndex(value => value >= grams);
    const value = upper === 0 ? 3 : centiles[upper - 1] + (grams - values[upper - 1]) / (values[upper] - values[upper - 1]) * (centiles[upper] - centiles[upper - 1]);
    percentile = `${percentileLabel(value)} (geschätzt)`;
  }
  return { grams, gestation: gestationLabel(gestation), percentile, p10: values[2], median: values[3], p90: values[4] } as const;
}
export function changeSinceBirth(grams: number, birthWeight: number | null | undefined) {
  if (!Number.isFinite(grams) || grams <= 0 || birthWeight == null || !Number.isInteger(birthWeight) || birthWeight < 300 || birthWeight > 10000) return null;
  return { grams: grams - birthWeight, percent: (grams - birthWeight) / birthWeight * 100 };
}
