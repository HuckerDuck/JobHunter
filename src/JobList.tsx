import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Job, Track } from './types';
import { daysLeft, deadlineText, sortJobs, todayIso } from './jobUtils';
import ActivityReport from './ActivityReport';

// a track tab, or the applied tab with both tracks
type Tab = Track | 'applied';

interface Props {
  email: string;
}

// same text as the night job in supabase writes
const EXPIRED_REASON: string = 'Sista ansökningsdag passerad';

const TRACK_LABELS: Record<Track, string> = {
  preschool: 'Förskollärare',
  dev: 'Utvecklare',
};

export default function JobList({ email }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [tab, setTab] = useState<Tab>('preschool');
  // starts on this month, empty string means all months
  const [month, setMonth] = useState<string>(todayIso().slice(0, 7));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    // skipped jobs are loaded too, so expired ones can be listed
    const { data, error: loadError } = await supabase.from('jobs').select('*');
    if (loadError) {
      setError('Kunde inte hämta jobben.');
    } else {
      setJobs(data as Job[]);
    }
    setLoading(false);
  }

  // update the list right away, roll back if the db says no
  async function updateJob(id: number, changes: Partial<Job>) {
    const before: Job[] = jobs;
    setJobs(jobs.map((job: Job) => (job.id === id ? { ...job, ...changes } : job)));
    const { error: updateError } = await supabase.from('jobs').update(changes).eq('id', id);
    if (updateError) {
      setJobs(before);
      setError('Kunde inte spara ändringen.');
    }
  }

  function isExpired(job: Job): boolean {
    return job.deadline !== null && daysLeft(job.deadline) < 0;
  }

  function isTodo(job: Job): boolean {
    return !job.applied && !job.skipped && !isExpired(job);
  }

  // the night job sets this reason, but also catch ones that expired since then
  function isExpiredNotApplied(job: Job): boolean {
    return !job.applied && (job.skip_reason === EXPIRED_REASON || (!job.skipped && isExpired(job)));
  }

  function countTodo(t: Track): number {
    return jobs.filter((job: Job) => job.track === t && isTodo(job)).length;
  }

  const appliedJobs: Job[] = jobs
    .filter((job: Job) => job.applied)
    .sort((a: Job, b: Job) => (b.applied_date ?? '').localeCompare(a.applied_date ?? ''));

  const appliedInMonth: Job[] = appliedJobs.filter(
    (job: Job) => month === '' || (job.applied_date ?? '').startsWith(month),
  );

  const showApplied: boolean = tab === 'applied';

  const visible: Job[] = showApplied
    ? appliedInMonth
    : sortJobs(jobs.filter((job: Job) => job.track === tab && isTodo(job)));

  const expired: Job[] = showApplied
    ? []
    : jobs.filter((job: Job) => job.track === tab && isExpiredNotApplied(job));

  return (
    <main className="page">
      <header className="top">
        <div>
          <h1>Jobbspårning</h1>
          <p className="muted small">{email}</p>
        </div>
        <button className="btn ghost" onClick={() => supabase.auth.signOut()}>
          Logga ut
        </button>
      </header>

      <nav className="tabs">
        {(Object.keys(TRACK_LABELS) as Track[]).map((t: Track) => (
          <button key={t} className={t === tab ? 'tab active' : 'tab'} onClick={() => setTab(t)}>
            {TRACK_LABELS[t]} <span className="count">{countTodo(t)}</span>
          </button>
        ))}
        <button className={showApplied ? 'tab active' : 'tab'} onClick={() => setTab('applied')}>
          Sökta <span className="count">{appliedJobs.length}</span>
        </button>
      </nav>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Laddar jobb...</p>}
      {!loading && showApplied && (
        <ActivityReport jobs={appliedInMonth} month={month} onMonthChange={setMonth} />
      )}
      {!loading && visible.length === 0 && (
        <p className="empty">{showApplied ? 'Inga sökta jobb här.' : 'Inget kvar att söka här. Bra jobbat!'}</p>
      )}

      <ul className="cards">
        {visible.map((job: Job) => {
          const urgent: boolean = job.deadline !== null && daysLeft(job.deadline) <= 3;
          // found today or yesterday by the night search
          const isNew: boolean = !showApplied && job.found !== null && daysLeft(job.found) >= -1;
          return (
            <li key={job.id} className={`card ${job.status}`}>
              <div className="card-head">
                <span className="pills">
                  <span className={`pill ${job.status}`}>{job.status === 'gron' ? 'Grönt' : 'Gult'}</span>
                  {isNew && <span className="pill new">Ny</span>}
                </span>
                {showApplied ? (
                  <span className="deadline">
                    {TRACK_LABELS[job.track]}, sökt {job.applied_date ?? ''}
                  </span>
                ) : (
                  <span className={urgent ? 'deadline urgent' : 'deadline'}>{deadlineText(job.deadline)}</span>
                )}
              </div>
              <h2>{job.title}</h2>
              <p className="employer">{job.employer}</p>
              {job.note && !showApplied && <p className="note">{job.note}</p>}
              {/* already applied, so the note can stay folded */}
              {job.note && showApplied && (
                <details className="note-fold">
                  <summary>Anteckning</summary>
                  <p className="note">{job.note}</p>
                </details>
              )}

              <div className="actions">
                <a className="btn ghost" href={job.url} target="_blank" rel="noreferrer">
                  Öppna annons
                </a>
                {showApplied ? (
                  <button
                    className="btn ghost"
                    onClick={() => updateJob(job.id, { applied: false, applied_date: null })}
                  >
                    Ångra
                  </button>
                ) : (
                  <>
                    <button className="btn ghost" onClick={() => updateJob(job.id, { skipped: true })}>
                      Skippa
                    </button>
                    <button
                      className="btn primary"
                      onClick={() => updateJob(job.id, { applied: true, applied_date: todayIso() })}
                    >
                      Sökt
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {expired.length > 0 && (
        <details className="expired">
          <summary>Utgångna, ej sökta ({expired.length})</summary>
          <ul>
            {expired.map((job: Job) => (
              <li key={job.id}>
                <a href={job.url} target="_blank" rel="noreferrer">
                  {job.title}
                </a>
                <span className="muted">
                  {' '}
                  {job.employer}, sista dag {job.deadline}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </main>
  );
}
