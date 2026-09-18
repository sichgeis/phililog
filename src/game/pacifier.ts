export type Tempo = 'steady' | 'alternating';
export interface PacifierRound {
  tempo: Tempo; assists: number; elapsed: number; offsets: (number | null)[];
}
export type Hit = 'perfect' | 'hit' | 'rescued' | 'early' | 'late' | 'miss';
export function assistance(unlocks: readonly string[]) {
  return Number(unlocks.includes('hands_discovered')) + 2 * Number(unlocks.includes('targeted_grasp'));
}
export function movement(tempo: Tempo, index: number) { return tempo === 'steady' ? 2200 : index % 2 === 0 ? 2400 : 1600; }
export function opportunity(r: PacifierRound) {
  let start = 0;
  for (let index = 0; index < 12; index++) {
    const travel = movement(r.tempo, index), end = start + 1000 + travel;
    if (r.elapsed < end) return { index, travel, local: r.elapsed - start, done: false };
    start = end;
  }
  return { index: 12, travel: 0, local: 0, done: true };
}
export function evaluate(offsets: readonly (number | null)[], assists: number) {
  let score = 0, hits = 0, perfect = 0, combo = 0, bestCombo = 0, rescued = false;
  const outcomes: Hit[] = [];
  for (const offset of offsets) {
    let hit: Hit = offset === null ? 'miss' : Math.abs(offset) <= 90 ? 'perfect' : Math.abs(offset) <= (assists & 1 ? 375 : 250) ? 'hit' : offset < 0 ? 'early' : 'late';
    if (!['hit', 'perfect'].includes(hit) && (assists & 2) && !rescued) { hit = 'rescued'; rescued = true; }
    if (['hit', 'perfect', 'rescued'].includes(hit)) {
      score += (hit === 'perfect' ? 200 : 100) * (combo >= 6 ? 2 : combo >= 3 ? 1.5 : 1);
      hits++; perfect += Number(hit === 'perfect'); combo++; bestCombo = Math.max(bestCombo, combo);
    } else combo = 0;
    outcomes.push(hit);
  }
  const medal = hits >= 11 && perfect >= 8 ? 'Gold' : hits >= 10 && perfect >= 4 ? 'Silber' : hits >= 8 ? 'Bronze' : null;
  return { score, hits, perfect, combo, bestCombo, outcomes, medal, xp: 10 + Math.floor((hits + perfect) * 5 / 24) };
}
export function advance(r: PacifierRound, delta: number) {
  r.elapsed += Math.max(0, delta);
  const current = opportunity(r);
  while (r.offsets.length < current.index) r.offsets.push(null);
  if (!current.done && current.local >= 400 + current.travel && r.offsets.length === current.index) r.offsets.push(null);
}
export function tap(r: PacifierRound) {
  const c = opportunity(r);
  if (c.done || c.local < 400 || c.local >= 400 + c.travel || r.offsets.length !== c.index) return false;
  r.offsets.push(Math.round(c.local - 400 - c.travel / 2));
  return true;
}
export const hitText: Record<Hit, string> = { perfect: 'Präzise! Punktlandung.', hit: 'Angedockt!', rescued: 'Kleine Hand, große Rettung!', early: 'Zu früh – die Mitte kommt noch.', late: 'Zu spät – beim nächsten etwas früher.', miss: 'Vorbeigeflitzt. Weiter geht’s!' };
