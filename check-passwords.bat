@echo off
set PGPASSWORD=Adm1n.c0m
echo Checking user passwords...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -c "SELECT email, CASE WHEN \"passwordHash\" IS NULL THEN 'NO HASH' ELSE 'HAS HASH' END as status FROM \"User\";"
