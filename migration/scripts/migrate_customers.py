"""
Madura ERP / EIS - Week 13 Data Migration & ETL Pipeline
Author: Data Engineering & QA Team
Extracts raw CSV files, performs data cleaning and validation, separates rejected rows,
and loads reconciled records into the database.
"""

import os
import pandas as pd
import sqlite3
from datetime import datetime

RAW_DIR = "migration/raw"
CLEANED_DIR = "migration/cleaned"
REJECTED_DIR = "migration/rejected"
DB_PATH = "backend/database/database.sqlite"

def run_customer_migration():
    print("[ETL] Starting Customer Migration Pipeline...")
    raw_file = os.path.join(RAW_DIR, "customers.csv")
    if not os.path.exists(raw_file):
        print(f"[ETL Error] Raw file not found: {raw_file}")
        return

    df = pd.read_csv(raw_file)
    print(f"[ETL Extract] Read {len(df)} records from {raw_file}")

    cleaned_rows = []
    rejected_rows = []
    seen_codes = set()

    for idx, row in df.iterrows():
        reasons = []
        code = str(row.get('code', '')).strip()
        name = str(row.get('name', '')).strip()
        
        # Validation 1: Required Code and Name
        if not code or code == 'nan' or not name or name == 'nan':
            reasons.append("Missing required 'code' or 'name'")

        # Validation 2: Duplicate Business Identifiers
        if code in seen_codes:
            reasons.append("Duplicate customer code")
        else:
            seen_codes.add(code)

        # Validation 3: Credit limit numeric check
        try:
            credit = float(row.get('credit_limit', 0))
            if credit < 0:
                reasons.append("Credit limit cannot be negative")
        except:
            credit = 0.0

        try:
            disc = float(row.get('max_discount_rate', 0))
            if disc < 0 or disc > 100:
                reasons.append("Discount rate out of bounds [0-100]")
        except:
            disc = 0.0

        if reasons:
            rej = row.to_dict()
            rej['rejection_reason'] = "; ".join(reasons)
            rejected_rows.append(rej)
        else:
            clean = {
                'code': code,
                'name': name,
                'email': str(row.get('email', '')),
                'phone': str(row.get('phone', '')),
                'address': str(row.get('address', '')),
                'credit_limit': credit,
                'max_discount_rate': disc,
                'is_active': 1,
                'created_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'updated_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            }
            cleaned_rows.append(clean)

    # Save Cleaned & Rejected CSVs
    cleaned_df = pd.DataFrame(cleaned_rows)
    rejected_df = pd.DataFrame(rejected_rows)

    os.makedirs(CLEANED_DIR, exist_ok=True)
    os.makedirs(REJECTED_DIR, exist_ok=True)

    cleaned_df.to_csv(os.path.join(CLEANED_DIR, "customers_cleaned.csv"), index=False)
    rejected_df.to_csv(os.path.join(REJECTED_DIR, "customers_rejected.csv"), index=False)

    print(f"[ETL Transform] Cleaned: {len(cleaned_df)} rows | Rejected: {len(rejected_df)} rows")

    # Load into SQLite database
    if os.path.exists(DB_PATH) and len(cleaned_rows) > 0:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        inserted_count = 0
        for item in cleaned_rows:
            try:
                cursor.execute("""
                    INSERT OR IGNORE INTO customers (code, name, email, phone, address, credit_limit, max_discount_rate, is_active, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (item['code'], item['name'], item['email'], item['phone'], item['address'], item['credit_limit'], item['max_discount_rate'], item['is_active'], item['created_at'], item['updated_at']))
                inserted_count += cursor.rowcount
            except Exception as e:
                print(f"[ETL DB Error] {e}")
        conn.commit()
        conn.close()
        print(f"[ETL Load] Successfully inserted {inserted_count} reconciled customer records into database.")

if __name__ == "__main__":
    run_customer_migration()
