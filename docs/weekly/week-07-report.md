# Laporan Pengujian Pekan 07: Test Automation E2E & Defect Management System

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 7**: Mampu menyusun skrip Test Automation (Playwright / Cypress) untuk skenario End-to-End (E2E) dan mengelola pencatatan bug dalam Defect Management Log.
- **Modul Terkait**: Skrip E2E Playwright (`automation/playwright/e2e.spec.ts`), Defect Registry (`docs/defect-log.md`).

## 2. Struktur Skrip E2E Playwright
Skrip otomatisasi mencakup 6 skenario kritis pengguna:
1. `01. User Authentication and Role Sign In`: Form login admin & proteksi rute dashboard.
2. `02. Executive Dashboard Metrics Inspection`: Validasi elemen metriks EIS (Revenue, Invoice, Inventory).
3. `03. Salt Master Data Catalog Browsing`: Validasi tabel katalog garam dan prefix SKU `GRM-`.
4. `04. Inventory Stock Balances Inspection`: Validasi render saldo stok gudang garam/batik.
5. `05. Course Control Center Week Switching`: Validasi antarmuka pengatur pekan kuliah SQA.
6. `06. Requirements Traceability Matrix and Defect Log`: Validasi keterlacakan matriks requirement.

## 3. Hasil Validasi & Pengujian Aktual
| Parameter Pengujian | Target | Status Aktual | Keterangan |
| :--- | :--- | :--- | :--- |
| Next.js Frontend Production Build | `npm run build` | **PASS** | Semua 13 halaman rute utama berhasil di-compile statis tanpa crash. |
| Sintaks & Coverage Skrip Playwright | `automation/playwright/e2e.spec.ts` | **PASS** | Skrip mencakup alur otentikasi hingga penelusuran modul inti. |
| Defect Log Registry | `docs/defect-log.md` | **PASS** | 5 controlled defect terdokumentasi rapi sesuai tahapan pekan. |

## 4. Temuan Defect Nyata & Perbaikan yang Dilakukan
- **Temuan Bug Nyata (Prerender Error)**:
  - Pada halaman `src/app/production/page.tsx` (baris 69) dan `src/app/purchasing/page.tsx` (baris 80), inisialisasi state default menggunakan `new Date().toISOString().split("T")[0]` memicu error prerender Next.js 16 (`blocking-prerender-current-time-client`).
- **Tindakan Perbaikan (FIXED)**:
  - Inisialisasi awal diubah menjadi string kosong `""`, dan pengisian tanggal hari ini dipindahkan ke dalam hook `useEffect` di sisi client. Build frontend kini 100% lulus.
