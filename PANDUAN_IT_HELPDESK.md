# LAYANAN IT HELPDESK & SERVICE LEVEL AGREEMENT (SLA) UNTAG BANYUWANGI

Dokumen ini memuat panduan komprehensif mengenai cakupan layanan, klasifikasi kendala, target waktu respon, komitmen Service Level Agreement (SLA), jam operasional, serta alur eskalasi bantuan IT di Universitas 17 Agustus 1945 (UNTAG) Banyuwangi.

---

## 1. Klasifikasi Tingkat Urgensi Gangguan & Target Waktu (SLA)

Setiap tiket bantuan yang masuk akan dianalisis oleh Admin IT dan dikelompokkan ke dalam 4 tingkat prioritas berdasarkan dampak gangguan terhadap kegiatan akademik dan operasional kampus:

| Prioritas | Kategori | Contoh Gangguan / Permintaan | Waktu Respon | Waktu Resolusi |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **Critical (Emergency)** | - Koneksi Jaringan Backbone Kampus mati total.<br>- Listrik Ruang Server Rektorat padam.<br>- Portal SIAKAD Universitas tidak dapat diakses secara massal.<br>- Kebocoran keamanan data penting universitas. | **15 Menit** | **Maks. 2 Jam** |
| **P2** | **High (Alert)** | - Akses WiFi/Internet satu gedung/lab komputer terputus.<br>- Proyektor atau audio ruang kuliah utama rusak saat kelas berlangsung.<br>- Akun E-Learning massal mengalami kegagalan sinkronisasi. | **30 Menit** | **Maks. 4 Jam** |
| **P3** | **Medium (Warning)** | - Komputer/Laptop dosen/tendik lambat atau terkena virus.<br>- Printer prodi mengalami paper-jam atau tinta habis.<br>- Akun Webmail kampus personal terblokir atau lupa kata sandi. | **Maks. 2 Jam** | **Maks. 24 Jam** |
| **P4** | **Low (Request)** | - Permintaan pembuatan akun email civitas baru (`@untag-bwi.ac.id`).<br>- Pengajuan publikasi pengumuman di website resmi.<br>- Request perubahan minor / update konten halaman web prodi. | **Maks. 4 Jam** | **Maks. 48 Jam** |

---

## 2. Jam Operasional Layanan

Layanan IT Helpdesk UNTAG Banyuwangi beroperasi pada waktu-waktu berikut:

* **Senin s/d Jumat**: `07:30 - 16:30 WIB` (Layanan Penuh)
* **Sabtu**: `08:00 - 13:00 WIB` (Layanan Terbatas / Hanya piket teknisi)
* **Minggu & Libur Nasional**: `TUTUP` (Hanya monitoring otomatis melalui sistem Zabbix untuk gangguan P1)

*Catatan: Tiket yang dikirimkan di luar jam operasional akan diproses pada hari kerja berikutnya berdasarkan urutan waktu pengiriman.*

---

## 3. Matriks Eskalasi Penanganan Kendala

Apabila suatu tiket gangguan tidak terselesaikan dalam batas waktu resolusi SLA yang telah ditentukan, sistem akan menjalankan prosedur eskalasi bertahap:

```
[Level 1: Teknisi Lapangan] -> Menangani troubleshooting langsung di lokasi (Sesuai batas SLA)
             |
             v (Batas Resolusi SLA Terlewati)
[Level 2: Koordinator IT / Manager] -> Mengalokasikan personil tambahan atau suku cadang darurat
             |
             v (Tambahan 2 Jam Belum Selesai)
[Level 3: Kepala Biro TI (Administrasi & Rektorat)] -> Pengambilan keputusan strategis / vendor eksternal
```

---

## 4. Hak & Kewajiban Pelapor

