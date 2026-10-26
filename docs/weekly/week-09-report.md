# Laporan Pengujian Pekan 09: Performance & Load Testing (k6 / Stress Test)

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 8**: Mampu merancang dan mengeksekusi Performance & Load Testing aplikasi web menggunakan alat uji beban (k6 / Apache JMeter).
- **Skrip Pengujian**: `performance/k6/load_test.js`

## 2. Parameter Beban & Ambang Batas (Thresholds)
- **Simulasi Beban**: Ramp-up hingga 20-50 virtual users simultan pada portal EIS dan API transaksi garam.
- **Ambang Batas (Thresholds)**:
  - Durasi respon $p(95) < 500\text{ ms}$ (95% respon harus di bawah 500ms).
  - Tingkat kegagalan (*error rate*) $< 1\%$.
- **Hasil Verifikasi Sintaks & Pipeline**:
  - Konfigurasi k6 mencakup skenario health check, otentikasi Bearer token, query katalog master garam, dan analitik EIS. Status: **PASS**.
