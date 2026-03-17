# Database setup & migrations

This repository uses **Prisma** as the ORM on top of a PostgreSQL database. The schema is defined in `apps/web-client/prisma/schema.prisma` and the initial migration lives in `apps/web-client/prisma/migrations/0001_init`. Every change to the schema should be accompanied by a new migration so hosting platforms can reapply it deterministically.

## Prerequisites

1. PostgreSQL instance (local, cloud, or cPanel-built) with connectivity from the deployment host.
2. Environment variables:
   - `DATABASE_URL` – full Postgres connection string (`DATABASE_URL=postgresql://cacsms:@dm1n.c0m@localhost:5433/inteltrader_db?schema=public`).
   - `NEXTAUTH_URL` and `NEXTAUTH_SECRET` (already documented in `.env.example`).
3. Node.js 20+ and npm (or the package manager of choice) available inside the hosting environment.

## Local development workflow

1. Install dependencies: `npm install` from the `apps/web-client` workspace.
2. Generate the Prisma client: `npm run db:generate`.
3. Apply migrations to your local database: `npm run db:migrate`. This will run the existing `0001_init` migration and create a `prisma/migrations` entry automatically.
4. Seed any baseline data (platform settings, usage limits): `npm run db:seed`.
5. If you need to view the database, run `npm run db:studio`.

For quick schema changes without needing a full migration, `npm run db:push` writes the current schema directly to the database but should **not** be used in production; prefer `db:migrate`/`db:migrate:deploy` there.

## Production deployments (hosting services, cPanel, etc.)

The migration files live inside the repository. To ensure migrations are applied consistently on the hosting provider:

1. Deploy the updated code/artifact to the host.
2. In your hosting control panel (cPanel Terminal, Cloud Shell, etc.), set the `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET` variables to match your Postgres instance.
3. Install dependencies (if not bundled) and run:
   ```bash
   npm --workspace apps/web-client install
   npm --workspace apps/web-client run db:migrate:deploy
   npm --workspace apps/web-client run db:seed
   ```
   `db:migrate:deploy` will only apply pending migrations in a production-safe fashion.
4. If you deploy via CI/CD (GitHub Actions, GitLab CI, etc.), include these commands in the release pipeline prior to starting the app server.

If cPanel/Plesk does not expose a terminal, you can also create a deployment hook that runs the commands inside a `npm --workspace apps/web-client -- run ...` script.

## Troubleshooting

- To inspect which migrations have run: `npx prisma migrate status --schema=apps/web-client/prisma/schema.prisma`.
- To reset the database locally: `npx prisma migrate reset`.
- To rerun a migration that failed: `npx prisma migrate resolve --applied 0001_init`.

Because migration files are version controlled, hosting platforms always see the same SQL, which keeps deployments repeatable and auditable.

## Verifying your local PostgreSQL connection

Before running `db:migrate` or `db:migrate:deploy`, ensure the local PostgreSQL server is up and listening on port `5433` using the shared credentials:

1. Install the PostgreSQL CLI (`psql`) or start a GUI like pgAdmin/TablePlus, and then connect with:

   ```bash
   psql postgresql://cacsms:@dm1n.c0m@localhost:5433/inteltrader_db -c '\dt'
   ```

2. If the command lists zero tables, the server is reachable and ready for Prisma; proceed with the migration and seed steps below. If you still see a `P1001` error, either start PostgreSQL on port `5433` or update `DATABASE_URL` to match the exposed port.

3. If you prefer to keep Postgres on `5432`, change the connection string in `.env.local`/`.env.example` to `localhost:5432` and rerun `db:migrate:deploy`.
