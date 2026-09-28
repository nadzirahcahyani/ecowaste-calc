# Ecowaste Calc — VS Code

Aplikasi web sederhana yang dibuat berdasarkan desain/screenshot Ecowaste Calc.

## Fitur
- Splash screen
- Dashboard/menu utama
- Hitung timbulan sampah
- Hitung volume sampah
- Prediksi regresi linear
- Interpolasi linear
- Riwayat perhitungan menggunakan localStorage
- Ekspor laporan melalui dialog print browser

## Cara menjalankan di VS Code
1. Ekstrak folder/project ini.
2. Buka folder `ecowaste_calc_vscode` di VS Code.
3. Buka `index.html`.
4. Jalankan menggunakan extension **Live Server**, atau klik kanan `index.html` → **Open with Live Server**.
5. Aplikasi akan terbuka di browser.

## Catatan rumus
- Timbulan per kapita mengikuti contoh tampilan: `berat sampah total / jumlah penduduk`.
- Timbulan total per hari: `berat sampah total / lama pengukuran`.
- Volume: `berat / densitas`.
- Regresi linear dihitung otomatis dari data historis.
- Interpolasi linear menggunakan dua titik data.

## Struktur
- `index.html` → tampilan/halaman
- `style.css` → desain dan responsive layout
- `app.js` → perhitungan dan interaksi
