import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  UserPlus, 
  CheckSquare, 
  Clock, 
  User,
  X
} from 'lucide-react';
import { BACKEND_URL } from '../App';
import type { UserTicket, User as TechUser } from '../types';

interface CivitasTicketsProps {
  token: string;
  currentUser: { id: number; name: string; role: 'Administrator' | 'Manager' | 'Teknisi' };
  users: TechUser[];
  onRefresh: () => void;
}

export const CivitasTickets: React.FC<CivitasTicketsProps> = ({ token, currentUser, users, onRefresh }) => {
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter tab
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Assign action state
  const [assigningTicketId, setAssigningTicketId] = useState<number | null>(null);
  const [selectedTechId, setSelectedTechId] = useState<string>('');

  // Resolve action state
  const [resolvingTicket, setResolvingTicket] = useState<UserTicket | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'Resolved' | 'Closed' | 'Rejected'>('Resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data);
      } else {
        setError(data.error || 'Gagal memuat tiket civitas.');
      }
    } catch (err) {
      setError('Gagal menghubungi server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const handleAssign = async (e: React.FormEvent, ticketId: number) => {
    e.preventDefault();
    if (!selectedTechId) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: parseInt(selectedTechId) })
      });

      const data = await response.json();
      if (response.ok) {
        setAssigningTicketId(null);
        setSelectedTechId('');
        fetchTickets();
        onRefresh(); // trigger refresh globally
      } else {
        alert(data.error || 'Gagal menugaskan teknisi.');
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/tickets/${resolvingTicket.id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: resolutionStatus,
          resolution_notes: resolutionNotes
        })
      });

      const data = await response.json();
      if (response.ok) {
        setResolvingTicket(null);
        setResolutionNotes('');
        fetchTickets();
        onRefresh(); // trigger refresh globally
      } else {
        alert(data.error || 'Gagal mengupdate status tiket.');
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'All') return true;
    return t.status === filterStatus;
  });

  const technicians = users.filter((u) => u.role === 'Teknisi');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Overview Cards */}
      <div className="grid-dashboard">
        <div className="glass-card stat-card">
          <div className="stat-info">
            <h4>Total Tiket Civitas</h4>
            <p>{tickets.length}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <ClipboardList size={22} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h4>Tiket Baru (Open)</h4>
            <p>{tickets.filter(t => t.status === 'Open').length}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h4>Dalam Proses</h4>
            <p>{tickets.filter(t => t.status === 'In Progress').length}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-info)' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h4>Selesai / Ditutup</h4>
            <p>{tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
            <CheckSquare size={22} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="btn-primary"
              style={{
                background: filterStatus === status ? 'linear-gradient(135deg, var(--accent-primary), #4f46e5)' : 'rgba(255, 255, 255, 0.03)',
                color: filterStatus === status ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                padding: '6px 14px',
                fontSize: '13px',
                borderRadius: '8px'
              }}
            >
              {status} ({status === 'All' ? tickets.length : tickets.filter(t => t.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Error or Loading */}
      {error && (
        <div className="glass-card" style={{ borderColor: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
          {error}
        </div>
      )}

      {loading && tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Memuat data tiket...</div>
      ) : (
        <div className="glass-card" style={{ padding: '0 24px 24px 24px' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>No. Tiket / Pelapor</th>
                  <th>Kategori & Unit</th>
                  <th>Layanan Bantuan</th>
                  <th>Permasalahan</th>
                  <th>Status</th>
                  <th>Teknisi Ditugaskan</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
                      Tidak ada tiket dengan status ini.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>
                        <strong style={{ color: 'var(--accent-secondary)' }}>{ticket.ticket_number}</strong>
                        <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{ticket.full_name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>NIM/NIP: {ticket.id_number}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{ticket.category}</span>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ticket.unit_specification}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--accent-primary)', fontSize: '13px' }}>{ticket.service_type}</span>
                      </td>
                      <td>
                        <div style={{ maxWidth: '280px', fontSize: '13px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }} title={ticket.description}>
                          {ticket.description}
                        </div>
                        {ticket.image_url && (
                          <div style={{ marginTop: '8px' }}>
                            <img 
                              src={ticket.image_url} 
                              alt="Bukti Foto" 
                              style={{ 
                                maxWidth: '100px', 
                                maxHeight: '60px', 
                                borderRadius: '4px', 
                                border: '1px solid var(--border-color)', 
                                cursor: 'pointer',
                                display: 'block' 
                              }} 
                              onClick={() => window.open(ticket.image_url!, '_blank')}
                              title="Klik untuk memperbesar"
                            />
                          </div>
                        )}
                        {ticket.resolution_notes && (
                          <div style={{ marginTop: '8px', padding: '6px 10px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '12px' }}>
                            <strong style={{ color: 'var(--color-success)' }}>Solusi:</strong> "{ticket.resolution_notes}"
                          </div>
                        )}
                      </td>
                      <td>
                        {ticket.status === 'Open' && <span className="badge badge-warning">Open</span>}
                        {ticket.status === 'In Progress' && <span className="badge badge-info">In Progress</span>}
                        {ticket.status === 'Resolved' && <span className="badge badge-success">Resolved</span>}
                        {ticket.status === 'Closed' && <span className="badge badge-muted">Closed</span>}
                        {ticket.status === 'Rejected' && <span className="badge badge-danger">Rejected</span>}
                      </td>
                      <td>
                        {ticket.assigned_user_name ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                            <User size={14} style={{ color: 'var(--accent-secondary)' }} />
                            <span>{ticket.assigned_user_name}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Belum Ditugaskan</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {/* Assign action for Administrators / Managers */}
                          {(currentUser.role === 'Administrator' || currentUser.role === 'Manager') && 
                            (ticket.status === 'Open' || ticket.status === 'In Progress') && (
                              <button
                                onClick={() => setAssigningTicketId(ticket.id)}
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Tugaskan Teknisi"
                              >
                                <UserPlus size={14} /> Tugaskan
                              </button>
                          )}

                          {/* Resolve action for Assigned Technician or Administrator */}
                          {(ticket.status === 'Open' || ticket.status === 'In Progress') && 
                            (currentUser.role === 'Administrator' || ticket.assigned_user_id === currentUser.id) && (
                              <button
                                onClick={() => {
                                  setResolvingTicket(ticket);
                                  setResolutionStatus(ticket.status === 'In Progress' ? 'Resolved' : 'Resolved');
                                }}
                                className="btn-primary"
                                style={{ 
                                  padding: '6px 12px', 
                                  fontSize: '12px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '4px',
                                  background: 'linear-gradient(135deg, var(--color-success), #047857)'
                                }}
                                title="Selesaikan Tiket"
                              >
                                <CheckSquare size={14} /> Selesaikan
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Dialog overlay/modal */}
      {assigningTicketId !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', position: 'relative' }}>
            <button 
              onClick={() => setAssigningTicketId(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Tugaskan Teknisi</h3>
            <form onSubmit={(e) => handleAssign(e, assigningTicketId)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pilih Teknisi</label>
                <select
                  required
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="">-- Pilih Teknisi --</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.status} - {t.daily_tasks_count} Tugas aktif)
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Tugaskan Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Dialog overlay/modal */}
      {resolvingTicket !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '24px', position: 'relative' }}>
            <button 
              onClick={() => setResolvingTicket(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Penyelesaian Tiket Bantuan</h3>
            <form onSubmit={handleResolve} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status Tiket Akhir</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <option value="Resolved">Resolved (Terselesaikan)</option>
                  <option value="Closed">Closed (Ditutup)</option>
                  <option value="Rejected">Rejected (Ditolak / Salah Laporan)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Catatan Solusi / Penyelesaian</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Deskripsikan tindakan pemecahan masalah / solusi IT yang telah dilakukan agar pelapor dapat melihat solusi tersebut..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '14px',
                    resize: 'none'
                  }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-success), #047857)' }}>
                Simpan & Update Tiket
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
