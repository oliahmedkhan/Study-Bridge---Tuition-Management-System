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
