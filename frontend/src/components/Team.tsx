import React, { useState } from 'react';
import type { User } from '../types';
import { PhoneCall, CheckCircle, Clock, Plus, X } from 'lucide-react';

interface TeamProps {
  users: User[];
  token: string;
  isAdmin: boolean;
  onRefresh: () => void;
}

export const Team: React.FC<TeamProps> = ({ users, token, isAdmin, onRefresh }) => {
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Administrator' | 'Manager' | 'Teknisi'>('Teknisi');
  const [status, setStatus] = useState<'Available' | 'Busy'>('Available');
  const [dailyTasksCount, setDailyTasksCount] = useState(0);
  const [missionCompleted, setMissionCompleted] = useState(0);
  const [missionIncompleted, setMissionIncompleted] = useState(0);
  const [msg, setMsg] = useState('');

  const resetForm = () => {
    setUserId(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('Teknisi');
    setStatus('Available');
    setDailyTasksCount(0);
    setMissionCompleted(0);
    setMissionIncompleted(0);
    setMsg('');
  };

  const handleCall = (name: string) => {
    alert(`Menghubungi ${name} via VoIP/Telegram Call...`);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const url = userId 
      ? `http://localhost:5000/api/users/${userId}` 
      : 'http://localhost:5000/api/users';
    
    const method = userId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          username,
          password: password || undefined,
          role,
          status,
          daily_tasks_count: dailyTasksCount,
          mission_completed: missionCompleted,
          mission_incompleted: missionIncompleted
        })
      });

      if (response.ok) {
        alert(userId ? 'User berhasil diperbarui.' : 'User berhasil dibuat.');
        resetForm();
        setIsModalOpen(false);
        onRefresh();
      } else {
        const err = await response.json();
        setMsg(`Error: ${err.error}`);
      }
    } catch (error) {
      setMsg('Gagal menghubungi server.');
    }
  };

  const handleEditUser = (u: User) => {
    setUserId(u.id);
    setName(u.name);
    setUsername(u.username);
    setPassword('');
    setRole(u.role);
    setStatus(u.status || 'Available');
    setDailyTasksCount(u.daily_tasks_count || 0);
    setMissionCompleted(u.mission_completed || 0);
    setMissionIncompleted(u.mission_incompleted || 0);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        onRefresh();
      } else {
        const err = await response.json();
        alert(`Gagal: ${err.error}`);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ margin: 0 }}>Pemantauan Live Tim Lapangan</h3>
        {isAdmin && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            style={{
              backgroundColor: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }}
          >
            <Plus size={14} /> Add Team Member
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status Ketersediaan</th>
              <th>Beban Tugas Aktif</th>
              <th>Mission Completed</th>
              <th>Mission Incompleted</th>
              <th>Aksi Cepat</th>
            </tr>
          </thead>
          <tbody>
            {users.map((tech) => (
              <tr key={tech.id}>
                <td>
                  <span style={{ fontWeight: 600 }}>{tech.name}</span>
                </td>
                <td>@{tech.username}</td>
                <td>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: tech.role === 'Administrator' ? 'rgba(239, 68, 68, 0.15)' : tech.role === 'Manager' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    color: tech.role === 'Administrator' ? '#ef4444' : tech.role === 'Manager' ? '#6366f1' : '#22c55e',
                    fontWeight: 600
                  }}>
                    {tech.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      tech.status === 'Available' ? 'badge-success' : 'badge-warning'
                    }`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: tech.status === 'Available' ? 'var(--color-success)' : 'var(--color-warning)',
                      }}
                    />
                    {tech.status || 'Available'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: (tech.daily_tasks_count || 0) > 2 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                        color: (tech.daily_tasks_count || 0) > 2 ? 'var(--color-danger)' : 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: (tech.daily_tasks_count || 0) > 2 ? '1px solid rgba(239,68,68,0.3)' : '1px solid var(--border-color)',
                      }}
                    >
                      {tech.daily_tasks_count || 0}
                    </span>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      Tugas Aktif
                    </span>
                  </div>
                </td>
                <td>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} />
                    {tech.mission_completed || 0} Misi
                  </span>
                </td>
                <td>
                  <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} />
                    {tech.mission_incompleted || 0} Misi
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      className="btn-primary"
                      onClick={() => handleCall(tech.name)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        background: 'linear-gradient(135deg, var(--color-success), #059669)',
                      }}
                    >
                      <PhoneCall size={12} />
                      Call Now
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleEditUser(tech)}
                          style={{
                            backgroundColor: '#eab308',
                            border: 'none',
                            color: '#000',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(tech.id)}
                          style={{
                            backgroundColor: '#ef4444',
                            border: 'none',
                            color: '#fff',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit Member */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            color: '#fff',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#fff' }}>
              {userId ? 'Edit Team Member' : 'Add Team Member'}
            </h3>

            {msg && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '16px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                {msg}
              </div>
            )}

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rizal Kurniawan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                />
              </div>

              {/* Username */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rizal_tech"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password {userId && '(Leave blank to keep current)'}</label>
                <input
                  type="password"
                  required={!userId}
                  placeholder="Password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                />
              </div>

              {/* Role */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Teknisi">Teknisi</option>
                </select>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff', cursor: 'pointer' }}
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {/* Active Tasks Count (Read Only / Disabled) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Tasks</label>
                  <input
                    type="number"
                    disabled
                    value={dailyTasksCount}
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#94a3b8', cursor: 'not-allowed' }}
                  />
                </div>

                {/* Mission Completed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Misi Selesai</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={missionCompleted}
                    onChange={(e) => setMissionCompleted(parseInt(e.target.value) || 0)}
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                  />
                </div>

                {/* Mission Incompleted */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>Misi Gagal</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={missionIncompleted}
                    onChange={(e) => setMissionIncompleted(parseInt(e.target.value) || 0)}
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    backgroundColor: '#22c55e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Member
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#cbd5e1',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
