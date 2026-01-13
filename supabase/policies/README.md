# Row Level Security Policies

Folder ini berisi SQL untuk RLS policies Supabase.

## Purpose
- Mengatur akses data berdasarkan user authentication
- Memastikan users hanya bisa akses data mereka sendiri
- Admin policies untuk dashboard

## Example
```sql
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);
```
