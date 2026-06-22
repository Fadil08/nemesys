import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Send, Ticket } from 'lucide-react';
import { BACKEND_URL } from '../App';

interface PublicTicketSubmitProps {
  onClose?: () => void;
}

const SERVICE_TYPES = [
  'Layanan Webmail',
  'Kendala Teknis Hardware',
  'Kendala Teknis Software',
  'Kendala Jaringan',
  'Request Perubahan Data Website',
  'Request Publikasi Informasi',
];

const CATEGORIES = [
  'Mahasiswa',
  'Staf Rektorat',
  'Staf Fakultas/Prodi',
  'Pimpinan',
  'Lainnya',
];

export const PublicTicketSubmit: React.FC<PublicTicketSubmitProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    id_number: '',
    category: '',
    unit_specification: '',
    email: '',
    whatsapp_number: '',
    service_type: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [ticketNumber, setTicketNumber] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate
    if (!formData.full_name || !formData.id_number || !formData.category || !formData.email || !formData.whatsapp_number || !formData.service_type || !formData.description) {
      setMessage({ type: 'error', text: 'Semua field harus diisi' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/public/submit-ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setTicketNumber(data.ticket_number);
        setMessage({ type: 'success', text: `Ticket berhasil dibuat! Nomor Ticket: ${data.ticket_number}` });
        setFormData({
          full_name: '',
          id_number: '',
          category: '',
          unit_specification: '',
          email: '',
          whatsapp_number: '',
          service_type: '',
          description: '',
        });
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Gagal membuat ticket' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Gagal menghubungi server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <Ticket size={40} style={{ color: '#667eea' }} />
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0,
          }}>
            Ajukan Ticket Bantuan IT
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Isi formulir di bawah untuk melaporkan masalah IT Anda
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div style={{
            background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: message.type === 'success' ? '#047857' : '#991b1b',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Full Name */}
            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}>
                Nama Lengkap *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Masukkan nama lengkap..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* ID Number */}
            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}>
                NIP / NIM *
              </label>
              <input
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleInputChange}
                placeholder="Masukkan NIP atau NIM..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}>
                Kategori Pengguna *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">-- Pilih Kategori --</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Unit Specification */}
            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}>
                Spesifikasi Unit
              </label>
              <input
                type="text"
                name="unit_specification"
                value={formData.unit_specification}
                onChange={handleInputChange}
                placeholder="Contoh: Fakultas Teknik"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}>
                Email Aktif *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Masukkan email Anda..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}>
                Nomor WhatsApp *
              </label>
              <input
                type="tel"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleInputChange}
                placeholder="Masukkan nomor WhatsApp..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Service Type */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              Jenis Layanan *
            </label>
            <select
              name="service_type"
              value={formData.service_type}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            >
              <option value="">-- Pilih Jenis Layanan --</option>
              {SERVICE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}>
              Deskripsi Masalah *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Jelaskan masalah yang Anda hadapi secara detail..."
              rows={5}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#d1d5db' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.3s',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Send size={20} />
            {loading ? 'Mengirim...' : 'Ajukan Ticket'}
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '0.5rem',
              }}
            >
              Batal
            </button>
          )}
        </form>

        {/* Footer Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            📧 Email: <strong>ithelpdesk@uninus.ac.id</strong>
          </p>
          <p style={{ margin: 0 }}>
            💬 WhatsApp: <strong>+62 858-6489-2610</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
