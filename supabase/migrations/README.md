# Database Migrations

Folder ini berisi SQL migrations untuk schema database Supabase.

## Naming Convention
`YYYYMMDDHHMMSS_description.sql`

## How to Create
```bash
supabase migration new migration_name
```

## How to Apply
```bash
supabase db push
```
