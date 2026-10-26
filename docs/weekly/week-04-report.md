# Laporan Pengujian Pekan 04: Decision Table & State Transition Testing

## 1. Identitas Mata Kuliah & Modul RPS
- **Mata Kuliah**: Manajemen Proyek Perangkat Lunak (OBE 2026)
- **Sub-CPMK 4**: Mampu menerapkan teknik Decision Table dan State Transition Testing pada alur proses bisnis ERP/EIS.
- **Modul Terkait**: Alur Status Dokumen Pesanan (`SalesOrder`, `OrderStatusService`), State Machine Transaksi.

## 2. Diagram State Transition yang Diuji
Siklus Status Pesanan Penjualan (Sales Order Lifecycle):
`DRAFT` -> `CONFIRMED` -> `PROCESSING` -> `COMPLETED` (atau `CANCELLED`)

- **Transisi Sah (Valid Transitions)**:
  1. `DRAFT` -> `CONFIRMED`
  2. `CONFIRMED` -> `PROCESSING`
  3. `PROCESSING` -> `COMPLETED`
  4. `DRAFT` / `CONFIRMED` -> `CANCELLED`
- **Transisi Ilegal (Invalid Transitions / Skipped States)**:
  - Loncat langsung dari `DRAFT` -> `COMPLETED` tanpa proses konfirmasi & pemrosesan (Wajib ditolak dengan exception).

## 3. Hasil Eksekusi Pengujian Aktual
| Kasus Uji | Skenario | Status Aktual | Keterangan |
| :--- | :--- | :--- | :--- |
| `test_sales_order_valid_state_transitions` | Menelusuri seluruh siklus transisi status legal | **PASS** | Sistem mengizinkan perpindahan status sesuai urutan FSM (Finite State Machine). |
| `test_sales_order_invalid_skip_transition_is_rejected` | Mencoba melompati state (`DRAFT` langsung ke `COMPLETED`) | **PASS** | Sistem menolak aksi secara tegas dengan melempar `IllegalStateTransitionException`. |

## 4. Temuan Kekurangan / Defect & Rekomendasi
- **Temuan**: Proteksi transisi state machine pada order penjualan telah berfungsi 100% andal.
- **Rekomendasi**: Terapkan state machine yang identik dan ketat pada modul pesanan produksi (`ProductionOrder`) dan pengiriman (`DeliveryOrder`).
