@echo off
set PGPASSWORD=Adm1n.c0m
echo User emails in database:
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -t -c "SELECT email FROM \"User\" ORDER BY email;"
