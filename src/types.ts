export type Track = 'preschool' | 'dev';
export type JobStatus = 'gron' | 'gul';

// same columns as the jobs table in supabase
export interface Job {
  id: number;
  track: Track;
  employer: string;
  title: string;
  status: JobStatus;
  url: string;
  deadline: string | null;
  applied: boolean;
  applied_date: string | null;
  skipped: boolean;
  note: string | null;
  found: string | null;
  skip_reason: string | null;
  created_at: string;
}
