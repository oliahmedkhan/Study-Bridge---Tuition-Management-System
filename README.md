# Study Bridge — Tuition Management System

A Next.js project scaffolded from the provided HTML design, with PostgreSQL backend support.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a PostgreSQL database and update `.env.local`.
3. Run the schema script to initialize tables:
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment

Copy `.env.local.example` to `.env.local` and update the values.

## Available routes

- `/` — Landing page
- `/register` — Register as student or teacher
- `/login` — Login
- `/search` — Tutor search page
- `/profile/[id]` — Tutor profile
- `/dashboard/student` — Student dashboard
- `/dashboard/teacher` — Teacher dashboard

## Developer notes & UX fallbacks

- The app uses JWT stored in localStorage under `sbToken` for API auth.
- Most list pages provide empty-state UI when no data exists and show friendly error messages on fetch failures.
- Role enforcement: teachers and students are redirected away from dashboards that don't match their role.

## Local testing tips

- Run syntax checks quickly with Node:

```bash
node --check pages/api/auth/login.js pages/login.js
```

- Use Postman or curl to exercise API endpoints when the database is seeded.

If you need a development script to seed test users or to run integration checks, tell me which fixtures you want and I can add them.
