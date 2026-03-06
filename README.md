# DynnVault — Setup Guide

## Struktur File
```
dynnvault/
├── index.html              ← Entry point
├── css/
│   └── style.css           ← Semua styling
├── js/
│   ├── config.js           ← Supabase URL & key
│   ├── auth.js             ← PIN auth + rate limiting
│   ├── store.js            ← Supabase data layer
│   ├── bg.js               ← Cursor + particle background
│   └── app.js              ← React app utama
├── supabase_setup.sql      ← Jalankan ini di Supabase sekali
└── .github/
    └── workflows/
        └── ping.yml        ← Auto-ping biar tidak di-pause
```

---

## Setup Supabase (sekali aja)

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Masuk ke project **dynnvault**
3. Klik **SQL Editor** di sidebar
4. Copy-paste isi file `supabase_setup.sql` → klik **Run**

---

## Setup GitHub Actions (ping otomatis)

1. Push project ini ke GitHub repo
2. Buka repo → **Settings** → **Secrets and variables** → **Actions**
3. Tambah 2 secrets:
   - `SUPABASE_URL` → `https://swykzsmwrflqmkdrpxlh.supabase.co`
   - `SUPABASE_ANON_KEY` → (anon key kamu)
4. Selesai — GitHub akan ping Supabase tiap Senin & Kamis otomatis

---

## Deploy ke Netlify

1. Push folder ini ke GitHub
2. Di Netlify: **Add new site** → **Import from Git**
3. Pilih repo → build settings kosongkan (static site) → **Deploy**

---

## First Time Login

Saat pertama kali klik Admin, akan muncul halaman **"Set Admin PIN"**.
Set PIN kamu sendiri (min 4 karakter). PIN akan disimpan terenkripsi di Supabase.

> ⚠️ **Penting:** Jangan share `config.js` secara publik kalau berisi key sensitif.
> Untuk keamanan lebih, pindahkan keys ke environment variables Netlify.
"# dynnvault" 
