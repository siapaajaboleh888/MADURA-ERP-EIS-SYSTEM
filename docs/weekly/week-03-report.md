# Laporan Pengujian Pekan 03: Praktik Lab Test Case Transaksi Komoditas Madura

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 3**: Mampu merancang dan mengeksekusi test case terstruktur pada input data transaksi komoditas Madura (Garam / Batik / Tembakau).
- **Modul Terkait**: Katalog Komoditas (`Product`), Validasi Keranjang Transaksi (`SalesOrder`, `SalesOrderItem`).

## 2. Cakupan Skenario Transaksi
- **Skenario 1 (Kelengkapan Item)**: Transaksi pemesanan komoditas wajib memiliki minimal 1 baris item produk. Jika array kosong, sistem harus menggugurkan pembuatan order.
- **Skenario 2 (Aksesibilitas Katalog Komoditas)**: Pengambilan daftar produk garam (misal: Garam Industri, Garam Konsumsi Beryodium) harus mengembalikan HTTP 200 dan daftar item yang terotentikasi.

## 3. Hasil Eksekusi Pengujian Aktual
| Nama Kasus Uji | Objek yang Diuji | Status Aktual | Keterangan |
| :--- | :--- | :--- | :--- |
| `test_order_requires_at_least_one_item` | `SalesOrderCalculator` / Order Service | **PASS** | Exception terlempar saat order dibuat dengan 0 item. |
| `test_products_accessible_with_token` | API Endpoint `/api/products` | **PASS** | Katalog komoditas Madura berhasil dimuat lengkap dengan token autentikasi. |

## 4. Temuan Kekurangan / Defect & Rekomendasi
- **Temuan**: Data seed katalog garam telah termuat dengan baik di database master.
- **Rekomendasi**: Perlu penambahan unit test otomatis khusus untuk grading kualitas tembakau dan variasi motif batik pada modul transaksi lanjutan.
