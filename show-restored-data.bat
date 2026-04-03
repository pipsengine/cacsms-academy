@echo off
set PGPASSWORD=Adm1n.c0m
echo.
echo === RESTORED USERS ===
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -c "SELECT id, email, name, role, country, \"createdAt\" FROM \"User\" ORDER BY \"createdAt\";"

echo.
echo === TOP 5 SUBSCRIPTIONS ===
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -c "SELECT id, \"userId\", \"planType\", status, \"startDate\", \"expiryDate\" FROM \"Subscription\" ORDER BY \"createdAt\" DESC LIMIT 5;"

echo.
echo === USAGE LOG SAMPLE ===
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U cacsms -d db_cacsms -h localhost -c "SELECT id, \"userId\", \"featureName\", \"usageType\", timestamp FROM \"UsageLog\" ORDER BY timestamp DESC LIMIT 5;"
