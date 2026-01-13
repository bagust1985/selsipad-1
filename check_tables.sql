-- Check what tables exist in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check migration history
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
