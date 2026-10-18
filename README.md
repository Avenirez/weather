# Weatherez: Mesin Telemetri Atmosfer

Aplikasi pemantau meteorologi sisi klien yang dibangun menggunakan Svelte 5 dan Vite. Aplikasi ini mengonsumsi API cuaca dan kualitas udara terbuka untuk menyajikan metrik lingkungan waktu nyata, kurva prediksi 24 jam, serta telemetri geospasial.

## Arsitektur Sistem

Weatherez terhubung langsung ke titik akhir publik tanpa perantara server proxy:

1. Open-Meteo Forecast API: Vektor cuaca terkini, interval suhu 24 jam, batas suhu tertinggi dan terendah 7 hari, serta data efemeris matahari (waktu terbit dan terbenam).
2. Open-Meteo Air Quality API: Indeks Kualitas Udara Eropa (AQI), PM2.5, PM10, ozon, karbon monoksida, nitrogen dioksida, serta radiasi UV matahari.
3. Open-Meteo Geocoding API: Pencarian koordinat global, wilayah administratif, dan zona waktu.
4. BigDataCloud Reverse Geocoding API: Mengubah koordinat perangkat keras peramban (WGS84) menjadi batas wilayah administratif lokal.
5. Fallback Simulasi Deterministik: Saat luring atau terjadi gangguan jaringan hulu, generator pseudorandom lokal menghitung data dasar musiman berdasarkan lintang geografis.

## Kemampuan Utama

- Telemetri Kepadatan Tinggi: Suhu permukaan, suhu semu, kelembapan relatif, tekanan udara barometrik, jarak pandang horizontal, serta tutupan awan.
- Grafik Spline Kontinu 24 Jam: Kurva Bezier kubik SVG yang memvisualisasikan variasi suhu per jam dan diagram batang peluang hujan.
- Lintasan Matahari Vektor: Menghitung posisi harian matahari di sepanjang busur geometris SVG berdasarkan data waktu terbit dan terbenam lokal.
- Kompas Arah Angin: Indikator visual derajat sudut arah angin dan penanda mata angin (U, T, S, B / N, E, S, W) yang terhubung dengan kecepatan angin permukaan.
- Mesin Pencarian Ter-debounce: Penunda input 250ms dengan dukungan navigasi papan ketik penuh (Panah Atas, Panah Bawah, Enter, Escape) dan rekomendasi kota.
- Persistensi Lokasi: Penyimpanan riwayat pencarian dan lokasi tersimpan pada LocalStorage dengan penyaringan prototype pollution.
- Pengalih Mode Visual: Pilihan status antara siklus matahari otomatis, tema gelap permanen, dan tema terang permanen.

## Kontrol Keamanan

Aplikasi ini menerapkan kontrol sisi klien yang selaras dengan standar keamanan aplikasi web:

- Mitigasi DOM XSS: Penanda dan popup peta Leaflet menggunakan node DOM asli (`document.createElement` dan `textContent`), bukan penggabungan string HTML mentah.
- Pertahanan Prototype Pollution: Fungsi reviver kustom pada parser JSON memblokir kunci `__proto__`, `constructor`, dan `prototype` saat membaca data penyimpanan lokal.
- Pembatasan Parameter Input: Nilai lintang (-90 hingga 90) dan bujur (-180 hingga 180) divalidasi serta dibatasi secara ketat sebelum membuat string kueri.
- Kebijakan Keamanan Konten (CSP): Pembatasan asal skrip di `index.html` hanya mengizinkan `self` dan `unpkg.com` guna memblokir eksekusi skrip pihak ketiga tanpa izin.
- Pencegahan Clickjacking: Aturan `X-Frame-Options: DENY` dan `frame-ancestors 'none'` memblokir penyematan aplikasi ke dalam iframe.
- Proteksi MIME Sniffing: Header `X-Content-Type-Options: nosniff` aktif pada semua respons aset.

## Struktur Direktori

```text
├── public/
│   ├── favicon.svg          # Ikon vektor aplikasi
│   └── manifest.json        # Manifest Progressive Web App
├── src/
│   ├── assets/              # Ilustrasi vektor statis
│   ├── components/
│   │   ├── AnimatedBackground.svelte # Lapisan kanvas mikro-grid
│   │   ├── ForecastSection.svelte    # Tab kurva 24 jam, per jam, dan harian
│   │   ├── HourlyChart.svelte        # Kurva Bezier interaktif SVG
│   │   ├── SearchHistory.svelte      # Catatan kueri dan lokasi tersimpan
│   │   ├── SkeletonCard.svelte       # Placeholder status pemuatan
│   │   ├── Toast.svelte              # Notifikasi status non-blocking
│   │   ├── WeatherCard.svelte        # Kartu utama suhu dan ringkasan metrik
│   │   ├── WeatherDetails.svelte     # Grid telemetri bento
│   │   ├── WeatherIcon.svelte        # Sistem simbol cuaca berbasis SVG murni
│   │   └── WeatherMap.svelte         # Kontainer GIS Leaflet
│   ├── lib/
│   │   ├── security.js      # Sanitasi input dan pengaman penyimpanan
│   │   └── weatherData.js   # Mesin data Open-Meteo dan fallback simulasi
│   ├── App.svelte           # Kerangka utama aplikasi dan koordinator state
│   ├── app.css              # Token desain seng dan aturan tipografi
│   └── main.js              # Titik masuk aplikasi Svelte 5
├── index.html               # Dokumen root, konfigurasi CSP, dan viewport
├── package.json             # Dependensi dan skrip build
├── vercel.json              # Header keamanan respons HTTP
└── vite.config.js           # Konfigurasi bundler Vite
```

## Panduan Penggunaan

### Prasyarat

- Node.js versi 18.0 atau lebih baru
- npm versi 9.0 atau lebih baru

### Instalasi

1. Klon atau ekstrak berkas repositori ke lingkungan lokal Anda.
2. Pasang dependensi:

```bash
npm install
```

### Server Pengembangan

Jalankan Vite dalam mode pengembangan dengan hot module replacement:

```bash
npm run dev
```

Buka `http://localhost:5173` di peramban Anda.

### Build Produksi

Kompilasi dan satukan aset untuk penerapan produksi:

```bash
npm run build
```

Jalankan tinjauan build produksi secara lokal:

```bash
npm run preview
```

## Lisensi

Proyek privat. Data meteorologi disediakan oleh Open-Meteo di bawah lisensi Creative Commons Attribution 4.0 International (CC BY 4.0).
