import { PrismaClient } from '@prisma/client';

process.env.DATABASE_URL = 'postgresql://cacsms:Adm1n.c0m@localhost:5432/db_cacsms?schema=public';
const prisma = new PrismaClient();

try {
  const tables = await prisma.$queryRawUnsafe(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);

  console.log('TABLES:', tables.map(t => t.table_name).join(', '));

  const candidates = [];
  for (const t of tables) {
    const cols = await prisma.$queryRawUnsafe(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema='public' AND table_name='${t.table_name}'
    `);
    const colNames = cols.map(c => c.column_name);
    if (colNames.includes('email')) {
      candidates.push({ table: t.table_name, cols: colNames });
    }
  }

  console.log('EMAIL_TABLES:', JSON.stringify(candidates, null, 2));

  for (const c of candidates) {
    try {
      const rows = await prisma.$queryRawUnsafe(`SELECT * FROM \"${c.table}\" WHERE email = 'admin@cacsms.com' LIMIT 5`);
      if (rows.length) {
        console.log('FOUND_IN:', c.table);
        console.log(JSON.stringify(rows, null, 2));
      }
    } catch (e) {
      // skip incompatible quoting
    }
  }
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
