@echo off
set PGPASSWORD=Adm1n.c0m
echo Checking stored passwords...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -c "SELECT email, \"passwordHash\" FROM \"User\";"
