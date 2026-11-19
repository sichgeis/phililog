import { KIGGS_LENGTH_CENTILES, WHO_LENGTH_FOR_AGE } from './data/length-girls.ts';
import { estimateCentile, interpolateCentiles, percentileLabel, zPercentile } from './percentile.ts';
import { ageInDays, type WeightReference } from './weight.ts';

export const lengthReferences = {
  who: { label: 'WHO · international', url: 'https://www.who.int/tools/child-growth-standards/standards/length-height-for-age' },
  kiggs: { label: 'KiGGS · Deutschland', url: 'https://edoc.rki.de/handle/176904/3254' },
};
const firstStandingDay = 731;
const p90Z = 1.2815515655;

export function lengthBands(days: number, reference: WeightReference) {
  const lms = WHO_LENGTH_FOR_AGE[days];
  if (!lms) return null;
  const standing = days >= firstStandingDay;
  if (reference === 'kiggs') {
    const centiles = interpolateCentiles(KIGGS_LENGTH_CENTILES, days)!;
    return { p10: centiles[1], median: centiles[3], p90: centiles[5], standing };
  }
  const [median, spread] = lms;
  const width = median * spread * p90Z;
  return { p10: median - width, median, p90: median + width, standing };
}

export function lengthComparison(cm: number, standing: boolean, occurredAt: string, birthDate: string | null, reference: WeightReference, now = Date.now()) {
  if (!birthDate) return { reason: 'Für den Altersvergleich fehlt das Geburtsdatum.' } as const;
  const days = ageInDays(birthDate, occurredAt);
  if (days === null) return { reason: 'Geburtsdatum oder Messzeitpunkt ist ungültig.' } as const;
  if (days < 0) return { reason: 'Messung liegt vor dem Geburtsdatum.' } as const;
  if (Date.parse(occurredAt) > now) return { days, reason: 'Messung liegt in der Zukunft.' } as const;
  const bands = lengthBands(days, reference);
  if (!bands) return { days, reason: 'Außerhalb des angezeigten Referenzalters (0–1856 Tage).' } as const;
  if (standing !== bands.standing) return { days, reason: `Für dieses Alter wird eine ${bands.standing ? 'stehend' : 'liegend'} gemessene Körperlänge verglichen.` } as const;
  if (reference === 'kiggs') return { days, percentile: estimateCentile(cm, interpolateCentiles(KIGGS_LENGTH_CENTILES, days)!) } as const;
  const [median, spread] = WHO_LENGTH_FOR_AGE[days];
  const z = (cm - median) / (median * spread);
  return { days, percentile: percentileLabel(zPercentile(z)) } as const;
}
