<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d6ce0674-8a32-4e85-ba2c-fcc4bc5f4227

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy [.env.example](.env.example) to `.env.local` and fill values
3. Run the app:
   `npm run dev`

## Database (PostgreSQL + Prisma)

This app uses Prisma with PostgreSQL.

1. Set `DATABASE_URL` in `.env.local`:
   `postgresql://USER:PASSWORD@HOST:5432/inteltrader_db?schema=public`
2. Generate Prisma client:
   `npm --workspace apps/web-client run db:generate`
3. Apply schema to the database (pick one):
   - Migrations: `npm --workspace apps/web-client run db:migrate`
   - Push (no migrations): `npm --workspace apps/web-client run db:push`

If you want a local Postgres container, a compose file is available at [docker-compose.postgres.yml](infrastructure/docker-compose.postgres.yml).

## Auth (GitHub/Google + Email/Password)

Authentication is implemented with NextAuth:
- OAuth: GitHub and Google (only shown when env vars are configured)
- Credentials: Email/Password (stored hashed in the database)

Set these in `.env.local`:
- `NEXTAUTH_URL` (example: `http://localhost:3000`)
- `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

GitHub OAuth callback URL to configure in your GitHub OAuth App:
- `http://localhost:3000/api/auth/callback/github`
