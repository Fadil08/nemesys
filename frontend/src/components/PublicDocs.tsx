import React, { useState } from 'react';
import {
  FileText,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Shield,
  Users,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  Wifi,
  HardDrive,
  Cpu,
  UploadCloud,
  FileEdit,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface PublicDocsProps {
  onBack: () => void;
}

export const PublicDocs: React.FC<PublicDocsProps> = ({ onBack }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (i: number) => setOpenFaq(openFaq === i ? null : i);

  const faqs = [
    {
      q: 'Apakah saya harus login untuk mengajukan tiket bantuan?',
      a: 'Tidak. Portal IT Helpdesk ini sepenuhnya dapat digunakan tanpa proses login. Cukup isi formulir pengaduan dengan data identitas Anda (Nama, NIM/NIP) dan masalah yang dihadapi, lalu kirimkan.'
    },
    {
      q: 'Apa yang harus saya siapkan sebelum mengisi formulir?',
      a: 'Siapkan: (1) NIM atau NIP Anda, (2) Email aktif untuk notifikasi, (3) Nomor WhatsApp yang bisa dihubungi teknisi, (4) Deskripsi jelas mengenai kendala (lokasi, nama perangkat, pesan error), dan (5) Screenshot atau foto bukti kendala jika ada.'
    },
    {
      q: 'Berapa lama tiket saya akan diproses?',
      a: 'Waktu resolusi bergantung pada tingkat urgensi. Kendala kritis (P1) ditangani dalam 2 jam, gangguan jaringan gedung (P2) dalam 4 jam, masalah perangkat personal (P3) dalam 24 jam, dan permintaan layanan (P4) dalam 48 jam. Semua berlaku selama jam operasional.'
    },
    {
      q: 'Bagaimana cara melacak status tiket saya?',
      a: 'Gunakan fitur "Cek Status Penanganan Tiket" pada halaman utama portal. Masukkan Nomor Tiket (format: TKT-xxxx) yang Anda dapatkan saat mengirim laporan, atau masukkan NIM/NIP Anda untuk melihat semua tiket yang pernah diajukan.'
    },
    {
      q: 'Apa yang dimaksud status "Resolved" vs "Closed"?',
      a: '"Resolved" berarti teknisi telah menyelesaikan perbaikan dan memberikan solusi. "Closed" berarti tiket sudah ditutup secara resmi setelah konfirmasi penyelesaian. Anda dapat membaca catatan solusi dari teknisi pada detail tiket.'
    },
    {
      q: 'Apakah portal ini beroperasi 24 jam?',
      a: 'Portal pengajuan tiket online tersedia 24/7. Namun penanganan aktif oleh teknisi berlangsung pada jam operasional: Senin–Jumat (07:30–16:30 WIB) dan Sabtu (08:00–13:00 WIB). Tiket yang masuk di luar jam operasional akan diproses pada hari kerja berikutnya.'
    },
    {
      q: 'Apakah saya bisa mengajukan lebih dari satu tiket sekaligus?',
      a: 'Ya, Anda dapat mengajukan tiket sebanyak yang diperlukan. Namun disarankan untuk membuat tiket terpisah untuk setiap permasalahan agar penanganan lebih fokus dan efisien.'
    },
    {
      q: 'Ke mana saya melapor jika tiket tidak ditangani sesuai SLA?',
      a: 'Jika tiket Anda belum ditangani melebihi batas waktu SLA, silakan hubungi langsung melalui WhatsApp Hotline: 085864892610 atau email: ithelpdesk@untag-bwi.ac.id dengan menyebutkan nomor tiket Anda.'
    }
  ];

  const slaData = [
    {
      level: 'P1 — Kritis (Emergency)',
      color: 'var(--color-danger)',
      bgColor: 'rgba(239, 68, 68, 0.08)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      response: '15 Menit',
      resolution: 'Maks. 2 Jam',
      examples: [
        'Jaringan backbone kampus mati total',
        'Portal SIAKAD tidak dapat diakses secara massal oleh seluruh civitas',
        'Server Rektorat / Data Center mati atau kebakaran',
        'Kebocoran keamanan data penting universitas'
      ]
    },
    {
      level: 'P2 — Tinggi (Alert)',
      color: 'var(--color-warning)',
      bgColor: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      response: '30 Menit',
      resolution: 'Maks. 4 Jam',
      examples: [
        'Koneksi WiFi/internet satu gedung atau lab komputer terputus',
        'Proyektor atau sistem audio ruang kuliah utama rusak saat jam kuliah aktif',
        'Sinkronisasi akun E-Learning massal gagal'
      ]
    },
    {
      level: 'P3 — Sedang (Warning)',
      color: 'var(--color-info)',
      bgColor: 'rgba(59, 130, 246, 0.08)',
      borderColor: 'rgba(59, 130, 246, 0.3)',
      response: 'Maks. 2 Jam',
      resolution: 'Maks. 24 Jam',
      examples: [
        'Komputer dosen/tendik lambat atau terkena virus',
        'Printer prodi paper-jam atau tinta habis',
        'Akun webmail kampus terblokir atau lupa kata sandi',
        'Koneksi internet personal di kantor/ruang dosen lambat'
      ]
    },
    {
      level: 'P4 — Rendah (Request)',
      color: 'var(--color-success)',
      bgColor: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      response: 'Maks. 4 Jam',
      resolution: 'Maks. 48 Jam',
      examples: [
        'Request pembuatan akun email kampus baru (@untag-bwi.ac.id)',
        'Pengajuan publikasi berita/pamflet kegiatan di website resmi',
        'Request perubahan konten halaman website prodi/fakultas',
        'Konsultasi penggunaan aplikasi atau software akademik'
      ]
    }
  ];

  const serviceCategories = [
    {
      icon: <Mail size={22} />,
      title: 'Layanan Webmail',
      color: '#6366f1',
      items: [
        'Pembuatan akun email baru @untag-bwi.ac.id',
        'Reset/lupa password email kampus',
        'Pengaturan konfigurasi email di perangkat',
        'Kendala pengiriman/penerimaan email',
        'Peningkatan kapasitas mailbox'
      ]
    },
    {
      icon: <HardDrive size={22} />,
      title: 'Kendala Hardware',
      color: '#f59e0b',
      items: [
        'PC/Laptop lab atau kantor mati total',
        'Keyboard, mouse, monitor rusak',
        'Printer tidak bisa mencetak / paper jam',
        'Proyektor atau speaker kelas bermasalah',
        'Scanner / kamera dokumen tidak terdeteksi'
      ]
    },
    {
      icon: <Cpu size={22} />,
      title: 'Kendala Software',
      color: '#06b6d4',
      items: [
        'Instalasi atau reinstall sistem operasi (Windows)',
        'Aktivasi lisensi software akademik kampus',
        'Aplikasi crash/error atau tidak bisa dibuka',
        'Pembersihan virus, malware, ransomware',
        'Update driver perangkat dan OS'
      ]
    },
    {
      icon: <Wifi size={22} />,
      title: 'Kendala Jaringan',
      color: '#10b981',
      items: [
        'WiFi kampus tidak bisa diakses atau lambat',
        'Login portal SIAKAD/E-Learning error',
        'Konfigurasi koneksi VPN kampus',
        'Request pemasangan titik akses WiFi baru',
        'Troubleshooting koneksi LAN di ruangan'
      ]
    },
    {
      icon: <FileEdit size={22} />,
      title: 'Perubahan Data Website',
      color: '#8b5cf6',
      items: [
        'Update data dosen / profil program studi',
        'Perubahan konten halaman utama prodi/fakultas',
        'Pengelolaan domain/subdomain universitas',
        'Pembaruan kalender akademik di website',
        'Perbaikan tautan/link yang rusak'
      ]
    },
    {
      icon: <UploadCloud size={22} />,
      title: 'Publikasi Informasi',
      color: '#ec4899',
      items: [
        'Unggah berita prestasi mahasiswa/dosen',
        'Publikasi pamflet kegiatan kampus / seminar',
        'Pengumuman beasiswa di portal resmi',
        'Publikasi jadwal acara wisuda / UAS',
        'Upload galeri foto kegiatan kampus'
      ]
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#fff', boxShadow: 'var(--glow-indigo)'
          }}>
            <FileText size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700 }}>Dokumentasi IT Helpdesk</h1>
            <p style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: 600 }}>SLA & Panduan Layanan — UNTAG Banyuwangi</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={14} /> Kembali ke Portal
        </button>
      </header>

      {/* Hero */}
      <section style={{
        padding: '56px 32px',
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'inline-flex', padding: '6px 16px', borderRadius: '999px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--accent-primary)', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
          Dokumentasi Resmi IT Helpdesk UNTAG Banyuwangi
        </div>
        <h2 style={{ fontSize: '40px', fontWeight: 800, maxWidth: '700px', margin: '0 auto', lineHeight: '1.2', marginBottom: '16px' }}>
          Cakupan Layanan, SLA &{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Panduan Penanganan
          </span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.7' }}>
          Dokumen ini menjelaskan secara lengkap cakupan layanan IT, klasifikasi gangguan berdasarkan tingkat urgensi, target waktu respon dan resolusi, serta jalur eskalasi penanganan masalah di lingkungan UNTAG Banyuwangi.
        </p>
      </section>

      {/* Jam Operasional Banner */}
      <div style={{ background: 'rgba(99, 102, 241, 0.06)', borderBottom: '1px solid var(--border-color)', padding: '16px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
            <CheckCircle size={16} />
            <strong>Senin – Jumat:</strong>&nbsp; 07:30 – 16:30 WIB (Layanan Penuh)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)' }}>
            <Clock size={16} />
            <strong>Sabtu:</strong>&nbsp; 08:00 – 13:00 WIB (Layanan Terbatas)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <AlertTriangle size={16} />
            <strong>Minggu & Libur Nasional:</strong>&nbsp; Tutup (Monitoring Otomatis Zabbix P1 Aktif)
          </div>
        </div>
      </div>

      {/* SLA Matrix */}
      <section style={{ padding: '60px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Klasifikasi Prioritas Gangguan & SLA</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Setiap tiket yang masuk akan diklasifikasikan sesuai urgensi dan dampaknya terhadap operasional kampus</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {slaData.map((item, i) => (
            <div key={i} className="glass-card" style={{ borderLeft: `4px solid ${item.color}`, backgroundColor: item.bgColor, borderColor: item.borderColor }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '24px', alignItems: 'start', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: item.color, marginBottom: '12px' }}>{item.level}</h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contoh Gangguan / Permintaan:</p>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {item.examples.map((ex, j) => (
                      <li key={j} style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{ex}</li>
                    ))}
                  </ul>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Target Respon Awal</p>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: item.color }}>{item.response}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Target Resolusi (SLA)</p>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>{item.resolution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cakupan Layanan */}
      <section style={{ padding: '60px 32px', backgroundColor: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Cakupan Kategori Layanan IT Helpdesk</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Berikut adalah daftar jenis layanan yang tersedia beserta contoh permasalahan yang dapat dilaporkan</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {serviceCategories.map((cat, i) => (
              <div key={i} className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                  <div style={{ color: cat.color, padding: '10px', backgroundColor: `${cat.color}1a`, borderRadius: '10px' }}>{cat.icon}</div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{cat.title}</h4>
                </div>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {cat.items.map((item, j) => (
                    <li key={j} style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matriks Eskalasi */}
      <section style={{ padding: '60px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Matriks Eskalasi Penanganan</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Prosedur eskalasi berlaku apabila tiket tidak terselesaikan dalam batas waktu SLA yang ditentukan</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { level: 'Level 1', title: 'Teknisi Lapangan', desc: 'Menerima tiket, melakukan troubleshooting langsung di lokasi sesuai batas waktu SLA yang berlaku.', icon: <Users size={20} />, color: 'var(--accent-primary)' },
            { level: 'Level 2', title: 'Koordinator IT / Manager', desc: 'Diaktifkan jika resolusi SLA Level 1 terlewati. Mengalokasikan personil tambahan, suku cadang darurat, atau koordinasi dengan vendor.', icon: <Shield size={20} />, color: 'var(--color-warning)' },
            { level: 'Level 3', title: 'Kepala Biro TI / Rektorat', desc: 'Diaktifkan jika resolusi masih belum diperoleh dalam +2 jam setelah Level 2. Pengambilan keputusan strategis termasuk penanganan oleh vendor eksternal.', icon: <AlertTriangle size={20} />, color: 'var(--color-danger)' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: `${item.color}20`, border: `2px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}>
                  {item.icon}
                </div>
                {i < 2 && <div style={{ width: '2px', height: '40px', backgroundColor: 'var(--border-color)' }} />}
              </div>
              <div className="glass-card" style={{ flex: 1, marginTop: '4px' }}>
                <div style={{ fontSize: '11px', color: item.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{item.level}</div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hak & Kewajiban */}
      <section style={{ padding: '60px 32px', backgroundColor: 'rgba(255,255,255,0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Hak & Kewajiban Pelapor</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Aturan dan komitmen bersama antara civitas pelapor dan Tim IT Helpdesk</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="glass-card" style={{ borderTop: '3px solid var(--color-warning)' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-warning)' }}>Kewajiban Pelapor (Civitas)</h4>
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Mengisi formulir dengan data identitas asli dan valid',
                  'Mendeskripsikan kendala secara rinci dan kronologis',
                  'Menyertakan foto bukti atau screenshot jika memungkinkan',
                  'Menjaga kerahasiaan Nomor Tiket agar tidak disalahgunakan',
                  'Kooperatif memberikan informasi tambahan jika diminta teknisi'
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="glass-card" style={{ borderTop: '3px solid var(--color-success)' }}>
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-success)' }}>Hak Pelapor (Civitas)</h4>
              <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  'Mendapatkan penanganan sesuai target waktu SLA yang berlaku',
                  'Memperoleh transparansi update status tiket secara real-time',
                  'Mendapatkan catatan solusi dari teknisi yang menangani',
                  'Mengajukan komplain jika SLA terlewati ke Koordinator IT',
                  'Diperlakukan dengan profesional dan tanpa diskriminasi'
                ].map((item, i) => (
                  <li key={i} style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Pertanyaan yang Sering Diajukan (FAQ)</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Klik pertanyaan untuk melihat jawabannya</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <button
                onClick={() => toggleFaq(i)}
                style={{
                  width: '100%', background: 'none', border: 'none', padding: '18px 24px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14.5px',
                  textAlign: 'left', gap: '12px'
                }}
              >
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 24px 18px', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.7', paddingTop: '14px' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Back + Kontak */}
      <section style={{ padding: '60px 32px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Siap Melaporkan Kendala?</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>Kembali ke portal pengaduan dan isi formulir tiket bantuan IT Anda sekarang.</p>
          <button onClick={onBack} className="btn-primary" style={{ padding: '12px 28px', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Ajukan Tiket Sekarang <ArrowRight size={16} />
          </button>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '32px', color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={15} /> ithelpdesk@untag-bwi.ac.id</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={15} /> WhatsApp: 085864892610</span>
          </div>
        </div>
      </section>
    </div>
  );
};
