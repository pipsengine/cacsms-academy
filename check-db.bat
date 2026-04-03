@echo off
set PGPASSWORD=Adm1n.c0m
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -t -c "SELECT '=== DATABASE TABLES ===' ; SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"

echo.
echo === USER COUNT ===
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -t -c "SELECT COUNT(*) as user_count FROM \"User\";"

echo.
echo === USERS ===
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -c "SELECT id, email, name, role, \"createdAt\" FROM \"User\" LIMIT 20;"

echo.
echo === RECORD COUNTS ===
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -t -c "SELECT 'Accounts: ' || COUNT(*) FROM \"Account\" UNION ALL SELECT 'Sessions: ' || COUNT(*) FROM \"Session\" UNION ALL SELECT 'Subscriptions: ' || COUNT(*) FROM \"Subscription\" UNION ALL SELECT 'Usage Logs: ' || COUNT(*) FROM \"UsageLog\" UNION ALL SELECT 'Course Enrollments: ' || COUNT(*) FROM \"CourseEnrollment\";"