### Kewajiban Civitas (Pelapor):
1. Mengisi formulir dengan data identitas asli (Nama, NIM/NIP, email, dan nomor WhatsApp yang aktif).
2. Menuliskan deskripsi kendala secara detail (menyebutkan lokasi, nama perangkat, pesan error, atau kronologi kendala).
3. Sangat disarankan melampirkan foto bukti fisik atau screenshot kendala guna mempermudah analisis cepat oleh tim teknis.
4. Menjaga kerahasiaan nomor tiket agar tidak disalahgunakan pihak lain.

### Hak Civitas (Pelapor):
1. Memperoleh penanganan kendala sesuai target waktu SLA yang disepakati.
2. Mendapatkan transparansi update status penanganan (Open -> In Progress -> Resolved/Closed) melalui fitur Cek Status Tiket.
3. Mendapatkan informasi mengenai solusi atau catatan perbaikan yang dilakukan teknisi setelah kendala dinyatakan selesai.

---

Informasi Kategori Layanan Bantuan
Pilih kategori bantuan yang sesuai dengan kendala yang Anda hadapi

Layanan Webmail
Pengaturan akun email resmi kampus (reset password, kendala pengiriman email, request pembuatan akun baru).

Kendala Teknis Hardware
Kerusakan fisik komputer laboratorium, proyektor kelas, printer kantor prodi, scanner, serta hardware lainnya.

Kendala Teknis Software
Masalah sistem operasi, instalasi aplikasi penunjang kuliah, aktivasi lisensi software, pembersihan virus / malware.

Kendala Jaringan & WiFi
Koneksi WiFi kampus lambat atau terputus, login portal Sistem Informasi Akademik (SIAKAD) error, akses e-learning.

Request Perubahan Data Website
Permintaan perubahan konten, pembaruan data dosen/prodi pada website resmi fakultas atau subdomain universitas.

Request Publikasi Informasi
Permintaan unggah pamflet kegiatan, pengumuman beasiswa, berita prestasi mahasiswa di media digital universitas.

Alur Kerja Penanganan Tiket
Bagaimana laporan Anda diproses oleh Tim IT Helpdesk

1
Isi Formulir
Tulis identitas Anda dan jelaskan detail kendala secara rinci.

2
Verifikasi Laporan
Sistem mencatat tiket dan mendistribusikan ke admin pengelola.

3
Penanganan
Teknisi yang ditugaskan melakukan troubleshooting kendala.

4
Selesai
Anda menerima solusi, status tiket berubah jadi resolved/closed.

Panduan & FAQ Bantuan IT
Pertanyaan umum dan cara penggunaan portal pengaduan

Siapa saja yang bisa menggunakan portal ini?
Portal ini terbuka untuk seluruh civitas akademika UNTAG Banyuwangi, meliputi Mahasiswa, Dosen, Tenaga Kependidikan (Tendik), Staf Rektorat, Staf Fakultas/Prodi, dan Pimpinan yang mengalami kendala terkait fasilitas IT di lingkungan kampus.

Bagaimana cara mengetahui perkembangan laporan saya?
Setelah mengirimkan laporan, Anda akan mendapatkan Nomor Tiket (contoh: TKT-171922...). Anda dapat menyalin nomor tersebut dan memasukkannya ke kolom pencarian di bagian Cek Status Penanganan Tiket di bawah untuk memantau status secara langsung.

Berapa lama kendala saya akan ditangani?
Waktu penanganan bergantung pada tingkat kerumitan kendala dan skala prioritas. Rata-rata laporan akan ditinjau dalam waktu 1x24 jam kerja oleh tim IT Rektorat.

Mengapa saya harus melampirkan foto bukti kendala?
Melampirkan tangkapan layar (screenshot) error atau foto perangkat keras yang rusak akan sangat membantu teknisi kami dalam mendiagnosis masalah dengan cepat, sehingga mempercepat proses perbaikan.

## 5. Kontak IT Helpdesk Kampus
- 📩 **Email Resmi**: `ithelpdesk@untag-bwi.ac.id`
- 💬 **WhatsApp Hotline**: `085864892610`
- 🏢 **Kantor Pusat**: Biro Teknologi Informasi, Gedung Rektorat Lt. 1, Universitas 17 Agustus 1945 Banyuwangi.
