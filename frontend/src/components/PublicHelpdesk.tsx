import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Mail, 
  HardDrive, 
  Cpu, 
  Wifi, 
  FileEdit, 
  UploadCloud, 
  Send, 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ChevronRight,
  ArrowLeft,
  Phone
} from 'lucide-react';
import { BACKEND_URL } from '../App';
import type { UserTicket } from '../types';

interface PublicHelpdeskProps {
  onBackToLogin: () => void;
}

export const PublicHelpdesk: React.FC<PublicHelpdeskProps> = ({ onBackToLogin }) => {
  // Form state
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [category, setCategory] = useState('Mahasiswa');
  const [unitSpecification, setUnitSpecification] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [serviceType, setServiceType] = useState('Layanan Webmail');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Status check state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<UserTicket[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/public/submit-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          id_number: idNumber,
          category,
          unit_specification: unitSpecification,
          email,
          whatsapp_number: whatsappNumber,
          service_type: serviceType,
          description,
          image_url: imageUrl
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(data.ticket_number);
        // Reset form
        setFullName('');
        setIdNumber('');
        setUnitSpecification('');
        setEmail('');
        setWhatsappNumber('');
        setDescription('');
        setImageUrl(null);
      } else {
        setSubmitError(data.error || 'Gagal mengirimkan tiket.');
      }
    } catch (err) {
      setSubmitError('Gagal menghubungi server. Silakan coba beberapa saat lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    setSearchError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/public/tickets/status?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data);
        if (data.length === 0) {
          setSearchError('Tidak ada tiket yang ditemukan untuk NIP/NIM atau Nomor Tiket tersebut.');
        }
      } else {
        setSearchError(data.error || 'Gagal mencari status tiket.');
      }
    } catch (err) {
      setSearchError('Gagal menghubungi server.');
    } finally {
      setSearching(false);
    }
  };

  const renderStatusBadge = (status: UserTicket['status']) => {
    switch (status) {
      case 'Open':
        return <span className="badge badge-warning"><Clock size={12} style={{ marginRight: '4px' }} /> Open</span>;
      case 'In Progress':
        return <span className="badge badge-info"><Clock size={12} style={{ marginRight: '4px' }} /> In Progress</span>;
      case 'Resolved':
        return <span className="badge badge-success"><CheckCircle size={12} style={{ marginRight: '4px' }} /> Resolved</span>;
      case 'Closed':
        return <span className="badge badge-muted"><CheckCircle size={12} style={{ marginRight: '4px' }} /> Closed</span>;
      case 'Rejected':
        return <span className="badge badge-danger"><XCircle size={12} style={{ marginRight: '4px' }} /> Rejected</span>;
      default:
        return <span className="badge badge-muted">{status}</span>;
    }
  };

  const scrollSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-sans)',
      overflowY: 'auto'
    }}>
      {/* Navbar / Header */}
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
        justifyContent: 'between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            color: '#fff',
            boxShadow: 'var(--glow-indigo)'
          }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px' }}>IT HELPDESK</h1>
            <p style={{ fontSize: '11px', color: 'var(--accent-secondary)', fontWeight: 600 }}>UNTAG BANYUWANGI</p>
          </div>
        </div>

        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => scrollSection('hero')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Beranda</button>
          <button onClick={() => scrollSection('layanan')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Layanan</button>
          <button onClick={() => scrollSection('alur')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Alur</button>
          <button onClick={() => scrollSection('panduan')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Panduan</button>
          <button onClick={() => scrollSection('pengaduan')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Ajukan Tiket</button>
          <button onClick={() => scrollSection('status')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Cek Status</button>
          <button 
            onClick={onBackToLogin}
            className="btn-primary" 
            style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={14} /> Sign In
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" style={{
        padding: '80px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
        textAlign: 'center',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{
          padding: '6px 16px',
          borderRadius: '999px',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: 'var(--accent-primary)',
          fontSize: '13px',
          fontWeight: 600
        }}>
          Pusat Dukungan IT Civitas Akademika
        </div>
        <h2 style={{ fontSize: '48px', fontWeight: 800, maxWidth: '800px', lineHeight: '1.2' }}>
          Pusat Bantuan IT <span style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>UNTAG Banyuwangi</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', lineHeight: '1.6' }}>
          Mengalami kendala akun, jaringan, perangkat keras, atau perangkat lunak di lingkungan kampus? Kirim laporan Anda langsung ke Tim IT Helpdesk.
        </p>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <button onClick={() => scrollSection('pengaduan')} className="btn-primary" style={{ padding: '12px 24px', fontSize: '15px' }}>
            Ajukan Bantuan Sekarang
          </button>
          <button 
            onClick={() => scrollSection('status')} 
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '15px',
              transition: 'all 0.2s'
            }}
          >
            Cek Status Bantuan
          </button>
        </div>
      </section>

      {/* Informasi Layanan Section */}
      <section id="layanan" style={{ padding: '60px 32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Informasi Kategori Layanan Bantuan</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Pilih kategori bantuan yang sesuai dengan kendala yang Anda hadapi</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1 */}
          <div className="glass-card" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--accent-primary)', marginTop: '4px' }}><Mail size={24} /></div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Layanan Webmail</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>Pengaturan akun email resmi kampus (reset password, kendala pengiriman email, request pembuatan akun baru).</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-card" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--accent-primary)', marginTop: '4px' }}><HardDrive size={24} /></div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Kendala Teknis Hardware</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>Kerusakan fisik komputer laboratorium, proyektor kelas, printer kantor prodi, scanner, serta hardware lainnya.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-card" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--accent-primary)', marginTop: '4px' }}><Cpu size={24} /></div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Kendala Teknis Software</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>Masalah sistem operasi, instalasi aplikasi penunjang kuliah, aktivasi lisensi software, pembersihan virus / malware.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-card" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--accent-primary)', marginTop: '4px' }}><Wifi size={24} /></div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Kendala Jaringan & WiFi</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>Koneksi WiFi kampus lambat atau terputus, login portal Sistem Informasi Akademik (SIAKAD) error, akses e-learning.</p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="glass-card" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--accent-primary)', marginTop: '4px' }}><FileEdit size={24} /></div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Request Perubahan Data Website</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>Permintaan perubahan konten, pembaruan data dosen/prodi pada website resmi fakultas atau subdomain universitas.</p>
            </div>
          </div>

          {/* Card 6 */}
          <div className="glass-card" style={{ display: 'flex', gap: '16px' }}>
            <div style={{ color: 'var(--accent-primary)', marginTop: '4px' }}><UploadCloud size={24} /></div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>Request Publikasi Informasi</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5' }}>Permintaan unggah pamflet kegiatan, pengumuman beasiswa, berita prestasi mahasiswa di media digital universitas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Kerja Section */}
      <section id="alur" style={{ padding: '60px 32px', backgroundColor: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Alur Kerja Penanganan Tiket</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Bagaimana laporan Anda diproses oleh Tim IT Helpdesk</p>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px'
          }}>
            {/* Step 1 */}
            <div style={{ flex: '1 1 240px', textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '2px solid var(--accent-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                fontWeight: 700,
                fontSize: '20px',
                marginBottom: '16px'
              }}>1</div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Isi Formulir</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>Tulis identitas Anda dan jelaskan detail kendala secara rinci.</p>
            </div>

            <ChevronRight size={24} style={{ color: 'var(--text-muted)', display: 'none' }} className="step-arrow" />

            {/* Step 2 */}
            <div style={{ flex: '1 1 240px', textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '2px solid var(--accent-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-secondary)',
                fontWeight: 700,
                fontSize: '20px',
                marginBottom: '16px'
              }}>2</div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Verifikasi Laporan</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>Sistem mencatat tiket dan mendistribusikan ke admin pengelola.</p>
            </div>

            {/* Step 3 */}
            <div style={{ flex: '1 1 240px', textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '2px solid var(--color-success)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)',
                fontWeight: 700,
                fontSize: '20px',
                marginBottom: '16px'
              }}>3</div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Penanganan</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>Teknisi yang ditugaskan melakukan troubleshooting kendala.</p>
            </div>

            {/* Step 4 */}
            <div style={{ flex: '1 1 240px', textAlign: 'center', padding: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid var(--color-danger)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-danger)',
                fontWeight: 700,
                fontSize: '20px',
                marginBottom: '16px'
              }}>4</div>
              <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Selesai</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5' }}>Anda menerima solusi, status tiket berubah jadi resolved/closed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Panduan & FAQ Section */}
      <section id="panduan" style={{ padding: '60px 32px', maxWidth: '1000px', margin: '0 auto', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Panduan & FAQ Bantuan IT</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Pertanyaan umum dan cara penggunaan portal pengaduan</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
          <div className="glass-card">
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '8px' }}>Siapa saja yang bisa menggunakan portal ini?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>
              Portal ini terbuka untuk seluruh civitas akademika UNTAG Banyuwangi, meliputi Mahasiswa, Dosen, Tenaga Kependidikan (Tendik), Staf Rektorat, Staf Fakultas/Prodi, dan Pimpinan yang mengalami kendala terkait fasilitas IT di lingkungan kampus.
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '8px' }}>Bagaimana cara mengetahui perkembangan laporan saya?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>
              Setelah mengirimkan laporan, Anda akan mendapatkan Nomor Tiket (contoh: TKT-171922...). Anda dapat menyalin nomor tersebut dan memasukkannya ke kolom pencarian di bagian <strong>Cek Status Penanganan Tiket</strong> di bawah untuk memantau status secara langsung.
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '8px' }}>Berapa lama kendala saya akan ditangani?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>
              Waktu penanganan bergantung pada tingkat kerumitan kendala dan skala prioritas. Rata-rata laporan akan ditinjau dalam waktu 1x24 jam kerja oleh tim IT Rektorat.
            </p>
          </div>

          <div className="glass-card">
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--accent-secondary)', marginBottom: '8px' }}>Mengapa saya harus melampirkan foto bukti kendala?</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.6' }}>
              Melampirkan tangkapan layar (screenshot) error atau foto perangkat keras yang rusak akan sangat membantu teknisi kami dalam mendiagnosis masalah dengan cepat, sehingga mempercepat proses perbaikan.
            </p>
          </div>
        </div>
      </section>

      {/* Formulir Pengajuan Tiket Section */}
      <section id="pengaduan" style={{ padding: '60px 32px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Formulir Pengajuan Tiket Bantuan</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Silakan lengkapi formulir di bawah ini dengan informasi yang valid</p>
        </div>

        {submitSuccess && (
          <div className="glass-card" style={{ borderColor: 'var(--color-success)', marginBottom: '24px', backgroundColor: 'rgba(16, 185, 129, 0.08)', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-success)', marginBottom: '12px' }}><CheckCircle size={48} style={{ display: 'inline-block' }} /></div>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-success)' }}>Tiket Berhasil Dikirim!</h4>
            <p style={{ fontSize: '14px', marginTop: '8px', color: 'var(--text-secondary)' }}>
              Catat nomor tiket Anda untuk melacak status penanganan:
            </p>
            <div style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px dashed var(--border-active)',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '1px',
              marginTop: '12px',
              marginBottom: '12px'
            }}>
              {submitSuccess}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Status tiket juga dapat dipantau pada panel <strong>Cek Status</strong> di bawah.
            </p>
            <button onClick={() => setSubmitSuccess(null)} className="btn-primary" style={{ marginTop: '16px', padding: '8px 16px', fontSize: '13px' }}>Kirim Tiket Baru</button>
          </div>
        )}

        {submitError && (
          <div className="glass-card" style={{ borderColor: 'var(--color-danger)', marginBottom: '24px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-danger)', fontSize: '14px', padding: '16px', textAlign: 'center' }}>
            {submitError}
          </div>
        )}

        {!submitSuccess && (
          <form onSubmit={handleFormSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Nama Lengkap <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: Muhammad Fadil"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>NIP / NIM <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: 122110034 / 1989122501"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Kategori Pengguna (Unit) <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="Mahasiswa">Mahasiswa</option>
                  <option value="Dosen">Dosen</option>
                  <option value="Tendik">Tendik (Tenaga Kependidikan)</option>
                  <option value="Staf Rektorat">Staf Rektorat</option>
                  <option value="Staf Fakultas/Prodi">Staf Fakultas/Prodi</option>
                  <option value="Pimpinan">Pimpinan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Spesifikasi Unit/Instansi <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: Fakultas Teknik / Prodi Informatika"
                  value={unitSpecification}
                  onChange={(e) => setUnitSpecification(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Alamat Email Aktif <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="email" 
                  required 
                  placeholder="Contoh: fadil@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Nomor WhatsApp <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: 08123456789"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Kategori Layanan yang Dibutuhkan <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="Layanan Webmail">Layanan Webmail</option>
                <option value="Kendala Teknis Hardware">Kendala Teknis Hardware</option>
                <option value="Kendala Teknis Software">Kendala Teknis Software</option>
                <option value="Kendala Jaringan">Kendala Jaringan</option>
                <option value="Request Perubahan Data Website">Request Perubahan Data Website</option>
                <option value="Request Publikasi Informasi">Request Publikasi Informasi</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Deskripsi Detail Permasalahan <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <textarea 
                required 
                rows={5}
                placeholder="Tuliskan kendala secara jelas dan runut. Tuliskan kode error, merk perangkat, atau nama portal web jika relevan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Upload Foto Bukti Kendala</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '14px'
                }}
              />
              {imageUrl && (
                <div style={{ position: 'relative', marginTop: '10px', display: 'inline-block' }}>
                  <img src={imageUrl} alt="Preview Bukti" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                  <button 
                    type="button" 
                    onClick={() => setImageUrl(null)} 
                    style={{ 
                      position: 'absolute', 
                      top: '5px', 
                      left: '5px', 
                      backgroundColor: 'rgba(239, 68, 68, 0.9)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      padding: '4px 8px', 
                      fontSize: '11px',
                      cursor: 'pointer' 
                    }}
                  >
                    Hapus Foto
                  </button>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="btn-primary" 
              style={{ padding: '12px 24px', fontSize: '15px', justifyContent: 'center', marginTop: '10px' }}
            >
              {submitting ? 'Mengirim...' : 'Kirim Laporan Bantuan'} <Send size={16} />
            </button>
          </form>
        )}
      </section>

      {/* Cek Status Tiket Section */}
      <section id="status" style={{ padding: '60px 32px', backgroundColor: 'rgba(255, 255, 255, 0.01)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h3 style={{ fontSize: '28px', fontWeight: 700 }}>Cek Status Penanganan Tiket</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '8px' }}>Pantau perkembangan perbaikan atas kendala yang sudah Anda laporkan</p>
          </div>

          <form onSubmit={handleStatusSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                required
                placeholder="Masukkan Nomor Tiket Anda (contoh: TKT-171922...) atau NIP/NIM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 44px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '15px'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={searching}
              className="btn-primary" 
              style={{ padding: '0 24px', fontSize: '15px' }}
            >
              {searching ? 'Mencari...' : 'Cari'}
            </button>
          </form>

          {searchError && (
            <div className="glass-card" style={{ borderColor: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--color-danger)', fontSize: '14px', padding: '16px', textAlign: 'center' }}>
              {searchError}
            </div>
          )}

          {searchResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {searchResults.map((ticket) => (
                <div key={ticket.id} className="glass-card" style={{ borderLeft: `4px solid ${ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'var(--color-success)' : 'var(--color-warning)'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Nomor Tiket</span>
                      <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-secondary)' }}>{ticket.ticket_number}</h4>
                    </div>
                    <div>
                      {renderStatusBadge(ticket.status)}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '13.5px', marginBottom: '12px' }}>
                    <div>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Nama Pelapor</p>
                      <p style={{ fontWeight: 600 }}>{ticket.full_name} ({ticket.id_number})</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Kategori & Unit</p>
                      <p style={{ fontWeight: 600 }}>{ticket.category} - {ticket.unit_specification}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Layanan</p>
                      <p style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{ticket.service_type}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Waktu Laporan</p>
                      <p style={{ fontWeight: 600 }}>{ticket.created_at}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginBottom: '4px' }}>Deskripsi Permasalahan</p>
                    <p style={{ fontSize: '13.5px', lineHeight: '1.5' }}>{ticket.description}</p>
                  </div>

                  {ticket.image_url && (
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '12.5px', marginBottom: '4px' }}>Bukti Foto Kendala</p>
                      <img 
                        src={ticket.image_url} 
                        alt="Bukti Foto Kendala" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer' }}
                        onClick={() => window.open(ticket.image_url!, '_blank')} 
                      />
                    </div>
                  )}

                  {ticket.assigned_user_name && (
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-secondary)' }}></span>
                      Ditangani oleh Teknisi: <strong>{ticket.assigned_user_name}</strong>
                    </div>
                  )}

                  {ticket.resolution_notes && (
                    <div style={{ marginTop: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                      <p style={{ color: 'var(--color-success)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={14} /> Catatan Penyelesaian / Solusi IT Helpdesk:
                      </p>
                      <p style={{ fontSize: '13.5px', marginTop: '6px', fontStyle: 'italic', paddingLeft: '20px', color: 'var(--text-primary)' }}>
                        "{ticket.resolution_notes}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '40px 32px',
        textAlign: 'center',
        fontSize: '13.5px',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} /> ithelpdesk@untag-bwi.ac.id
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={16} /> 085864892610
            </span>
          </div>
          <div>
            © {new Date().getFullYear()} IT Helpdesk UNTAG Banyuwangi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
