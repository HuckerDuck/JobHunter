import { Job } from './types';

// green first, then earliest deadline, no deadline last
export function sortJobs(jobs: Job[]): Job[] {
  return [...jobs].sort((a: Job, b: Job) => {
    if (a.status !== b.status) {
      return a.status === 'gron' ? -1 : 1;
    }
    if (a.deadline === b.deadline) return 0;
    if (a.deadline === null) return 1;
    if (b.deadline === null) return -1;
    return a.deadline.localeCompare(b.deadline);
  });
}

export function daysLeft(deadline: string): number {
  const today: Date = new Date();
  today.setHours(0, 0, 0, 0);
  const end: Date = new Date(deadline + 'T00:00:00');
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

export function deadlineText(deadline: string | null): string {
  if (deadline === null) return 'Inget slutdatum';
  const days: number = daysLeft(deadline);
  if (days < 0) return 'Passerat';
  if (days === 0) return 'Sista dag idag';
  if (days === 1) return 'Sista dag imorgon';
  return `${days} dagar kvar`;
}

export function todayIso(): string {
  return new Date().toLocaleDateString('sv-SE');
}
