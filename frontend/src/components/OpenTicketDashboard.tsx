import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Trash2, Edit2, User, Clock } from 'lucide-react';
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
  assigned_user_id?: number;
  assigned_user_name?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  role: string;
}

interface OpenTicketDashboardProps {
  token: string;
  userRole?: string;
}

export const OpenTicketDashboard: React.FC<OpenTicketDashboardProps> = ({ token, userRole = 'Manager' }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Ticket>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch tickets and technicians
  useEffect(() => {
    fetchTickets();
    fetchTechnicians();
  }, [statusFilter, searchTerm]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let url = `${BACKEND_URL}/api/open-tickets?limit=100&offset=0`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      } else {
        setError('Gagal mengambil data tickets');
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const techs = data.filter((u: User) => u.role === 'Teknisi');
        setTechnicians(techs);
      }
    } catch (err) {
      console.error('Gagal mengambil data technicians');
    }
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setEditFormData(ticket);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedTicket) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/open-tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setMessage('Ticket berhasil diupdate');
        setShowEditModal(false);
        fetchTickets();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Gagal mengupdate ticket');
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    }
  };

  const handleDeleteTicket = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ticket ini?')) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/open-tickets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setMessage('Ticket berhasil dihapus');
        fetchTickets();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Gagal menghapus ticket');
      }
    } catch (err) {
      setError('Gagal menghubungi server');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return { bg: '#eff6ff', text: '#0c4a6e' };
      case 'In Progress': return { bg: '#fffbeb', text: '#78350f' };
      case 'Resolved': return { bg: '#f0fdf4', text: '#166534' };
      case 'Closed': return { bg: '#f3f4f6', text: '#374151' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Open': return '#3b82f6';
      case 'In Progress': return '#f59e0b';
      case 'Resolved': return '#10b981';
      case 'Closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Dashboard Manajemen Open Tickets</h1>
          <p style={{ color: '#cbd5e1' }}>Kelola dan monitoring semua pengajuan bantuan IT</p>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
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
            marginBottom: '1rem',
            display: 'flex',
            gap: '0.5rem',
          }}>
            <CheckCircle size={20} />
            {message}
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
                  <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Nama / Email</th>
                  <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Layanan</th>
                  <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600' }}>Assigned To</th>
                  <th style={{ padding: '1rem', color: '#cbd5e1', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#cbd5e1' }}>
                      Tidak ada ticket ditemukan
                    </td>
                  </tr>
                ) : (
                  tickets.map(ticket => (
                    <tr key={ticket.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={{ padding: '1rem', color: '#fff', fontSize: '0.875rem', fontWeight: '500' }}>
                        {ticket.ticket_number}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{ticket.full_name}</div>
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
                          background: getStatusBgColor(ticket.status),
                          color: '#fff',
                        }}>
                          {ticket.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
                        {ticket.assigned_user_name ? (
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <User size={16} />
                            {ticket.assigned_user_name}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Not Assigned</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowDetailModal(true);
                          }}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            marginRight: '0.5rem',
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditTicket(ticket)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            marginRight: '0.5rem',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          style={{
                            padding: '0.5rem 0.75rem',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid #334155',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '1rem' }}>
              Ticket: {selectedTicket.ticket_number}
            </h2>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Nama Lengkap</p>
                <p style={{ color: '#e2e8f0' }}>{selectedTicket.full_name}</p>
              </div>

              <div>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Email</p>
                <p style={{ color: '#e2e8f0' }}>{selectedTicket.email}</p>
              </div>

              <div>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>WhatsApp</p>
                <p style={{ color: '#e2e8f0' }}>{selectedTicket.whatsapp_number}</p>
              </div>

              <div>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Kategori</p>
                <p style={{ color: '#e2e8f0' }}>{selectedTicket.category}</p>
              </div>

              <div>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Jenis Layanan</p>
                <p style={{ color: '#e2e8f0' }}>{selectedTicket.service_type}</p>
              </div>

              <div>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Status</p>
                <p style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: getStatusBgColor(selectedTicket.status),
                  color: '#fff',
                }}>
                  {selectedTicket.status}
                </p>
              </div>

              <div>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Deskripsi Masalah</p>
                <p style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{selectedTicket.description}</p>
              </div>

              {selectedTicket.resolution_notes && (
                <div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Catatan Resolusi</p>
                  <p style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{selectedTicket.resolution_notes}</p>
                </div>
              )}

              <div>
                <p style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>Dibuat</p>
                <p style={{ color: '#e2e8f0' }}>{new Date(selectedTicket.created_at).toLocaleString('id-ID')}</p>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTicket && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid #334155',
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '1.5rem' }}>
              Edit Ticket: {selectedTicket.ticket_number}
            </h2>

            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Status</label>
                <select
                  value={editFormData.status || selectedTicket.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
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
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Assign To Technician</label>
                <select
                  value={editFormData.assigned_user_id || selectedTicket.assigned_user_id || ''}
                  onChange={(e) => {
                    const tech = technicians.find(t => t.id === parseInt(e.target.value));
                    setEditFormData({
                      ...editFormData,
                      assigned_user_id: tech ? tech.id : undefined,
                      assigned_user_name: tech ? tech.name : undefined,
                    });
                  }}
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
                  <option value="">-- Pilih Technician --</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Resolution Notes</label>
                <textarea
                  value={editFormData.resolution_notes || selectedTicket.resolution_notes || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, resolution_notes: e.target.value })}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                  placeholder="Tambahkan catatan tentang penyelesaian ticket..."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: '0.75rem',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: '0.75rem',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
