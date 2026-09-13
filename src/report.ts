export interface BreastDefaults { left: number; right: number }
export interface Settings { breast_left_ml: number; breast_right_ml: number; version: number }
export interface DailyReport { day: string; bottle_ml: number; breast_ml: number; missing_estimates: number; diapers: number; wet: number; stool: number; events: number }
export function berlinDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function shiftDay(day: string, offset: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}
export function milliliters(value: string, allowZero = true): number {
  if (!/^\d+$/.test(value) || Number(value) < (allowZero ? 0 : 1) || Number(value) > 2147483647) throw new Error('Bitte eine gültige ganze Milliliterzahl eingeben.');
  return Number(value);
}
