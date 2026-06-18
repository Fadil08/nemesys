import React, { useState } from 'react';
import type { CustomMission, User } from '../types';
import { Search, X, RefreshCw } from 'lucide-react';
import { BACKEND_URL } from '../App';

interface MissionPageProps {
  customMissions: CustomMission[];
  users: User[];
  token: string;
  onRefresh: () => void;
  isAdmin: boolean;
}

export const MissionPage: React.FC<MissionPageProps> = ({ customMissions, users, token, onRefresh, isAdmin }) => {
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missionId, setMissionId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState(1);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // New detail fields
  const [createdBy, setCreatedBy] = useState('');
  const [dateFinished, setDateFinished] = useState('');
  const [durationStr, setDurationStr] = useState('');
  const [note, setNote] = useState('');
  const [missionImage, setMissionImage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [status, setStatus] = useState('Active');

  // Detail view state
  const [detailMission, setDetailMission] = useState<CustomMission | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filters State
  const [searchTitle, setSearchTitle] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [msg, setMsg] = useState('');

  const resetForm = () => {
    setMissionId(null);
    setTitle('');
    setDescription('');
    setSlots(1);
    setSelectedUserIds([]);
    setCreatedBy('');
    setDateFinished('');
    setDurationStr('');
    setNote('');
    setMissionImage('');
    setProgressPercent(0);
    setStatus('Active');
  };

  const handleSaveMission = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    if (title.length > 50) {
      alert('Judul maksimal 50 karakter.');
      return;
    }

    const url = missionId 
      ? `${BACKEND_URL}/api/custom-missions/${missionId}` 
      : `${BACKEND_URL}/api/custom-missions`;
    
    const method = missionId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          slots,
          user_ids: selectedUserIds,
          progress_percent: progressPercent,
          status,
          created_by: createdBy,
          date_finished: dateFinished,
          duration_str: durationStr,
          note,
          mission_image: missionImage
        })
      });

      if (response.ok) {
        setMsg(missionId ? 'Mission berhasil diperbarui.' : 'Mission berhasil dibuat.');
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

  const handleDeleteMission = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mission ini?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/custom-missions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete mission:', error);
    }
  };

  const handleEditMission = (m: CustomMission) => {
    setMissionId(m.id);
    setTitle(m.title);
    setDescription(m.description || '');
    setSlots(m.slots);
    setSelectedUserIds(m.personnels.map(p => p.id));
    setCreatedBy(m.created_by || '');
    setDateFinished(m.date_finished || '');
    setDurationStr(m.duration_str || '');
    setNote(m.note || '');
    setMissionImage(m.mission_image || '');
    setProgressPercent(m.progress_percent || 0);
    setStatus(m.status || 'Active');
    setIsModalOpen(true);
  };

  // Toggle multiple personnel selection
  const handleToggleUserSelect = (userId: number) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  // filter only technicians
  const technicians = users.filter(u => u.role === 'Teknisi');

  // Filter logic
  const filteredMissions = customMissions.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchStatus = statusFilter === 'All' ? true : m.status === statusFilter;
    const matchDate = dateFilter ? m.created_at.includes(dateFilter.split('-')[2]) : true;
    return matchSearch && matchStatus && matchDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Telegram Warning Banner */}
      <div style={{
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        color: '#fbbf24',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600
      }}>
        Jangan Lupa start di Bot Telegram @zabbix_unej_bot
      </div>

      {msg && (
        <div style={{
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          color: 'var(--accent-primary)',
          padding: '12px', borderRadius: '8px', border: '1px solid var(--border-active)',
          fontSize: '13.5px', textAlign: 'center'
        }}>
          {msg}
        </div>
      )}

      {/* Main Header / Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Mission</h3>
      </div>

      {/* Action Button */}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            style={{
              backgroundColor: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }}
          >
            Create Mission +
          </button>
        </div>
      )}

      {/* Control bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
            {/* Search Box */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search Title"
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '8px 12px 8px 36px',
                  color: '#fff',
                  fontSize: '13.5px',
                  width: '240px',
                }}
              />
            </div>

            {/* Date picker */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            />

            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13.5px',
                cursor: 'pointer',
              }}
            >
              <option value="All">Status (All)</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Refresh every 1m</span>
            <button
              onClick={onRefresh}
              style={{
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} /> Refresh Now
            </button>
          </div>
        </div>

        {/* Table list */}
        <div className="table-container" style={{ marginTop: '8px' }}>
          {filteredMissions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Tidak ada mission yang terdaftar.
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>NO</th>
                  <th>TITLE</th>
                  <th>PERSONELS</th>
                  <th>SLOT</th>
                  <th>PROGRESS</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissions.map((m, idx) => {
                  const filledSlots = m.personnels.length;
                  const slotsTotal = m.slots;
                  return (
                    <tr key={m.id}>
                      <td>{idx + 1}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{m.title}</span>
                        {m.description && (
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {m.description}
                          </div>
                        )}
                      </td>
                      <td>
                        {/* Personels stack avatars */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {m.personnels.map(p => (
                            <div
                              key={p.id}
                              title={`${p.name} (${p.role})`}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                border: '2px solid var(--border-color)',
                                cursor: 'help'
                              }}
                            >
                              {p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                            </div>
                          ))}
                          {m.personnels.length === 0 && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Belum ada</span>
                          )}
                        </div>
                      </td>
                      <td>{filledSlots}/{slotsTotal}</td>
                      <td>
                        <span style={{
                          color: '#22c55e',
                          fontWeight: 700,
                          fontSize: '13.5px'
                        }}>
                          {m.progress_percent}% Finish
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {m.created_at}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {/* Detail/Join button */}
                          <button
                            onClick={() => { setDetailMission(m); setIsDetailOpen(true); }}
                            style={{
                              backgroundColor: '#6366f1',
                              border: 'none',
                              color: '#fff',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            Details
                          </button>

                          {/* Badge Status */}
                          <span style={{
                            backgroundColor: filledSlots >= slotsTotal ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                            color: filledSlots >= slotsTotal ? '#ef4444' : '#22c55e',
                            border: `1px solid ${filledSlots >= slotsTotal ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            {filledSlots >= slotsTotal ? 'Slot Full' : 'Open Slot'}
                          </span>

                          <span style={{
                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                            color: '#22c55e',
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600
                          }}>
                            Mission Complete
                          </span>

                          {/* Admin Edit/Delete */}
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditMission(m)}
                                style={{ backgroundColor: '#eab308', border: 'none', color: '#000', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMission(m.id)}
                                style={{ backgroundColor: '#ef4444', border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Create/Edit Mission */}
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
            maxWidth: '600px',
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
              {missionId ? 'Edit Mission' : 'Create New Mission'}
            </h3>

            <form onSubmit={handleSaveMission} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Title (Max 50 Char)</label>
                <input
                  type="text"
                  required
                  placeholder="Title..."
                  maxLength={50}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                />
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</label>
                <textarea
                  placeholder="Enter mission description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Slot */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Slot Personnel</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={slots}
                    onChange={(e) => setSlots(parseInt(e.target.value) || 1)}
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                  />
                </div>

                {/* Progress Percent */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={progressPercent}
                    onChange={(e) => setProgressPercent(parseInt(e.target.value) || 0)}
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Created By */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Created By</label>
                  <input
                    type="text"
                    placeholder="e.g. Rizky Hidayatullah"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                  />
                </div>

                {/* Status dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff', cursor: 'pointer' }}
                  >
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Incompleted">Incompleted</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Date Finished */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Date Finished</label>
                  <input
                    type="text"
                    placeholder="e.g. 09 April 2026 - 17.52"
                    value={dateFinished}
                    onChange={(e) => setDateFinished(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                  />
                </div>

                {/* Duration */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 3586 jam 17 menit"
                    value={durationStr}
                    onChange={(e) => setDurationStr(e.target.value)}
                    style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                  />
                </div>
              </div>

              {/* Note */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Note</label>
                <input
                  type="text"
                  placeholder="e.g. switch perlu gantti"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                />
              </div>

              {/* Mission Image URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Mission Image (URL or Name)</label>
                <input
                  type="text"
                  placeholder="e.g. https://example.com/mission.jpg"
                  value={missionImage}
                  onChange={(e) => setMissionImage(e.target.value)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#fff' }}
                />
              </div>

              {/* Select Available Personel Multiple Selection */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Select Available Personel</label>
                <div style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  padding: '8px'
                }}>
                  {technicians.map(t => {
                    const isSelected = selectedUserIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleUserSelect(t.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                          color: isSelected ? 'var(--accent-primary)' : '#fff',
                          fontWeight: isSelected ? 600 : 400,
                          fontSize: '13.5px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.02)'
                        }}
                      >
                        <span>{t.name} (@{t.username})</span>
                        {isSelected && <span style={{ fontSize: '12px' }}>✓ Selected</span>}
                      </div>
                    );
                  })}
                  {technicians.length === 0 && (
                    <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Tidak ada personel teknisi tersedia
                    </div>
                  )}
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
                  Save Mission
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

      {/* Detail Mission Modal (Premium White Design matching user screenshot) */}
      {isDetailOpen && detailMission && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            color: '#1e293b',
            width: '100%',
            maxWidth: '780px',
            borderRadius: '8px',
            padding: '24px 32px 32px 32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative',
            fontFamily: '"Inter", "Outfit", -apple-system, sans-serif'
          }}>
            {/* Top Right X Close Button */}
            <button
              onClick={() => setIsDetailOpen(false)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '24px',
                lineHeight: '1'
              }}
            >
              &times;
            </button>

            {/* Title Header */}
            <h2 style={{
              margin: '0 0 24px 0',
              fontSize: '18px',
              fontWeight: 500,
              color: '#475569',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px'
            }}>
              Detail Mission {detailMission.title}
            </h2>

            {/* Layout Split: Left Image, Right Details */}
            <div style={{
              display: 'flex',
              gap: '32px',
              alignItems: 'flex-start',
              flexWrap: 'wrap'
            }}>
              {/* Left Column: Image */}
              <div style={{
                flex: '1 1 300px',
                maxWidth: '360px'
              }}>
                <img
                  src={
                    detailMission.mission_image && (detailMission.mission_image.startsWith('http') || detailMission.mission_image.startsWith('/'))
                      ? detailMission.mission_image
                      : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
                  }
                  alt="Mission compass"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '4px',
                    display: 'block',
                    objectFit: 'cover',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </div>

              {/* Right Column: Details List */}
              <div style={{
                flex: '1 1 300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '14.5px',
                color: '#334155'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', minWidth: '130px', textAlign: 'right' }}>Description:</span>
                  <span style={{ flex: 1 }}>{detailMission.description || '-'}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', minWidth: '130px', textAlign: 'right' }}>Personel/Slot:</span>
                  <span style={{ flex: 1 }}>{detailMission.personnels.length} / {detailMission.slots}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', minWidth: '130px', textAlign: 'right' }}>Progress:</span>
                  <span style={{ flex: 1, fontWeight: 600 }}>{detailMission.progress_percent || 0}%</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', minWidth: '130px', textAlign: 'right' }}>Created By:</span>
                  <span style={{ flex: 1 }}>{detailMission.created_by || '-'}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', minWidth: '130px', textAlign: 'right' }}>Date Created:</span>
                  <span style={{ flex: 1 }}>{detailMission.created_at}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', minWidth: '130px', textAlign: 'right' }}>Date Finished:</span>
                  <span style={{ flex: 1 }}>{detailMission.date_finished || '-'}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', minWidth: '130px', textAlign: 'right' }}>Duration:</span>
                  <span style={{ flex: 1 }}>{detailMission.duration_str || '-'}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', minWidth: '130px', textAlign: 'right' }}>Note:</span>
                  <span style={{ flex: 1 }}>{detailMission.note || '-'}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontWeight: 700, color: '#64748b', minWidth: '130px', textAlign: 'right' }}>Status:</span>
                  <span style={{
                    flex: 1,
                    fontWeight: 600,
                    color: detailMission.status === 'Completed' ? '#16a34a' : detailMission.status === 'In Progress' ? '#d97706' : detailMission.status === 'Incompleted' ? '#dc2626' : '#2563eb'
                  }}>{detailMission.status || 'Active'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Close Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '32px'
            }}>
              <button
                onClick={() => setIsDetailOpen(false)}
                style={{
                  backgroundColor: '#828fa3',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 20px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#64748b')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#828fa3')}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
