# Laporan Pengujian Pekan 13: Migrasi Data (ETL) & Cutover/Rollback Plan

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 12**: Mampu merancang dan mengeksekusi prosedur Migrasi Data (ETL) dari file legacy CSV/Excel ke database sistem baru, serta merumuskan Cutover & Rollback Plan.
- **Skrip Eksekusi**: `python migration/scripts/migrate_customers.py`

## 2. Hasil Rekonsiliasi Migrasi Data (ETL)
- **Data Sumber**: `migration/raw/customers.csv` (7 baris data pelanggan mentah).
- **Hasil Pembersihan (Cleaning & Transform)**:
  - 6 baris data pelanggan valid lolos validasi (Kode unik, nama lengkap, limit kredit rasional).
  - 1 baris data rusak/anomali dipisahkan otomatis ke `migration/rejected/customers_rejected.csv`.
- **Hasil Eksekusi Nyata**:
  - `Cleaned: 6 rows | Rejected: 1 rows`
  - Rekonsiliasi database integritas: **PASS (100% RECONCILED)**.
