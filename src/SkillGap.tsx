import { Job } from './types';

interface Props {
  // all dev jobs, also applied and skipped, so the numbers show the market
  jobs: Job[];
  mySkills: string[];
}

interface SkillCount {
  name: string;
  count: number;
  known: boolean;
}

const MAX_ROWS: number = 12;

export default function SkillGap({ jobs, mySkills }: Props) {
  // jobs without skills would make the numbers look lower than they are
  const withSkills: Job[] = jobs.filter((job: Job) => job.skills.length > 0);
  const known: Set<string> = new Set(mySkills.map((s: string) => s.toLowerCase()));

  const counts: Map<string, number> = new Map();
  for (const job of withSkills) {
    for (const skill of job.skills) {
      counts.set(skill, (counts.get(skill) ?? 0) + 1);
    }
  }

  const rows: SkillCount[] = [...counts.entries()]
    .map(([name, count]: [string, number]) => ({ name, count, known: known.has(name.toLowerCase()) }))
    .sort((a: SkillCount, b: SkillCount) => b.count - a.count || a.name.localeCompare(b.name));

  const missing: SkillCount[] = rows.filter((row: SkillCount) => !row.known);

  if (withSkills.length === 0) return null;

  return (
    <section className="report">
      <details className="note-fold">
        <summary>Kompetensgap ({withSkills.length} annonser)</summary>
        {missing.length > 0 && (
          <p className="small">
            Mest efterfrågat som du saknar:{' '}
            <strong>
              {missing
                .slice(0, 3)
                .map((row: SkillCount) => `${row.name} (${row.count})`)
                .join(', ')}
            </strong>
          </p>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
          {rows.slice(0, MAX_ROWS).map((row: SkillCount) => (
            <li
              key={row.name}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.25rem 0' }}
            >
              <span>
                {row.name} <span className="muted small">{row.count} av {withSkills.length}</span>
              </span>
              <span className={row.known ? 'pill gron' : 'pill gul'}>{row.known ? 'Kan' : 'Saknas'}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
