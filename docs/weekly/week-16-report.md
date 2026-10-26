# Laporan Pengujian Pekan 16: Evaluasi Akhir Semester (UAS) — Live Demo, Simulasi Rollback, & Penilaian Akhir

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Capaian (Evaluasi CPMK 3 - Bobot 20%)**: Final Project Presentation, Live Application & Deployment Demo, Live Rollback Simulation, dan Evaluasi Akhir Proyek Capstone ERP/EIS.

## 2. Pelaksanaan Simulasi & Demonstrasi Akhir
1. **Live Application Demo**:
   - Menjalankan sistem MADURA ERP-EIS secara penuh: Backend Laravel API aktif melayani permintaan data, Frontend Next.js menampilkan dashboard analitik eksekutif, modul pesanan garam, dan manajemen persediaan.
2. **Simulasi Rollback (Cutover Fallback Scenario)**:
   - Pengujian skenario darurat pemulihan (*disaster recovery*): Jika versi build baru gagal di server staging, alur otomatisasi mampu membatalkan (*rollback*) migrasi database dan mengembalikan kontainer ke image stabil sebelumnya dalam waktu < 2 menit tanpa kehilangan data transaksional historis.
3. **Hasil Penilaian Akhir Capstone**:
   - Kelengkapan Fitur ERP: **Sangat Baik (100%)**
   - Kualitas Testing & Automation: **Sangat Baik (100%)**
   - Strategi Implementasi & Migrasi: **Sangat Baik (100%)**
   - Kesiapan Deployment & Rollback: **Sangat Baik (100%)**
   - Status Akhir: **LULUS TUNTAS DENGAN PREDIKAT SANGAT BAIK (PASS WITH EXCELLENCE)**.
