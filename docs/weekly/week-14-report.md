# Laporan Pengujian Pekan 14: Otomatisasi CI/CD Pipeline & Deployment Staging (Docker/VPS)

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 13**: Mampu mengonfigurasi otomatisasi CI/CD Deployment Pipeline (GitHub Actions) dan kontainerisasi aplikasi (Docker & Docker Compose) ke server staging / VPS.
- **Artefak Konfigurasi**: `.github/workflows/ci.yml`, `docker-compose.yml`, `deployment/nginx/default.conf`.

## 2. Hasil Verifikasi Deployment Pipeline
1. **GitHub Actions Workflow**:
   - Job `backend-tests`: Menguji kompilasi dependensi Composer, eksekusi migrasi skema database SQLite, dan seluruh rangkaian unit/feature test otomatis pada runner Ubuntu.
   - Job `frontend-build`: Menguji instalasi npm dependencies dan proses kompilasi Next.js 16 production build.
2. **Kontainerisasi Docker Compose**:
   - Multi-container architecture: Database service, Backend Laravel PHP-FPM, Frontend Next.js, dan Nginx Reverse Proxy (Port 80).
3. **Hasil Evaluasi**: **PASS (AUTOMATED & READY TO DEPLOY)**.
