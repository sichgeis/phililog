export const RULES_VERSION = 1;
export const SCHEMA_VERSION = 1;
export type GameId = 'pacifier' | 'baby_talk' | 'grasp';
export const games: Record<GameId, { name: string; subtitle: string; instruction: string; icon: string }> = {
  pacifier: { name: 'Schnuller-Moment', subtitle: 'Ein kleiner Tipp. Wieder angedockt.', instruction: 'Tippe, wenn der Punkt im markierten Bereich ist. Oder spiele ganz entspannt ohne Timing.', icon: '◉' },
  baby_talk: { name: 'Babygespräch', subtitle: 'Große Gespräche in kleinen Silben.', instruction: 'Antworte mit derselben Silbe. Ihr habt alle Zeit der Welt.', icon: '☺' },
  grasp: { name: 'Greif nach den Sternen', subtitle: 'Kleine Hände, große Entdeckungen.', instruction: 'Tippe auf den Stern. Nach jedem Griff wartet er an einem neuen Platz.', icon: '✦' },
};
export const skills = [
  { id: 'hands_discovered', name: 'Hände entdeckt', branch: 'Hände', cost: 20, prerequisite: null, effect: 'Mehr Platz zum Andocken: Die Trefferzone wird größer.' },
  { id: 'targeted_grasp', name: 'Gezielt greifen', branch: 'Hände', cost: 40, prerequisite: 'hands_discovered', effect: 'Einmal pro Schnullerrunde rettet eine kleine Hand den ersten Fehlversuch.' },
  { id: 'self_pacifier', name: 'Schnuller selbst holen', branch: 'Hände', cost: 60, prerequisite: 'targeted_grasp', effect: 'Selbst ist das Baby! Das Greifspiel wird freigeschaltet.' },
  { id: 'eye_contact', name: 'Gegenüber fixieren', branch: 'Kontakt', cost: 20, prerequisite: null, effect: '„Da!“ Eine neue Silbe bereichert eure Gespräche.' },
  { id: 'social_smile', name: 'Bewusst lächeln', branch: 'Kontakt', cost: 40, prerequisite: 'eye_contact', effect: 'Zwei Gesprächsmomente werden zum gemeinsamen Lächeln.' },
] as const;
export type SkillId = typeof skills[number]['id'];
export interface Snapshot {
  schema_version: number; rules_version: number; revision: number;
  xp_total: number; xp_balance: number; unlocks: string[];
  scores?: { tempo: 'steady' | 'alternating'; assists: number; rules_version: number; rounds: number; best_score: number }[];
  stats: { game_id: GameId; rounds: number; best_bonus: number }[];
}
export interface Round {
  game: GameId; unlocks: string[]; completed: number; bonus: number;
  firstTry: boolean; rescued: boolean; awaitingNext: boolean; quiet: boolean;
  target: string; previousCell: number; elapsed: number;
}
export function canPlay(game: GameId, unlocks: readonly string[]) { return game !== 'grasp' || unlocks.includes('self_pacifier'); }
export function canBuy(id: SkillId, state: Snapshot) {
  const skill = skills.find(s => s.id === id)!;
  return !state.unlocks.includes(id) && state.xp_balance >= skill.cost && (!skill.prerequisite || state.unlocks.includes(skill.prerequisite));
}
export function markerPosition(elapsed: number) {
  const phase = (Math.max(0, elapsed) % 5000) / 2500;
  return phase <= 1 ? phase : 2 - phase;
}
export function inZone(position: number, unlocks: readonly string[]) {
  const edge = unlocks.includes('hands_discovered') ? 0.2 : 0.3;
  return position >= edge && position <= 1 - edge;
}
export function nextAction(round: Round, random = Math.random): Round {
  const r = { ...round, firstTry: true, awaitingNext: false, elapsed: 0 };
  if (r.game === 'baby_talk') {
    const sounds = r.unlocks.includes('eye_contact') ? ['Ah', 'Oh', 'Da'] : ['Ah', 'Oh'];
    r.target = r.unlocks.includes('social_smile') && [1, 3].includes(r.completed) ? 'smile' : sounds[Math.floor(random() * sounds.length)];
  } else if (r.game === 'grasp') {
    const cells = [0, 1, 2, 3].filter(n => n !== r.previousCell);
    r.previousCell = cells[Math.floor(random() * cells.length)];
    r.target = String(r.previousCell);
  }
  return r;
}
export function startRound(game: GameId, unlocks: string[], quiet = false, random = Math.random): Round {
  if (!canPlay(game, unlocks)) throw new Error('Dieses Spiel ist noch nicht freigeschaltet.');
  return nextAction({ game, unlocks: [...unlocks], completed: 0, bonus: 0, firstTry: true, rescued: false, awaitingNext: false, quiet, target: '', previousCell: -1, elapsed: 0 }, random);
}
export function answer(round: Round, value: string, position = markerPosition(round.elapsed)): { round: Round; message: string } {
  if (round.awaitingNext || round.completed >= 5) return { round, message: '' };
  const r = { ...round };
  let correct = r.game === 'pacifier' ? r.quiet || inZone(position, r.unlocks) : value === r.target;
  let rescued = false;
  if (!correct && r.game === 'pacifier' && !r.quiet && !r.rescued && r.unlocks.includes('targeted_grasp')) {
    correct = true; rescued = true; r.rescued = true;
  }
  if (!correct) {
    r.firstTry = false;
    return { round: r, message: r.game === 'pacifier' ? 'Fast angedockt. Ganz in Ruhe noch einmal.' : 'Noch ein Versuch – das Baby wartet auf dich.' };
  }
  const earnsBonus = r.game === 'pacifier' ? !r.quiet : r.firstTry;
  r.completed++; r.bonus += Number(earnsBonus); r.awaitingNext = true;
  return { round: r, message: rescued ? 'Kleine Hand, große Rettung!' : r.game === 'pacifier' ? 'Schnuller erfolgreich wieder angedockt.' : r.target === 'smile' ? 'Dieses Lächeln ist ansteckend.' : r.game === 'grasp' ? 'Fest im Griff. Und sehr stolz darauf.' : 'Ein ausgezeichnetes Gespräch. Findet das Baby auch.' };
}
export function reward(completed: number, bonus: number) {
  if (completed !== 5 || !Number.isInteger(bonus) || bonus < 0 || bonus > 5) throw new Error('Die Runde ist noch nicht vollständig.');
  return 10 + bonus;
}
