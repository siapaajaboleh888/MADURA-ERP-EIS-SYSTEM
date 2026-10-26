# Laporan Pengujian Pekan 06: API Testing & Integration Testing

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 6**: Mampu mengeksekusi API Testing dan pengujian integrasi antarmuka REST API menggunakan koleksi terstandar (Postman / automated runner).
- **Modul Terkait**: REST API Endpoint Manajemen Stok, Komoditas, Otentikasi, dan Konfigurasi Lab (`api/auth/*`, `api/health`, `api/products`, `api/qa/*`).
- **Koleksi Artefak**: `api-tests/postman/madura_erp.postman_collection.json` & `madura_erp.postman_environment.json`.

## 2. Parameter Validasi API
- Kesesuaian kode status HTTP (`200 OK`, `401 Unauthorized`, `422 Unprocessable Entity`).
- Struktur payload respon envelope standar:
  ```json
  {
    "status": 200,
    "success": true,
    "message": "...",
    "data": { ... }
  }
  ```
- Penyimpanan dan penerusan token `Bearer {{token}}` pada seluruh endpoint terproteksi.

## 3. Hasil Eksekusi Pengujian Aktual
| Endpoint API yang Diuji | Metode & Kasus Uji | Status Aktual | Hasil Validasi |
| :--- | :--- | :--- | :--- |
| `GET /api/health` | `test_health_check_returns_up_status` | **PASS** | HTTP 200, status database connection UP. |
| `POST /api/auth/login` | `test_login_returns_token_and_standard_envelope` | **PASS** | HTTP 200, mengembalikan Bearer token dan data profil user. |
| `POST /api/auth/login` (Invalid) | `test_login_with_invalid_credentials_returns_structured_error` | **PASS** | HTTP 401, envelope error seragam. |
| `GET /api/qa/course-config` | `test_qa_course_config_accessible` | **PASS** | HTTP 200, modul toggle defect lab terbaca. |
| `GET /api/products` | `test_products_accessible_with_token` | **PASS** | HTTP 200, katalog produk berhasil dipanggil dengan token. |

## 4. Temuan Kekurangan / Defect & Rekomendasi
- **Temuan**: Seluruh respon API konsisten dengan envelope standar arsitektur MADURA ERP.
- **Rekomendasi**: Tambahkan skrip otomatisasi CLI Newman pada pipeline CI/CD GitHub Actions agar koleksi Postman di-run secara otomatis di setiap pull request.
