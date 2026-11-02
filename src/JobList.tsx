import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Job, Track } from './types';
import { daysLeft, deadlineText, sortJobs, todayIso } from './jobUtils';
import ActivityReport from './ActivityReport';

type View = 'todo' | 'applied' | 'report';

interface Props {
  email: string;
}

const TRACK_LABELS: Record<Track, string> = {
  preschool: 'Förskollärare',
  dev: 'Utvecklare',
};

export default function JobList({ email }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [track, setTrack] = useState<Track>('preschool');
  const [view, setView] = useState<View>('todo');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    setLoading(true);
    const { data, error: loadError } = await supabase.from('jobs').select('*').eq('skipped', false);
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

  function countTodo(t: Track): number {
    return jobs.filter((job: Job) => job.track === t && !job.applied && !job.skipped).length;
  }

  const visible: Job[] = sortJobs(
    jobs.filter(
      (job: Job) => job.track === track && !job.skipped && (view === 'todo' ? !job.applied : job.applied),
    ),
  );

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

      {/* report shows both tracks, so no tabs there */}
      {view !== 'report' && (
        <nav className="tabs">
          {(Object.keys(TRACK_LABELS) as Track[]).map((t: Track) => (
            <button key={t} className={t === track ? 'tab active' : 'tab'} onClick={() => setTrack(t)}>
              {TRACK_LABELS[t]} <span className="count">{countTodo(t)}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="toggle">
        <button className={view === 'todo' ? 'active' : ''} onClick={() => setView('todo')}>
          Att söka
        </button>
        <button className={view === 'applied' ? 'active' : ''} onClick={() => setView('applied')}>
          Sökta
        </button>
        <button className={view === 'report' ? 'active' : ''} onClick={() => setView('report')}>
          Rapport
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Laddar jobb...</p>}
      {!loading && view === 'report' && <ActivityReport jobs={jobs} />}
      {!loading && view !== 'report' && visible.length === 0 && (
        <p className="empty">{view === 'todo' ? 'Inget kvar att söka här. Bra jobbat!' : 'Inga sökta jobb än.'}</p>
      )}

      {view !== 'report' && (
      <ul className="cards">
        {visible.map((job: Job) => {
          const urgent: boolean = job.deadline !== null && daysLeft(job.deadline) <= 3;
          return (
            <li key={job.id} className={`card ${job.status}`}>
              <div className="card-head">
                <span className={`pill ${job.status}`}>{job.status === 'gron' ? 'Grönt' : 'Gult'}</span>
                {view === 'todo' ? (
                  <span className={urgent ? 'deadline urgent' : 'deadline'}>{deadlineText(job.deadline)}</span>
                ) : (
                  <span className="deadline">Sökt {job.applied_date ?? ''}</span>
                )}
              </div>
              <h2>{job.title}</h2>
              <p className="employer">{job.employer}</p>
              {job.note && <p className="note">{job.note}</p>}

              <div className="actions">
                <a className="btn ghost" href={job.url} target="_blank" rel="noreferrer">
                  Öppna annons
                </a>
                {view === 'todo' ? (
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
                ) : (
                  <button
                    className="btn ghost"
                    onClick={() => updateJob(job.id, { applied: false, applied_date: null })}
                  >
                    Ångra
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      )}
    </main>
  );
}
