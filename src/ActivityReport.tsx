import { useState } from 'react';
import { Job } from './types';

interface Props {
  jobs: Job[];
}

function currentMonth(): string {
  return new Date().toLocaleDateString('sv-SE').slice(0, 7);
}

export default function ActivityReport({ jobs }: Props) {
  const [month, setMonth] = useState<string>(currentMonth());
  const [copied, setCopied] = useState<boolean>(false);

  // applied jobs in the chosen month, oldest first
  const applied: Job[] = jobs
    .filter((job: Job) => job.applied && job.applied_date !== null && job.applied_date.startsWith(month))
    .sort((a: Job, b: Job) => (a.applied_date ?? '').localeCompare(b.applied_date ?? ''));

  const reportText: string = applied
    .map((job: Job) => `${job.applied_date}  ${job.title}, ${job.employer}`)
    .join('\n');

  async function copyReport() {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="report">
      <div className="report-head">
        <label htmlFor="month">Månad</label>
        <input id="month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <button className="btn primary" onClick={copyReport} disabled={applied.length === 0}>
          {copied ? 'Kopierat!' : 'Kopiera'}
        </button>
      </div>

      <p className="muted small">
        {applied.length} sökta jobb, båda spåren. Klistra in i aktivitetsrapporten hos Arbetsförmedlingen.
      </p>

      {applied.length === 0 ? (
        <p className="empty">Inga sökta jobb den här månaden.</p>
      ) : (
        <ul className="report-list">
          {applied.map((job: Job) => (
            <li key={job.id}>
              <span className="report-date">{job.applied_date}</span>
              <span>
                <strong>{job.title}</strong>
                <span className="muted"> {job.employer}</span>
              </span>
              <span className="report-track">{job.track === 'dev' ? 'Utvecklare' : 'Förskollärare'}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
