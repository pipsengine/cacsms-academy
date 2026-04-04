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
   `postgresql://USER:PASSWORD@HOST:5432/cacsms_academy_db?schema=public`
2. Generate Prisma client:
   `npm --workspace apps/web-client run db:generate`
3. Apply schema to the database (pick one):
   - Migrations: `npm --workspace apps/web-client run db:migrate`
   - Push (no migrations): `npm --workspace apps/web-client run db:push`

If you want a local Postgres container, a compose file is available at [docker-compose.postgres.yml](infrastructure/docker-compose.postgres.yml). It maps the container's 5432 to your host port 5433 by default.

## Auth (Google/Microsoft + Email/Password)

Authentication is implemented with NextAuth:
- OAuth: Google and Microsoft (only shown when env vars are configured)
- Credentials: Email/Password (stored hashed in the database)

## Development notes

- Usage and analytics now rely on the Prisma-backed `UsageLog`/`PlatformSetting` tables, so the admin UI and `/api/usage/check` route enforce limits consistently and persist quota history.
- Market-data health is surfaced in the dashboard header, and the AI assistant streams cached responses while remembering the user’s plan.
- Pricing is catalog-driven (`<code>@/lib/pricing/catalog</code>`) and the checkout flow supports Stripe webhooks so subscriptions stay synchronized.
- Run `npm --workspace apps/web-client run lint` then `npm --workspace apps/web-client run test` to vet the core workspace before deploying.

Set these in `.env.local`:
- `NEXTAUTH_URL` (example: `http://localhost:3000`)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID` (optional, defaults to `common`; for single-tenant use your tenant ID)
- `NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS` (optional, defaults to `300000`)
- `NEXT_PUBLIC_INACTIVITY_WARNING_WINDOW_MS` (optional, defaults to `30000`)

OAuth callback URLs:
- Google: `http://localhost:3000/api/auth/callback/google`
- Microsoft: `http://localhost:3000/api/auth/callback/azure-ad`
