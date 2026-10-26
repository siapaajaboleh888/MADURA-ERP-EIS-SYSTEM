# MADURA ERP-EIS System — Antigravity Agent Rules

## 🎯 Tujuan Utama
Rules ini dirancang untuk **memaksimalkan kualitas output** sekaligus **meminimalkan penggunaan token** agar tidak mudah mencapai rate limit model AI.

---

## 📋 Aturan Respons & Efisiensi Token

### 1. Fokus & Presisi
- **Jawab hanya yang ditanya.** Jangan menambahkan penjelasan yang tidak diminta.
- **Jangan ulangi kode yang tidak berubah.** Jika hanya beberapa baris yang diubah, tampilkan hanya bagian yang berubah dengan komentar `// ... kode lain tidak berubah`.
- **Jangan tambahkan boilerplate** seperti "Tentu saja!", "Baik, saya akan...", atau salam pembuka. Langsung ke jawaban.
- **Gunakan diff format** (`+/-`) saat menampilkan perubahan kode kecil, bukan seluruh file.

### 2. Penanganan File Besar
- Saat mengedit file panjang (>100 baris), **edit hanya bagian yang relevan**, bukan mengganti seluruh isi file.
- Gunakan komentar placeholder `// ... (tidak ada perubahan di bagian ini)` untuk melewati bagian yang tidak berubah.
- **Jangan membaca file secara penuh** jika hanya perlu melihat struktur atau bagian tertentu — gunakan pencarian terarah.

### 3. Konteks Percakapan
- **Jangan ringkas ulang** apa yang baru saja dikerjakan di setiap respons.
- **Asumsikan pengguna sudah tahu** tentang codebase ini (Laravel backend + Next.js frontend). Tidak perlu menjelaskan hal-hal dasar kecuali diminta.
- **Simpan konteks di antara prompt** — jika sebuah tugas belum selesai, lanjutkan dari titik terakhir tanpa mengulang dari awal.

### 4. Pemilihan Model yang Tepat
- Untuk tugas **sederhana** (syntax error, penjelasan singkat, perubahan kecil): gunakan model cepat (Gemini Flash / GPT-OSS Medium).
- Untuk tugas **kompleks** (arsitektur, debugging rumit, refactor besar): boleh gunakan model Thinking.
- **Hindari model Thinking** untuk tugas yang tidak memerlukan penalaran mendalam — ini mengkonsumsi banyak token.

---

## 🏗️ Konteks Proyek: MADURA ERP-EIS System

### Stack Teknologi
- **Backend**: Laravel (PHP) — API RESTful
- **Frontend**: Next.js (TypeScript/TSX) — App Router
- **Database**: MySQL / SQLite (untuk testing)
- **Auth**: JWT / Sanctum

### Direktori Utama
```
TESTING/
├── backend/          # Laravel API
│   ├── app/Http/Controllers/Api/
│   ├── routes/api.php
│   └── .env
├── frontend/         # Next.js App
│   ├── src/app/      # App Router pages
│   └── .env.local
└── docker-compose.yml
```

### Konvensi Kode
- **PHP/Laravel**: PSR-4, method camelCase, resource controllers
- **TypeScript/Next.js**: Functional components, hooks, TypeScript strict
- **API**: RESTful endpoints, response format `{ data, message, status }`

---

## ⚡ Strategi Kerja Efisien

### Saat Diminta Membuat Fitur Baru
1. **Tanya dulu** jika ada ambiguitas — jangan asumsikan desain yang belum dikonfirmasi.
2. Buat **rencana singkat** (2-3 baris) sebelum coding, bukan essay panjang.
3. Implementasikan langsung setelah rencana disetujui.

### Saat Debugging
1. **Identifikasi root cause** terlebih dahulu sebelum menawarkan solusi.
2. Tampilkan **hanya kode yang relevan** untuk perbaikan bug.
3. Jangan menawarkan alternatif yang tidak diminta.

### Saat Review Kode
- Fokus pada **masalah kritis** (bug, security, performance) dulu.
- Saran style/formatting hanya jika memang merusak keterbacaan.

---

## 🚫 Hal yang TIDAK Boleh Dilakukan
- Jangan regenerasi seluruh file jika hanya sebagian kecil yang berubah
- Jangan tambahkan komentar yang obvious ("// increment counter by 1")
- Jangan ulangi instruksi user kembali dalam respons
- Jangan buat placeholder yang tidak berguna (TODO: implement this)
- Jangan tambahkan dependencies baru tanpa persetujuan eksplisit
