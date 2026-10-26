# Laporan Pengujian Pekan 01: Test Plan & Requirements Engineering (SDLC / V-Model)

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 1**: Mampu menyusun Test Plan, memetakan kebutuhan fungsional/non-fungsional ke artefak pengujian (V-Model), dan merancang arsitektur SQA.
- **Modul Terkait**: Arsitektur Inti (`ARCHITECTURE.md`), Spesifikasi Requirement (`qa_requirements`), API Health Monitoring (`/api/health`).

## 2. Metodologi Pengujian
- **Verifikasi Statis**: Analisis kelengkapan matriks keterlacakan kebutuhan (RTM) dan konsistensi struktur envelope API RESTful (`{ success, message, data/errors }`).
- **Verifikasi Skema & Relasi Database**: Pemeriksaan migrasi tabel master dan transaksional pada database SQLite lokal.
- **Validasi Dynamic Baseline**: Eksekusi uji endpoint health-check dan struktur otentikasi menggunakan test suite otomatis PHPUnit.

## 3. Hasil Eksekusi Pengujian Aktual
| Komponen / Test Case | Perintah / Metode | Status Aktual | Keterangan |
| :--- | :--- | :--- | :--- |
| Database Migration Integrity | `php artisan migrate --force` | **PASS** | Semua tabel skema migrasi telah terpasang tanpa error (`Nothing to migrate`). |
| API Standard Envelope Verification | `Tests\Feature\HealthAndApiWorkflowTest::test_health_check_returns_up_status` | **PASS** | Endpoint merespons dengan envelope standar `{ status: 200, success: true }`. |
| Auth Requirements Envelope | `Tests\Feature\HealthAndApiWorkflowTest::test_login_returns_token_and_standard_envelope` | **PASS** | Token Bearer dan payload pengguna terverifikasi sesuai spesifikasi. |
| Negative Auth Flow Requirement | `Tests\Feature\HealthAndApiWorkflowTest::test_login_with_invalid_credentials_returns_structured_error` | **PASS** | Penolakan kredensial salah menghasilkan respon JSON terstruktur (HTTP 401). |

## 4. Temuan Kekurangan / Defect & Rekomendasi
- **Temuan**: Perintah `php artisan serve` pada lingkungan Windows terkendala port binding otomatis jika host tidak disetel eksplisit atau jika loopback socket mengalami proteksi firewall lokal.
- **Rekomendasi**: Jalankan server lokal menggunakan `php -S localhost:8000 -t public public/index.php` atau setel adapter IP eksplisit.
