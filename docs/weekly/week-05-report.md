# Laporan Pengujian Pekan 05: Cyclomatic Complexity & White-Box Testing

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 5**: Mampu menghitung Cyclomatic Complexity, menyusun Control Flow Graph (CFG), dan mengeksekusi White-Box Testing (Branch Coverage).
- **Modul Terkait**: Layanan Diskon (`DiscountService`), Algoritma Kalkulasi Nilai Tambah (`SalesOrderCalculator`).

## 2. Analisis Control Flow Graph (CFG) & Cyclomatic Complexity
- **Fungsi Sasaran**: `DiscountService::calculateDiscount`
- **Rumus McCabe**: $V(G) = P + 1$ (di mana $P$ adalah jumlah titik keputusan / predicate node)
- **Titik Predikat**:
  1. Validasi `subtotal < 0`
  2. Pengecekan toggle defect lab `isDefectActive`
  3. Validasi range persentase `rate < 0 || rate > 100`
  4. Pengecekan batas maksimum hak diskon pelanggan `rate > customer_max`
- **Hasil Kalkulasi Kompleksitas**: $V(G) = 4 + 1 = 5$
- **Kebutuhan Basis Path**: Diperlukan minimal 5 jalur independen untuk mencapai 100% Branch Coverage.

## 3. Hasil Eksekusi Pengujian Aktual
| Jalur Independen / Test Case | Fokus Jalur Logika | Status Aktual |
| :--- | :--- | :--- |
| `test_negative_quantity_is_rejected` | Menguji branch lempar exception saat subtotal/kuantitas < 0 | **PASS** |
| `test_discount_cannot_exceed_customer_max_rate` | Menguji branch lempar exception saat rate > batas diskon pelanggan | **PASS** |
| `test_valid_quantity_calculates_correctly` | Menguji branch jalur utama normal (happy path execution) | **PASS** |

## 4. Temuan Kekurangan / Defect & Rekomendasi
- **Temuan**: Algoritma perhitungan diskon dan kalkulasi order memiliki struktur branching yang bersih dan terisolasi dengan baik dari interaksi database langsung (mudah di-mock).
- **Rekomendasi**: Pertahankan pemisahan logika murni ke domain services untuk meminimalkan kompleksitas siklomatik di controller.
