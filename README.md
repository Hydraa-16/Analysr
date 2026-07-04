# Analysr

Analysr is a healthtech web app. Users upload medical reports or test results
(PDF/image) and get back an AI-generated, dual-language breakdown — plain
English first, correct medical terminology second. The AI detects the report
type and switches specialty context automatically (e.g. CBC → Haematology,
ECG → Cardiology, Thyroid → Endocrinology, LFT → Hepatology, KFT →
Nephrology, MRI/X-Ray → Radiology).

**Analysr is informational only. It is not a substitute for professional
medical advice, diagnosis, or treatment. Always consult a licensed
physician.**

## Live app

https://analysr.vercel.app

## Tech stack

- **Frontend**: React + Vite, PWA-enabled
- **AI**: Google Gemini, called server-side only
- **Auth + Database**: Supabase (email/password + Google OAuth, Row Level
  Security on all tables)
- **Deployment**: Vercel (frontend + serverless function)
- **PDF export**: jsPDF + jsPDF-AutoTable
- **State management**: React Context API + custom hooks

## Features

- Upload a report (PDF/PNG/JPG/JPEG, max 10MB) and get a structured
  analysis: report type, specialty, urgency, per-parameter values with
  normal ranges and status flags, key findings, what the results may
  indicate, and recommended next steps — all in plain language first,
  medical terminology second
- User profile (medical history, medications, allergies, lifestyle) is
  used as context on every analysis for better accuracy
- Analysis history, saved to the database and reloadable by URL
- One-click PDF export of any result
- Installable as a PWA on desktop and mobile

## Getting started locally

```bash
npm install
```

Create a `.env.local` file in the project root (see `.env.example` for the
required keys):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

`GEMINI_API_KEY` is read only inside the serverless function at
`api/analyse.js` and is never exposed to the frontend bundle — do not
prefix it with `VITE_`.

Run the app (via Vercel CLI, so the serverless API route works locally too):

```bash
vercel dev
```

Or, if you only need the frontend without the API route:

```bash
npm run dev
```

## Scripts

| Command           | Description                          |
|--------------------|---------------------------------------|
| `npm run dev`       | Start the Vite dev server             |
| `npm run build`     | Production build                      |
| `npm run preview`   | Preview the production build locally  |
| `npm run lint`      | Run ESLint                            |

## Database schema (Supabase)

**`profiles`** — user_id, full_name, date_of_birth, biological_sex,
blood_group, known_conditions, current_medications, known_allergies,
previous_surgeries, family_history, smoking_status, alcohol_consumption,
activity_level, updated_at

**`analyses`** — id, user_id, created_at, report_type, specialty, urgency,
result_json, original_filename

Row Level Security is enabled on both tables — users can only read/write
their own rows.

## Security & privacy

- The Gemini API key lives only in the Vercel serverless function
  environment, never in frontend code
- Strict file upload validation: PDF/PNG/JPG/JPEG only, max 10MB, max 10
  PDF pages
- Report content and relevant profile data are sent to Google's Gemini API
  for processing; users acknowledge this before first use
- The AI is instructed to use possibility language only ("may indicate",
  "could suggest") and never states a definitive diagnosis

## Disclaimer

Analysr provides AI-generated preliminary medical report analysis. This
tool is informational only. It is NOT a substitute for professional
medical advice, diagnosis, or treatment. Always consult a licensed
physician.
