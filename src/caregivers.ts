import type { Person } from './domain.ts';

export interface Caregiver {
  id: 'caregiver_a' | 'caregiver_b';
  person: Person;
  display_name: string;
  badge: 'violet' | 'turquoise';
  celebration: 'watercolor' | 'stars';
}

export function caregiverLabel(person: Person | null | undefined, caregivers: Caregiver[]): string {
  return caregivers.find(caregiver => caregiver.person === person)?.display_name ?? person ?? 'Nicht zugeordnet';
}

// Unknown historical identities remain selectable without changing their stored value.
export function caregiverChoices(caregivers: Caregiver[], known: (Person | null | undefined)[]): Person[] {
  return [...new Set([...caregivers.map(caregiver => caregiver.person), ...known.filter((person): person is Person => Boolean(person))])];
}
