# Laporan Pengujian Pekan 10: Security Testing & OWASP Top 10 Vulnerability Scan

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 9**: Mampu melakukan pemindaian kerentanan keamanan dasar berbasis OWASP Top 10 (SQL Injection, XSS, Broken Auth) menggunakan scanner otomatis (OWASP ZAP / Burp Suite).
- **Konfigurasi Keamanan**: `security/zap/zap_config.yaml`

## 2. Cakupan Pemindaian Keamanan
1. **Spidering & Passive Scan**: Pemetaan seluruh endpoint API publik dan terlindungi.
2. **Active Scan Policy (`API-Minimal-Safe`)**:
   - Deteksi kerentanan SQL Injection pada parameter pencarian produk komoditas.
   - Pengecekan sanitasi header respon (Anti-Clickjacking, X-Content-Type-Options, CORS).
   - Validasi proteksi endpoint login dari serangan brute-force / unauthenticated leak.
3. **Hasil Audit**: Struktur proteksi Laravel Eloquent ORM secara default mencegah SQLi melalui parameterized queries. Status: **PASS (SECURE BASELINE)**.
