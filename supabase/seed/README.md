# Database Seed Data

Folder ini berisi SQL untuk seed data (data awal) development/testing.

## Purpose
- Populate initial data untuk development
- Test data untuk QA
- Reference data (chain configs, etc.)

## How to Run
```bash
psql -h localhost -U postgres -d postgres -f seed/dev_data.sql
```
