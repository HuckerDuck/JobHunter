# JobHunter

A small web app I use every day in my own job search. It keeps track of the jobs I find, which ones I have applied to, and drafts of my cover letters. I built it because a spreadsheet got messy fast when I was applying for two kinds of jobs at the same time.

Live: https://jobhunter-se.vercel.app (login only, sign ups are closed)

## Features

- **Two tracks**: one tab for developer jobs and one for preschool teacher jobs, each with a count of what is left to apply to
- **Green and yellow jobs**: green means a good match, yellow means worth a look later
- **Deadlines**: cards are sorted by last day to apply, and jobs close to the deadline are marked in red
- **New badge**: jobs found today or yesterday get a "Ny" badge
- **Letter drafts**: a cover letter draft on each card with a copy button. When I mark a job as applied, the draft is saved as the sent letter so I can read it again before an interview
- **Applied tab with monthly report**: shows what I applied to per month, handy when I need to report my activity
- **Expired jobs**: jobs past the deadline that I never applied to are moved to their own folded list
- **Skill gap**: on the developer tab it counts which technologies the ads ask for and shows which ones I already know and which I am missing
- **Works on the phone**: has an icon and a web manifest, so it can be added to the home screen

## Tech

- React 19 + TypeScript (strict) + Vite
- Supabase (Postgres, Auth, Row Level Security)
- Deployed on Vercel

## How it works

```
Night search (scheduled job) ──> Supabase: jobs, profile ──> React app (Vercel)
                                         ▲                        │
                                         └──── update applied ────┘
```

- A scheduled search runs every night outside this repo. It finds new ads, rates them green or yellow and inserts them into the `jobs` table, together with a letter draft and the skills the ad asks for.
- The app reads the jobs and lets me mark them as applied or skipped. Changes show right away and roll back if the database says no.
- My list of known skills is a comma list in the `profile` table, so I can update it without a new deploy.

### Database

| Table | What it holds |
| --- | --- |
| `jobs` | track, employer, title, status, url, deadline, applied, applied_date, skipped, skip_reason, note, letter_draft, sent_letter, skills (`text[]`) |
| `profile` | kind (cv, letter, dev_cv, dev_letter, dev_skills) and content |

### Security

- Row Level Security is on for both tables. Only my user id can read and update rows
- Sign ups are turned off in Supabase Auth
- The frontend only uses the publishable key, no secrets are in the code

## Run it locally

You need Node 20+ and your own Supabase project with the tables above.

1. Clone the repo and install

   ```bash
   git clone https://github.com/HuckerDuck/JobHunter.git
   cd JobHunter
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Supabase URL and publishable key

3. Start the dev server

   ```bash
   npm run dev
   ```

4. Open the address Vite prints in the terminal and log in with a user you created in Supabase

## Project structure

```
src/
  App.tsx            login or job list depending on session
  Login.tsx          email and password login
  JobList.tsx        tabs, job cards and actions
  ActivityReport.tsx monthly report of applied jobs
  SkillGap.tsx       skill gap box on the developer tab
  LetterBox.tsx      folded letter with copy button
  jobUtils.ts        dates, deadlines and sorting
  supabase.ts        Supabase client from env variables
  types.ts           Job type, same columns as the table
```

## What I want to add next

- A reminder to follow up on jobs I applied to a week ago
- Edit the letter draft directly in the app
- Tests with Vitest and a GitHub Actions build check
