import { useState } from 'react';
import { Job } from './types';

interface Props {
  // applied jobs already filtered on the month
  jobs: Job[];
  month: string;
  onMonthChange: (month: string) => void;
}

export default function ActivityReport({ jobs, month, onMonthChange }: Props) {
  const [copied, setCopied] = useState<boolean>(false);

  // oldest first reads better in the report
  const reportText: string = [...jobs]
    .sort((a: Job, b: Job) => (a.applied_date ?? '').localeCompare(b.applied_date ?? ''))
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
        <input id="month" type="month" value={month} onChange={(e) => onMonthChange(e.target.value)} />
        {month !== '' && (
          <button className="btn ghost" onClick={() => onMonthChange('')}>
            Alla
          </button>
        )}
        <button className="btn primary" onClick={copyReport} disabled={jobs.length === 0}>
          {copied ? 'Kopierat!' : 'Kopiera'}
        </button>
      </div>
      <p className="muted small">
        {jobs.length} sökta jobb{month === '' ? '' : ' den här månaden'}. Kopiera och klistra in i aktivitetsrapporten.
      </p>
    </section>
  );
}
