import { lengthMethod, type Feeding } from './domain.ts';
import { lengthBands, lengthComparison, lengthReferences } from './length.ts';
import { ageInDays, ageLabel, type WeightReference } from './weight.ts';

const number = (value: number) => value.toLocaleString('de-DE', { maximumFractionDigits: 1 });
const date = (iso: string | number) => new Date(iso).toLocaleDateString('de-DE', { timeZone: 'Europe/Berlin' });

export const centimeters = (value: number) => `${number(value)} cm`;

type LengthEntry = Feeding & { length_cm: number };

function lengthChart(entries: LengthEntry[], birthDate: string | null, reference: WeightReference): string {
  const now = Date.now();
  const points = entries.map(entry => ({ time: Date.parse(entry.occurred_at), cm: entry.length_cm }))
    .filter(point => Number.isFinite(point.time) && point.time <= now).reverse();
  if (!points.length) return '';

  const first = points[0].time, last = points.at(-1)!.time;
  const start = first === last ? first - 43_200_000 : first;
  const end = first === last ? last + 43_200_000 : last;
  const referencePoints = birthDate ? Array.from({ length: 81 }, (_, i) => start + (end - start) * i / 80).flatMap(time => {
    const days = ageInDays(birthDate, new Date(time).toISOString());
    const bands = days === null || time > now ? null : lengthBands(days, reference);
    return bands ? [{ time, ...bands }] : [];
  }) : [];
  const values = [...points.map(p => p.cm), ...referencePoints.flatMap(p => [p.p10, p.p90])];
  const low = Math.min(...values), high = Math.max(...values);
  const padding = Math.max((high - low) * .12, 1);
  const min = low - padding, span = high - low + 2 * padding;
  const x = (time: number) => (44 + (time - start) / (end - start) * 334).toFixed(2);
  const y = (cm: number) => (173 - (cm - min) / span * 145).toFixed(2);
  const guides = Array.from({ length: 4 }, (_, i) => {
    const value = min + span * i / 3;
    return `<line class="growth-grid" x1="44" x2="378" y1="${y(value)}" y2="${y(value)}"/><text x="36" y="${Number(y(value)) + 4}" text-anchor="end">${number(value)}</text>`;
  }).join('');
  const curves = [false, true].map(standing => {
    const segment = referencePoints.filter(p => p.standing === standing);
    if (segment.length < 2) return '';
    return (['p10', 'median', 'p90'] as const).map(key => `<polyline class="growth-reference ${key === 'median' ? 'growth-median' : ''}" points="${segment.map(p => `${x(p.time)},${y(p[key])}`).join(' ')}"/>`).join('');
  }).join('');
  return `<svg class="growth-chart" viewBox="0 0 400 205" role="img" aria-label="Längenverlauf mit ${points.length} Messpunkten. Einzelmessungen stehen unter dem Diagramm."><text x="44" y="15">Körperlänge (cm)</text>${guides}${curves}<polyline class="growth-measured" points="${points.map(p => `${x(p.time)},${y(p.cm)}`).join(' ')}"/>${points.map(p => `<circle class="growth-dot" cx="${x(p.time)}" cy="${y(p.cm)}" r="4"><title>${date(p.time)} · ${centimeters(p.cm)}</title></circle>`).join('')}<text x="44" y="193">${date(first)}</text>${date(last) === date(first) ? '' : `<text x="378" y="193" text-anchor="end">${date(last)}</text>`}</svg>${curves ? '<p class="growth-legend"><span>● Messungen</span><span>– Median P50</span><span>··· P10 / P90</span></p>' : ''}`;
}

export function lengthOverview(entries: Feeding[] | null, birthDate: string | null, reference: WeightReference, failure: string, escape: (value: unknown) => string, editIcon: string): string {
  if (entries === null) return `<div class="card growth-panel" role="status">${failure ? escape(failure) : 'Längenverlauf wird geladen …'}</div>`;
  const measured = entries.filter((entry): entry is LengthEntry => entry.length_cm != null);
  if (!measured.length) return '<div class="card empty-history"><h2>Noch keine Längenmessungen.</h2><p>Eine Länge lässt sich einzeln oder zusammen mit dem Gewicht erfassen.</p></div>';
  const source = lengthReferences[reference];
  return `<div class="card growth-panel"><h2>Längenverlauf</h2>${!birthDate ? '<p>Mit dem Geburtsdatum werden die Messungen nach Alter eingeordnet.</p><button class="secondary" data-view="settings">Geburtsdatum hinterlegen</button>' : ''}${lengthChart(measured, birthDate, reference)}<p class="field-note">Referenz für Mädchen bis 1856 Lebenstage. Bis Tag 730 wird die Länge im Liegen verglichen, ab Tag 731 die Größe im Stehen. ${reference === 'kiggs' ? 'KiGGS-Perzentilen zwischen den Tabellenwerten sind geschätzt.' : 'WHO-Perzentilen werden taggenau aus den Verteilungsdaten berechnet.'} <a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.label}</a></p></div>
    <h2 class="length-measurements-title">Einzelmessungen</h2><ul class="length-measurements">${measured.map(entry => {
      const standing = entry.length_standing === true;
      const comparison = lengthComparison(entry.length_cm, standing, entry.occurred_at, birthDate, reference);
      const time = new Date(entry.occurred_at).toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' });
      return `<li class="card length-measurement"><div><time datetime="${escape(entry.occurred_at)}">${date(entry.occurred_at)} · ${time}</time><strong>${centimeters(entry.length_cm)}</strong><span>${lengthMethod(standing)}${entry.kind === 'weight' ? ' · beim Wiegen' : ''}</span></div><div><strong class="length-percentile">${'reason' in comparison ? escape(comparison.reason) : `Perzentile ${comparison.percentile}`}</strong>${comparison.days !== undefined ? `<small>${ageLabel(comparison.days)}</small>` : ''}</div><button class="edit-button" data-edit="${escape(entry.id)}" aria-label="${entry.kind === 'weight' ? 'Gemeinsame Messung' : 'Körperlänge'} vom ${date(entry.occurred_at)} um ${time} bearbeiten">${editIcon}</button></li>`;
    }).join('')}</ul>`;
}
