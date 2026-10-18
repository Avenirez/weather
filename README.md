# Weatherez: Dasbor Prakiraan Cuaca dan Telemetri Atmosfer

Aplikasi pemantau cuaca berbasis web yang dibangun dengan Svelte 5 dan Vite. Aplikasi ini memproses data cuaca langsung dari API publik untuk menampilkan kondisi cuaca terkini, metrik atmosfer terperinci, ramalan harian dan per jam, serta pemetaan geospasial interaktif.

## Arsitektur Integrasi Data

Weatherez mengambil data langsung dari layanan publik sisi klien tanpa perantara backend:

1. Open-Meteo Weather Forecast API: Mengambil data suhu aktual, suhu semu (apparent temperature), kelembapan relatif, kecepatan dan arah angin 10 meter, tekanan permukaan, tutupan awan, probabilitas hujan, ramalan harian 7 hari, dan ramalan per jam 24 jam.
2. Open-Meteo Air Quality API: Mengambil data indeks kualitas udara standar Eropa (European AQI), partikel PM10 dan PM2.5, karbon monoksida, nitrogen dioksida, ozon, serta indeks radiasi UV.
3. Open-Meteo Geocoding API: Menyediakan pencarian koordinat global (lintang dan bujur), nama wilayah administratif, dan identitas negara secara dinamis berdasarkan input pengguna.
4. BigDataCloud Reverse Geocoding API: Mengonversi koordinat GPS peramban (WGS84) menjadi nama kota dan wilayah lokal saat menggunakan deteksi lokasi otomatis.
5. Mesin Simulasi Cuaca Lokal: Generator cuaca berbasis seed pseudorandom internal yang menyediakan data cadangan jika koneksi jaringan terputus atau API hulu tidak dapat diakses.

## Fitur Utama

- Telemetri Cuaca Waktu Nyata: Menampilkan suhu aktual, kondisi cuaca, suhu terasa, kelembapan, kecepatan angin, dan status live update.
- Panel Detail Kondisi Atmosfer: Memuat metrik kelembapan dengan estimasi titik embun (dew point), tekanan udara barometrik, jarak pandang horizontal, serta kompas arah angin 8 penjuru mata angin dinamis.
- Pemantauan Indeks UV dan Kualitas Udara: Menampilkan skor radiasi UV matahari dan indeks kualitas udara Eropa (AQI) lengkap dengan kategori status lingkungan.
- Sistem Peringatan Cuaca Ekstrem: Mendeteksi kondisi berisiko tinggi secara otomatis, termasuk angin kencang di atas 40 km/jam, indeks UV ekstrem (skor 8 ke atas), kualitas udara buruk (skor AQI 80 ke atas), dan badai petir atau hujan lebat.
- Latar Belakang Animasi Adaptif: Tampilan visual yang menyesuaikan suasana cuaca secara otomatis dengan efek awan bergerak, tetesan air hujan, kilatan petir, bintang malam hari, dan gradien langit dinamis.
- Ramalan Multi-Interval: Tab ramalan per jam untuk 24 jam ke depan serta tab ramalan 7 hari dengan indikator rentang suhu minimum-maksimum dan persentase peluang hujan.
- Peta Cuaca Geospasial Interaktif: Integrasi Leaflet dan OpenStreetMap yang otomatis memposisikan penanda peta sesuai koordinat kota terpilih.
- Pencarian Kota Cerdas: Fitur autocomplete pencarian kota global dengan penundaan input (debounce) dan penanganan navigasi keyboard.
- Deteksi Lokasi Otomatis: Mengakses API Geolocation peramban untuk mendeteksi posisi perangkat pengguna dan memuat cuaca setempat secara instan.
- Riwayat Pencarian dan Kota Favorit: Menyimpan hingga 8 pencarian terakhir dan daftar kota favorit ke dalam LocalStorage peramban untuk akses cepat.
- Konversi Satuan Suhu C dan F: Pengalih satuan suhu antara Celcius dan Fahrenheit dengan perhitungan reaktif instan di seluruh tampilan.

## Keamanan dan Keandalan

Aplikasi menerapkan praktik rekayasa perangkat lunak untuk menjaga integritas sisi klien:

- Mitigasi DOM XSS: Konten popup pada peta Leaflet menggunakan node DOM murni (document.createElement dan textContent) untuk mencegah injeksi kode berbahaya melalui input nama kota.
- Isolasi Error Jaringan: Setiap permintaan jaringan dibungkus dalam blok try-catch dengan pengalihan otomatis ke generator cuaca deterministik lokal jika terjadi kegagalan transmisi.
- Penanganan Penyimpanan Lokal: Akses baca dan tulis LocalStorage dilindungi penanganan eksepsi untuk mencegah aplikasi mogok saat kuota penyimpanan penuh atau dinonaktifkan peramban.
- Validasi Batas Input: Kueri pencarian dibatasi minimal 3 karakter untuk membatasi beban panggilan jaringan yang tidak perlu.

## Struktur Direktori

```text
weatherez/
|-- public/
|   \-- favicon.svg          # Ikon vektor aplikasi
|-- src/
|   |-- components/
|   |   |-- AnimatedBackground.svelte # Latar belakang animasi cuaca dinamis
|   |   |-- ForecastSection.svelte    # Tampilan ramalan cuaca per jam dan harian
|   |   |-- SearchHistory.svelte      # Riwayat pencarian dan daftar kota favorit
|   |   |-- WeatherCard.svelte        # Kartu utama suhu dan kondisi cuaca
|   |   |-- WeatherDetails.svelte     # Panel detail metrik atmosfer dan peringatan ekstrem
|   |   \-- WeatherMap.svelte         # Peta interaktif Leaflet dengan sanitasi DOM
|   |-- lib/
|   |   \-- weatherData.js   # Integrasi API Open-Meteo dan generator cuaca simulasi
|   |-- App.svelte           # Komponen root dan pengelola status utama
|   |-- app.css              # Gaya global, gradien atmosfer, dan panel kaca
|   \-- main.js              # Titik masuk aplikasi Svelte 5
|-- .gitignore               # Daftar berkas yang diabaikan Git
|-- index.html               # Dokumen HTML root dan konfigurasi viewport
|-- jsconfig.json            # Konfigurasi path dan intellisense JavaScript
|-- package.json             # Manifes proyek dan dependensi npm
|-- svelte.config.js         # Konfigurasi compiler Svelte
|-- vercel.json              # Konfigurasi deployment hosting Vercel
\-- vite.config.js           # Konfigurasi bundler Vite
```

## Panduan Penggunaan

### Prasyarat

- Node.js versi 18.0 atau lebih tinggi
- npm versi 9.0 atau lebih tinggi

### Instalasi

1. Salin atau unduh repositori ini ke komputer lokal Anda.
2. Buka terminal di direktori proyek dan pasang dependensi:

```bash
npm install
```

### Menjalankan Server Pengembangan

Jalankan server lokal dengan fitur hot module replacement:

```bash
npm run dev
```

Buka alamat `http://localhost:5173` pada peramban web Anda.

### Membangun Paket Produksi

Kompilasi kode sumber menjadi berkas produksi siap rilis:

```bash
npm run build
```

Untuk menguji hasil build produksi secara lokal:

```bash
npm run preview
```

## Lisensi dan Sumber Data

Data cuaca disediakan oleh Open-Meteo di bawah lisensi Creative Commons Attribution 4.0 International (CC BY 4.0). Peta dasar disediakan oleh OpenStreetMap di bawah lisensi Open Database License (ODbL).
