# PULSE

A dark-neon gym workout web app: real login, an auto-generated weekly split per fitness level, water & habit tracking with streaks, points, badges, and a global leaderboard.

## Stack

- Next.js 16 (App Router, TypeScript), Tailwind CSS v4
- PostgreSQL + Prisma 7 (`@prisma/adapter-pg` driver adapter)
- NextAuth (Auth.js) v5, email + password credentials, JWT sessions
- Recharts for the progress page

## Local setup

1. Start Postgres (either):
   - `docker compose up -d`, or
   - use an existing local Postgres and create a `pulse` database/role.
2. Copy `.env.example` to `.env` and fill in `AUTH_SECRET` (`openssl rand -base64 32`).
3. Install dependencies: `npm install`
4. Run migrations + seed workout/exercise/badge content: `npx prisma migrate dev`
   (seeding runs automatically via `prisma.config.ts`; re-run manually anytime with `npm run db:seed`)
5. Start the dev server: `npm run dev`, then open http://localhost:3000

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`
- `npm run test` — Vitest unit + integration tests (point/streak logic, concurrency idempotency). Uses `.env.test`; point it at a separate database (e.g. `pulse_test`) before running.
- `npm run prisma:migrate` / `npm run prisma:studio` / `npm run db:seed`

## Notable design points

- **Points**: workout finished = 50, water goal hit = 20, streak day = 10 (`lib/points.ts`). Awards are guarded against double-submits via a `pointsAwarded`/`goalHitAwarded` boolean checked in the transaction's `WHERE` clause.
- **Leaderboard**: denormalized `totalPoints`/`weeklyPoints` on `User` for fast ranked reads, backed by an immutable `PointsLedger` for audit/history. Weekly points roll over lazily based on an ISO-week anchor.
- **Streaks**: a "qualifying day" is any day with a finished workout, a hit water goal, or all three habit checkboxes — see `lib/streaks.ts`.
- **Workout plans**: fixed weekly templates per fitness level (`prisma/seed-data/workoutTemplates.ts`) with a swappable exercise pool per muscle-group/day-type (`prisma/seed-data/exercises.ts`).
- **Auth**: Next.js 16 renamed `middleware.ts` to `proxy.ts` — see `proxy.ts`, which re-exports the NextAuth `auth` guard.
