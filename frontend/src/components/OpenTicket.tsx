import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Plus, Search, Filter } from 'lucide-react';
import { BACKEND_URL } from '../App';

interface Ticket {
  id: number;
  ticket_number: string;
  full_name: string;
  id_number: string;
  category: string;
  unit_specification: string;
  email: string;
  whatsapp_number: string;
  service_type: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assigned_user_name?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  full_name: string;
  id_number: string;
  category: string;
  unit_specification: string;
  email: string;
  whatsapp_number: string;
  service_type: string;
  description: string;
}

interface DashboardStats {
  total: number;
  open_count: number;
  in_progress_count: number;
  resolved_count: number;
  closed_count: number;
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

interface OpenTicketProps {
  token: string;
  userRole?: string;
}

export const OpenTicket: React.FC<OpenTicketProps> = ({ token, userRole = 'Teknisi' }) => {
  const [activeTab, setActiveTab] = useState<'submit' | 'list'>('submit');
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    id_number: '',
    category: '',
    unit_specification: '',
    email: '',
    whatsapp_number: '',
    service_type: '',
    description: '',
  });

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch tickets and stats
  useEffect(() => {
    if (activeTab === 'list') {
      fetchTickets();
      fetchStats();
    }
  }, [activeTab, searchTerm, statusFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/api/open-tickets?limit=50&offset=0`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      }
    } catch (err) {
      setError('Gagal mengambil data tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/open-tickets/stats/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Gagal mengambil stats');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    // Validate form
    if (!formData.full_name || !formData.id_number || !formData.category || !formData.email || !formData.whatsapp_number || !formData.service_type || !formData.description) {
      setError('Semua field harus diisi');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/open-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Ticket berhasil dibuat! Nomor Ticket: ${data.ticket_number}`);
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
        setTimeout(() => setMessage(''), 5000);
      } else {
        setError(data.error || 'Gagal membuat ticket');
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Open Ticket Management</h1>
          <p style={{ color: '#cbd5e1' }}>Kelola pengajuan bantuan IT Anda</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #334155' }}>
          <button
            onClick={() => setActiveTab('submit')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'submit' ? '#3b82f6' : 'transparent',
              color: activeTab === 'submit' ? '#fff' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '0.5rem 0.5rem 0 0',
              fontSize: '1rem',
              fontWeight: activeTab === 'submit' ? 'bold' : 'normal',
              transition: 'all 0.3s',
            }}
          >
            <Plus size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Pengajuan Ticket Baru
          </button>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === 'list' ? '#3b82f6' : 'transparent',
              color: activeTab === 'list' ? '#fff' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '0.5rem 0.5rem 0 0',
              fontSize: '1rem',
              fontWeight: activeTab === 'list' ? 'bold' : 'normal',
              transition: 'all 0.3s',
            }}
          >
            <Search size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Daftar Ticket
          </button>
        </div>

        {/* Submit Tab */}
        {activeTab === 'submit' && (
          <div style={{
            background: '#1e293b',
            borderRadius: '0.75rem',
            padding: '2rem',
            border: '1px solid #334155',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '1.5rem' }}>Ajukan Ticket Baru</h2>

            {error && (
              <div style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.5rem',
              }}>
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            {message && (
              <div style={{
                background: '#dcfce7',
                color: '#166534',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                gap: '0.5rem',
              }}>
                <CheckCircle size={20} />
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Nama Lengkap *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>NIP / NIM *</label>
                  <input
                    type="text"
                    name="id_number"
                    value={formData.id_number}
                    onChange={handleInputChange}
                    placeholder="Masukkan NIP atau NIM..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Kategori Pengguna *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Spesifikasi Unit</label>
                  <input
                    type="text"
                    name="unit_specification"
                    value={formData.unit_specification}
                    onChange={handleInputChange}
                    placeholder="Contoh: Fakultas Teknik / Prodi Informatika"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Email Aktif *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Masukkan email Anda..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Nomor WhatsApp *</label>
                  <input
                    type="tel"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleInputChange}
                    placeholder="Masukkan nomor WhatsApp..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Jenis Layanan *</label>
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <option value="">-- Pilih Jenis Layanan --</option>
                  {SERVICE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Deskripsi Masalah *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Jelaskan masalah yang Anda hadapi secara detail..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                    marginBottom: '1.5rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '0.75rem 2rem',
                  background: submitting ? '#64748b' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                }}
              >
                {submitting ? 'Mengirim...' : 'Ajukan Ticket'}
              </button>
            </form>
          </div>
        )}

        {/* List Tab */}
        {activeTab === 'list' && (
          <div>
            {/* Stats */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Tickets</p>
                  <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</p>
                </div>
                <div style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                  borderLeft: '4px solid #3b82f6',
                }}>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Open</p>
                  <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>{stats.open_count}</p>
                </div>
                <div style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                  borderLeft: '4px solid #f59e0b',
                }}>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>In Progress</p>
                  <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>{stats.in_progress_count}</p>
                </div>
                <div style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                  borderLeft: '4px solid #10b981',
                }}>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Resolved</p>
                  <p style={{ color: '#fff', fontSize: '2rem', fontWeight: 'bold' }}>{stats.resolved_count}</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Cari Ticket</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari berdasarkan nama, nomor ticket, email..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Filter Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="">Semua Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div style={{ textAlign: 'center', color: '#cbd5e1', padding: '2rem' }}>Loading...</div>
            ) : (
              <div style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '0.75rem',
                overflow: 'hidden',
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}>
                  <thead>
                    <tr style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
                      <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>No. Ticket</th>
                      <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Nama</th>
                      <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Layanan</th>
                      <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Dibuat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#cbd5e1' }}>
                          Tidak ada ticket ditemukan
                        </td>
                      </tr>
                    ) : (
                      tickets.map(ticket => (
                        <tr key={ticket.id} style={{ borderBottom: '1px solid #334155', hover: { background: '#334155' } }}>
                          <td style={{ padding: '1rem', color: '#fff', fontSize: '0.875rem', fontWeight: '500' }}>
                            {ticket.ticket_number}
                          </td>
                          <td style={{ padding: '1rem', color: '#e2e8f0' }}>
                            <div>{ticket.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ticket.email}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                            {ticket.service_type}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              ...{
                                'background': getStatusColor(ticket.status).split(' ')[0].replace('bg-', 'background-color: '),
                                'color': getStatusColor(ticket.status).split(' ')[1].replace('text-', 'color: '),
                              }
                            }} className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                            {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
