# Laporan Pengujian Pekan 02: Boundary Value Analysis & Equivalence Partitioning

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 2**: Mampu merancang test case menggunakan teknik Equivalence Partitioning (EP) dan Boundary Value Analysis (BVA) pada logika kalkulasi bisnis.
- **Modul Terkait**: Kalkulator Transaksi Penjualan (`SalesOrderCalculator`), Validasi Diskon Pelanggan (`Customer`, `DiscountService`).

## 2. Partisi & Nilai Batas yang Diuji (BVA & EP)
- **Partisi Kuantitas Produk (Quantity)**:
  - Partisi Valid: `[1, ∞)` -> Diuji dengan nilai batas `1` dan nilai representatif positif.
  - Partisi Tidak Valid: `(-∞, 0]` -> Diuji dengan nilai batas `0` (rejection) dan angka negatif `-5`.
- **Partisi Diskon Pelanggan (Discount Rate)**:
  - Partisi Valid: `[0, customer_max_discount]` -> Diterima dalam kalkulasi.
  - Partisi Tidak Valid: `> customer_max_discount` -> Ditolak dengan `InvalidArgumentException`.

## 3. Hasil Eksekusi Pengujian Aktual
| Nama Kasus Uji | Metode Pengujian | Status Aktual | Durasi | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| `test_quantity_must_be_greater_than_zero` | PHPUnit Unit Test | **PASS** | 0.27s | Batas kuantitas 0 ditolak secara tepat. |
| `test_negative_quantity_is_rejected` | PHPUnit Unit Test | **PASS** | 0.02s | Input partisi negatif (-5) ditolak dengan exception. |
| `test_valid_quantity_calculates_correctly` | PHPUnit Unit Test | **PASS** | 0.02s | Kuantitas valid dikalikan harga unit menghasilkan total yang presisi. |
| `test_discount_cannot_exceed_customer_max_rate` | PHPUnit Unit Test | **PASS** | 0.02s | Penolakan partisi diskon yang melebihi hak diskon pelanggan. |

## 4. Temuan Kekurangan / Defect & Rekomendasi
- **Temuan**: Logika kalkulasi bisnis sudah aman dan terproteksi di layer Service (`SalesOrderCalculator`).
- **Rekomendasi**: Validasi input Form Request pada controller API (`StoreSalesOrderRequest`) harus selalu sinkron dengan validasi kalkulator agar pesan kegagalan ramah bagi pengguna frontend.
