import { Job } from './types';
import { daysLeft, todayIso } from './jobUtils';

interface Props {
  // all applied jobs, not only this month, old ones need a follow up the most
  jobs: Job[];
  onUpdate: (id: number, changes: Partial<Job>) => void;
}

// a week is enough for them to have read it
const FOLLOW_UP_DAYS: number = 7;

function daysSinceApplied(job: Job): number {
  return job.applied_date === null ? 0 : -daysLeft(job.applied_date);
}

export default function FollowUp({ jobs, onUpdate }: Props) {
  const due: Job[] = jobs
    .filter((job: Job) => job.followed_up === null && daysSinceApplied(job) >= FOLLOW_UP_DAYS)
    .sort((a: Job, b: Job) => daysSinceApplied(b) - daysSinceApplied(a));

  if (due.length === 0) return null;

  return (
    <section className="report">
      <h2>Dags att följa upp ({due.length})</h2>
      <p className="small muted">Sökt för minst {FOLLOW_UP_DAYS} dagar sedan. Ring eller mejla och fråga hur det går.</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
        {due.map((job: Job) => (
          <li
            key={job.id}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0' }}
          >
            <span>
              <a href={job.url} target="_blank" rel="noreferrer">
                {job.title}
              </a>
              <span className="muted small">
                {' '}
                {job.employer}, {daysSinceApplied(job)} dagar sedan
              </span>
            </span>
            <button className="btn ghost" onClick={() => onUpdate(job.id, { followed_up: todayIso() })}>
              Följt upp
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
