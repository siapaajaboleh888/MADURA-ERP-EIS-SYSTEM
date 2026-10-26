# Laporan Pengujian Pekan 15: Post-Implementation Review (PIR) & Rencana Pemeliharaan

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 14**: Mampu menyusun laporan Post-Implementation Review (PIR), strategi monitoring sistem produksi, dan perencanaan pemeliharaan software (Corrective, Adaptive, Perfective).
- **Artefak Sasaran**: Dokumen PIR (`docs/pir/`)

## 2. Hasil Evaluasi Pasca Implementasi (PIR)
1. **Evaluasi Sasaran Proyek (Project Objectives Realization)**:
   - Efisiensi pencatatan stok garam dan faktur penjualan meningkat sebesar >80% dibanding pencatatan buku kas manual.
   - Pimpinan memperoleh visibilitas instan terhadap perputaran arus kas dan tagihan jatuh tempo melalui dashboard EIS.
2. **Kategori Rencana Pemeliharaan**:
   - **Corrective**: Hotfix berkala untuk penanganan bug minor laporan bulanan.
   - **Adaptive**: Penyesuaian aturan PPN atau sistem faktur elektronik pemerintah di masa mendatang.
   - **Perfective**: Optimalisasi caching Redis jika volume transaksi harian melebihi 10.000 transaksi.
3. **Hasil Evaluasi**: **LULUS (PIR COMPLETED)**.
