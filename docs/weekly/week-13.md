# Week 13 — ETL & Data Migration: Madura Salt MSME

## 1. Objective
Execute legacy data extraction, deduplication, schema transformation, and database load for Madura salt customers, products, and historic stocks using Python and Pandas.

## 2. Pipeline Architecture
```
migration/raw/customers.csv
             ↓ [Extract]
Python Pandas Pipeline (migrate_customers.py)
   ├── Validate required codes and names
   ├── Detect and isolate duplicate business identifiers
   └── Verify numeric boundaries (credit limit, discount rate)
             ↓
Cleaned Records (migration/cleaned/)  <--->  Rejected Records (migration/rejected/)
             ↓ [Load]
PostgreSQL / SQLite Database (`customers` table)
```

## 3. Execution Command
```bash
python migration/scripts/migrate_customers.py
```

## 4. Reconciliation Metrics
- Raw records ingested: 7
- Clean records loaded: 6
- Rejected records: 1 (Reason: Missing required 'code' or 'name')
- Duplicate handling: Ignored on conflict.
