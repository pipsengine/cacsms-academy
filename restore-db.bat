@echo off
set PGPASSWORD=Adm1n.c0m
echo Restoring database backup...
"C:\Program Files\PostgreSQL\18\bin\pg_restore.exe" -U cacsms -d db_cacsms -h localhost --clean --if-exists inteltrader_db_backup_2026-03-18_160000.dump
echo.
echo Restore complete. Checking record counts...
set PGPASSWORD=Adm1n.c0m
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -t -c "SELECT 'Users: ' || COUNT(*) FROM \"User\" UNION ALL SELECT 'Accounts: ' || COUNT(*) FROM \"Account\" UNION ALL SELECT 'Subscriptions: ' || COUNT(*) FROM \"Subscription\" UNION ALL SELECT 'Usage Logs: ' || COUNT(*) FROM \"UsageLog\";"
