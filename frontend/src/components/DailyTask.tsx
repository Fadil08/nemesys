import React, { useState } from 'react';
import type { DailyTask as ITask, User, Mission, DailyTodo, Device } from '../types';
import { ClipboardList, Target, Award, CheckCircle, AlertTriangle, X, Download } from 'lucide-react';

interface DailyTaskProps {
  tasks: ITask[];
  users: User[];
  missions: Mission[];
  onAssignTask: (taskId: number, userId: number) => void;
  dailyTodos: DailyTodo[];
  token: string;
  onRefresh: () => void;
  devices: Device[];
}

export const DailyTaskComponent: React.FC<DailyTaskProps> = ({ tasks, users, missions, onAssignTask, dailyTodos, token, onRefresh, devices }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'missions' | 'checklist'>('checklist');
  const [todoId, setTodoId] = useState<number | null>(null);
  const [taskName, setTaskName] = useState('');
  const [isTodoModalOpen, setIsTodoModalOpen] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [completeTaskId, setCompleteTaskId] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
  const [newStepText, setNewStepText] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | ''>('');
  const [ticketSeverity, setTicketSeverity] = useState<'Warning' | 'Alert' | 'Emergency'>('Alert');
  const [ticketSla, setTicketSla] = useState<number>(30);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId) return;

    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deviceId: Number(selectedDeviceId),
          severity: ticketSeverity,
          slaMinutes: ticketSla
        })
      });

      if (response.ok) {
        setMsg('Tiket gangguan berhasil dibuat secara manual.');
        setIsTaskModalOpen(false);
        setSelectedDeviceId('');
        setTicketSeverity('Alert');
        setTicketSla(30);
        onRefresh();
      } else {
        const err = await response.json();
        setMsg(`Gagal membuat tiket: ${err.error || err.message}`);
      }
    } catch (error) {
      setMsg('Gagal menghubungi server.');
    }
  };

  interface TaskStep {
    id: number;
    text: string;
    completed: boolean;
    notes?: string;
  }

  const getTaskSteps = (task: ITask): TaskStep[] => {
    if (task.steps) {
      try {
        return JSON.parse(task.steps);
      } catch (e) {
        // fallback
      }
    }
    return [
      { id: 1, text: 'Identifikasi & analisa masalah pada perangkat', completed: false, notes: '' },
      { id: 2, text: 'Isolasi area / pengecekan fisik konektivitas', completed: false, notes: '' },
      { id: 3, text: 'Konfigurasi ulang / perbaikan perangkat', completed: false, notes: '' },
      { id: 4, text: 'Pengujian koneksi (Ping/Zabbix verify)', completed: false, notes: '' }
    ];
  };

  const handleUpdateSteps = async (taskId: number, updatedSteps: TaskStep[]) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/steps`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ steps: updatedSteps })
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to update task steps:', error);
    }
  };

  const handleToggleStep = (task: ITask, stepId: number) => {
    const currentSteps = getTaskSteps(task);
    const updated = currentSteps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
    handleUpdateSteps(task.id, updated);
  };

  const handleStepNotesSave = (task: ITask, stepId: number, notesValue: string) => {
    const currentSteps = getTaskSteps(task);
    const updated = currentSteps.map(s => s.id === stepId ? { ...s, notes: notesValue } : s);
    handleUpdateSteps(task.id, updated);
  };

  const handleAddStep = (taskId: number, currentSteps: TaskStep[]) => {
    if (!newStepText.trim()) return;
    const newId = currentSteps.length > 0 ? Math.max(...currentSteps.map(s => s.id)) + 1 : 1;
    const updated = [...currentSteps, { id: newId, text: newStepText.trim(), completed: false, notes: '' }];
    handleUpdateSteps(taskId, updated);
    setNewStepText('');
  };

  const handleDeleteStep = (taskId: number, currentSteps: TaskStep[], stepId: number) => {
    const updated = currentSteps.filter(s => s.id !== stepId);
    handleUpdateSteps(taskId, updated);
  };

  const handleOpenCompleteModal = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    let autoSummary = 'Tindakan perbaikan selesai.';
    if (task) {
      const steps = getTaskSteps(task);
      autoSummary = steps
        .map(s => `- ${s.text}: ${s.notes || 'Selesai'}`)
        .join('\n');
    }
    setCompleteTaskId(taskId);
    setResolutionNotes(autoSummary);
    setIsCompleteModalOpen(true);
  };

  const handleExportAllCSV = () => {
    const headers = ['ID Gangguan', 'Nama Perangkat', 'IP Address', 'Lokasi', 'Tingkat Kerawanan', 'Status Tiket', 'Waktu Mulai', 'Waktu Selesai', 'SLA (Menit)', 'Teknisi Penanggungjawab', 'Cara Penanganan'];
    const rows = tasks.map(t => [
      t.id,
      t.device_name,
      t.ip_address,
      t.location,
      t.severity,
      t.status,
      t.started_at,
      t.completed_at || 'Belum Selesai (Downtime Active)',
      t.sla_minutes,
      t.assigned_user_name || 'Unassigned',
      t.resolution_notes || '-'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Tiket_Gangguan_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTicket = (task: ITask) => {
    const steps = getTaskSteps(task);
    const stepsHtml = steps.map(s => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${s.text}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${s.completed ? '✓ Selesai' : '✗ Belum'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${s.notes || '-'}</td>
      </tr>
    `).join('');

    const printWindow = window.open('', '_blank', 'width=800,height=700');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Tiket Gangguan #${task.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; color: #0f172a; }
            .header p { margin: 5px 0 0 0; font-size: 13px; color: #64748b; font-weight: 600; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 35px; }
            .meta-table td { padding: 10px; border: 1px solid #cbd5e1; font-size: 14px; }
            .meta-table td.label { font-weight: bold; background-color: #f8fafc; width: 25%; color: #334155; }
            .section-title { font-size: 16px; font-weight: bold; margin-bottom: 12px; border-bottom: 2px solid #0f172a; padding-bottom: 6px; color: #0f172a; text-transform: uppercase; }
            .steps-table { width: 100%; border-collapse: collapse; margin-bottom: 35px; }
            .steps-table th { padding: 10px; background-color: #f1f5f9; border: 1px solid #cbd5e1; font-size: 13px; text-align: left; color: #334155; }
            .steps-table td { padding: 10px; border: 1px solid #cbd5e1; font-size: 13px; }
            .summary-box { border: 1px solid #cbd5e1; background-color: #f8fafc; padding: 15px; border-radius: 6px; font-size: 14px; line-height: 1.6; margin-bottom: 45px; white-space: pre-wrap; color: #334155; }
            .footer-sig { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
            .sig-box { text-align: center; width: 45%; font-size: 14px; }
            .sig-line { margin-top: 80px; border-top: 1px solid #64748b; padding-top: 5px; font-weight: bold; color: #0f172a; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Laporan Penanganan Gangguan Jaringan</h1>
            <p>Sistem Manajemen Jaringan NEMESYS - UNTAG Banyuwangi</p>
          </div>

          <div class="section-title">Informasi Tiket Gangguan</div>
          <table class="meta-table">
            <tr>
              <td class="label">ID Tiket</td>
              <td>#${task.id}</td>
              <td class="label">Status</td>
              <td><span style="font-weight: bold; color: #16a34a;">${task.status}</span></td>
            </tr>
            <tr>
              <td class="label">Nama Perangkat</td>
              <td>${task.device_name}</td>
              <td class="label">IP Address</td>
              <td><code>${task.ip_address}</code></td>
            </tr>
            <tr>
              <td class="label">Lokasi</td>
              <td colspan="3">${task.location}</td>
            </tr>
            <tr>
              <td class="label">Waktu Mulai</td>
              <td>${task.started_at}</td>
              <td class="label">Waktu Selesai</td>
              <td>${task.completed_at || '-'}</td>
            </tr>
            <tr>
              <td class="label">Teknisi Penanggungjawab</td>
              <td>${task.assigned_user_name || 'Tidak ada'}</td>
              <td class="label">SLA Waktu</td>
              <td>${task.sla_minutes} Menit</td>
            </tr>
          </table>

          <div class="section-title">Langkah & Checklist Penanganan SOP</div>
          <table class="steps-table">
            <thead>
              <tr>
                <th style="width: 50%;">Tahapan Prosedur</th>
                <th style="width: 15%; text-align: center;">Status</th>
                <th style="width: 35%;">Catatan Temuan / Tindakan</th>
              </tr>
            </thead>
            <tbody>
              ${stepsHtml}
            </tbody>
          </table>

          <div class="section-title">Ringkasan Akhir / Tindakan Perbaikan</div>
          <div class="summary-box">${task.resolution_notes || 'Tindakan perbaikan selesai.'}</div>

          <div class="footer-sig">
            <div class="sig-box">
              <p>Mengetahui,</p>
              <p><strong>IT Manager / Supervisor</strong></p>
              <div class="sig-line">------------------------------------</div>
            </div>
            <div class="sig-box">
              <p>Banyuwangi, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>Teknisi Lapangan</strong></p>
              <div class="sig-line">${task.assigned_user_name || 'Rizal Kurniawan'}</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleCompleteTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeTaskId) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${completeTaskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resolution_notes: resolutionNotes })
      });

      if (response.ok) {
        setMsg('Tugas berhasil diselesaikan dan tindakan perbaikan telah dicatat.');
        setIsCompleteModalOpen(false);
        setCompleteTaskId(null);
        setResolutionNotes('');
        onRefresh();
      } else {
        const err = await response.json();
        setMsg(`Gagal menyelesaikan tugas: ${err.error || err.message}`);
      }
    } catch (error) {
      setMsg('Gagal menghubungi server.');
    }
  };

  const resetTodoForm = () => {
    setTodoId(null);
    setTaskName('');
  };

  const handleSaveTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const url = todoId 
      ? `http://localhost:5000/api/daily-todos/${todoId}` 
      : 'http://localhost:5000/api/daily-todos';
    
    const method = todoId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ task_name: taskName, is_completed: false })
      });

      if (response.ok) {
        setMsg(todoId ? 'Kegiatan berhasil diperbarui.' : 'Kegiatan berhasil dibuat.');
        resetTodoForm();
        setIsTodoModalOpen(false);
        onRefresh();
      } else {
        const err = await response.json();
        setMsg(`Error: ${err.error}`);
      }
    } catch (error) {
      setMsg('Gagal menghubungi server.');
    }
  };

  const handleToggleTodo = async (todo: DailyTodo) => {
    try {
      const response = await fetch(`http://localhost:5000/api/daily-todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ task_name: todo.task_name, is_completed: !todo.is_completed })
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to toggle todo:', error);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kegiatan ini?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/daily-todos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const handleEditTodo = (todo: DailyTodo) => {
    setTodoId(todo.id);
    setTaskName(todo.task_name);
    setIsTodoModalOpen(true);
  };

  // filter only technicians
  const technicians = users.filter((u) => u.role === 'Teknisi');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('checklist')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'checklist' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: '16px',
            fontWeight: 600,
            padding: '8px 16px',
            borderBottom: activeTab === 'checklist' ? '2.5px solid var(--accent-primary)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ClipboardList size={18} />
          Daftar Kegiatan (Checklist)
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'tasks' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: '16px',
            fontWeight: 600,
            padding: '8px 16px',
            borderBottom: activeTab === 'tasks' ? '2.5px solid var(--accent-primary)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ClipboardList size={18} />
          Tiket Gangguan (Zabbix)
        </button>
        <button
          onClick={() => setActiveTab('missions')}
          style={{
            background: 'transparent',
            border: 'none',
            color: activeTab === 'missions' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: '16px',
            fontWeight: 600,
            padding: '8px 16px',
            borderBottom: activeTab === 'missions' ? '2.5px solid var(--accent-primary)' : 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Target size={18} />
          Mission & Leaderboard
        </button>
      </div>

      {activeTab === 'checklist' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Telegram Banner */}
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

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0 }}>Daily Tasks</h3>
            
            {/* Create Button */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <button
                onClick={() => { resetTodoForm(); setIsTodoModalOpen(true); }}
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
                  maxWidth: '400px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}
              >
                Create Daily Task +
              </button>
            </div>

            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>List Daily Tasks</h4>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px', marginTop: '-8px' }}>Untuk mendokumentasikan kegiatan harianmu</p>
              
              {dailyTodos.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                  Belum ada kegiatan harian. Klik "Create Daily Task +" untuk memulai.
                </div>
              ) : (
                dailyTodos.map(todo => (
                  <div key={todo.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '12px 16px'
                  }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', color: '#fff', fontSize: '14px' }}>
                      <input
                        type="checkbox"
                        checked={!!todo.is_completed}
                        onChange={() => handleToggleTodo(todo)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ textDecoration: todo.is_completed ? 'line-through' : 'none', color: todo.is_completed ? 'var(--text-muted)' : '#fff' }}>
                        {todo.task_name}
                      </span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditTodo(todo)}
                        style={{ backgroundColor: '#eab308', border: 'none', color: '#000', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        style={{ backgroundColor: '#ef4444', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12.5px', fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Modal popup */}
          {isTodoModalOpen && (
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
                backgroundColor: '#fff',
                color: '#1e293b',
                width: '100%',
                maxWidth: '480px',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
                position: 'relative'
              }}>
                <button
                  onClick={() => setIsTodoModalOpen(false)}
                  style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>

                <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  {todoId ? 'Edit Daily Task' : 'Create Daily Task'}
                </h3>

                <form onSubmit={handleSaveTodo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Task Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter task name"
                      value={taskName}
                      onChange={(e) => setTaskName(e.target.value)}
                      style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button
                      type="submit"
                      style={{ flex: 1, backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTodoModalOpen(false)}
                      style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'tasks' ? (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ margin: 0 }}>Manajemen Tiket Gangguan Harian</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Tambah Tiket Gangguan
              </button>
              <button
                onClick={handleExportAllCSV}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)'
                }}
              >
                <Download size={14} /> Ekspor Semua Tiket (CSV)
              </button>
            </div>
          </div>
          <div className="table-container">
            {tasks.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Belum ada tiket gangguan yang terdaftar.
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Perangkat</th>
                    <th>IP Address</th>
                    <th>Lokasi</th>
                    <th>Waktu Mulai</th>
                    <th>SLA</th>
                    <th>Teknisi Ditugaskan</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => {
                    const currentSteps = getTaskSteps(task);
                    const completedStepsCount = currentSteps.filter(s => s.completed).length;
                    const totalStepsCount = currentSteps.length;
                    const allStepsCompleted = totalStepsCount > 0 && currentSteps.every(s => s.completed);

                    return (
                      <React.Fragment key={task.id}>
                        <tr>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {task.status !== 'Completed' && (
                                <button
                                  onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--accent-primary)',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    backgroundColor: expandedTaskId === task.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.1)',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  {expandedTaskId === task.id ? 'Tutup Prosedur ▲' : 'Buka Prosedur ▼'}
                                </button>
                              )}
                              <span style={{ fontWeight: 600 }}>{task.device_name}</span>
                            </div>
                          </td>
                          <td><code>{task.ip_address}</code></td>
                          <td>{task.location}</td>
                          <td>{task.started_at}</td>
                          <td>{task.sla_minutes} Menit</td>
                          <td>
                            {task.status === 'Completed' ? (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
                                {task.assigned_user_name || 'Tidak ada'}
                              </span>
                            ) : (
                              <select
                                value={task.assigned_user_id || ''}
                                onChange={(e) => onAssignTask(task.id, Number(e.target.value))}
                                style={{
                                  backgroundColor: 'var(--bg-secondary)',
                                  color: '#fff',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '6px',
                                  padding: '6px 10px',
                                  fontSize: '13px',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="">-- Pilih Teknisi --</option>
                                {technicians.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    {t.name} ({t.status === 'Available' ? 'Available' : 'Busy'})
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                className={`badge ${
                                  task.status === 'Completed'
                                    ? 'badge-success'
                                    : task.status === 'In Progress'
                                    ? 'badge-warning'
                                    : 'badge-danger'
                                }`}
                              >
                                {task.status}
                              </span>
                              {task.status !== 'Completed' && (
                                <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                  ({completedStepsCount}/{totalStepsCount} Langkah)
                                </span>
                              )}
                              {task.status === 'Completed' && (
                                <button
                                  onClick={() => handlePrintTicket(task)}
                                  style={{
                                    backgroundColor: 'var(--accent-primary)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  Cetak Tiket
                                </button>
                              )}
                              {task.status === 'In Progress' && (
                                <button
                                  disabled={!allStepsCompleted}
                                  onClick={() => handleOpenCompleteModal(task.id)}
                                  style={{
                                    backgroundColor: allStepsCompleted ? '#22c55e' : '#475569',
                                    color: allStepsCompleted ? '#fff' : '#94a3b8',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '11.5px',
                                    fontWeight: 600,
                                    cursor: allStepsCompleted ? 'pointer' : 'not-allowed',
                                    opacity: allStepsCompleted ? 1 : 0.6,
                                    transition: 'all 0.2s ease',
                                  }}
                                  title={allStepsCompleted ? 'Selesaikan tiket gangguan ini' : 'Selesaikan seluruh langkah prosedur terlebih dahulu'}
                                >
                                  Selesaikan
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>

                        {expandedTaskId === task.id && task.status !== 'Completed' && (
                          <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.015)' }}>
                            <td colSpan={7} style={{ padding: '16px 24px', borderTop: 'none' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <h4 style={{ margin: 0, fontSize: '13.5px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                                    📋 Prosedur & Tahapan Penanganan Gangguan
                                  </h4>
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Seluruh tahapan wajib dicentang sebelum tiket dapat diselesaikan.
                                  </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {currentSteps.map((step) => (
                                    <div
                                      key={step.id}
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                        padding: '12px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#fff', fontSize: '13.5px', fontWeight: 600 }}>
                                          <input
                                            type="checkbox"
                                            checked={step.completed}
                                            onChange={() => handleToggleStep(task, step.id)}
                                            style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                                          />
                                          <span style={{ textDecoration: step.completed ? 'line-through' : 'none', color: step.completed ? 'var(--text-muted)' : '#fff' }}>
                                            {step.text}
                                          </span>
                                        </label>
                                        <button
                                          onClick={() => handleDeleteStep(task.id, currentSteps, step.id)}
                                          style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--color-danger)',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                          }}
                                        >
                                          Hapus
                                        </button>
                                      </div>

                                      {/* Note input field for this step */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '26px' }}>
                                        <input
                                          key={step.id + '_' + (step.notes || '')}
                                          type="text"
                                          placeholder="Tulis temuan / catatan pengerjaan untuk tahapan ini..."
                                          defaultValue={step.notes || ''}
                                          onBlur={(e) => handleStepNotesSave(task, step.id, e.target.value)}
                                          style={{
                                            backgroundColor: 'rgba(0, 0, 0, 0.25)',
                                            color: '#fff',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            padding: '6px 10px',
                                            fontSize: '12.5px',
                                            outline: 'none',
                                            width: '100%',
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Add Custom Step Form */}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                  <input
                                    type="text"
                                    placeholder="Tambah langkah prosedur khusus..."
                                    value={newStepText}
                                    onChange={(e) => setNewStepText(e.target.value)}
                                    style={{
                                      flex: 1,
                                      backgroundColor: 'var(--bg-secondary)',
                                      color: '#fff',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: '6px',
                                      padding: '6px 12px',
                                      fontSize: '13px',
                                      outline: 'none',
                                    }}
                                  />
                                  <button
                                    onClick={() => handleAddStep(task.id, currentSteps)}
                                    style={{
                                      backgroundColor: 'var(--accent-primary)',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '6px',
                                      padding: '6px 14px',
                                      fontSize: '13px',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    Tambah Langkah
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
          {/* Mission logs */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '16px' }}>Log Penyelesaian Mission (Real-Time)</h3>
            <div className="table-container">
              {missions.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Belum ada log penyelesaian misi.
                </div>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Teknisi</th>
                      <th>Perangkat</th>
                      <th>Waktu Selesai</th>
                      <th>Status Misi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {missions.map((m) => (
                      <tr key={m.id}>
                        <td><span style={{ fontWeight: 600 }}>{m.user_name}</span></td>
                        <td>{m.task_device_name}</td>
                        <td>{m.completed_at}</td>
                        <td>
                          <span
                            className={`badge ${
                              m.status === 'Completed' ? 'badge-success' : 'badge-danger'
                            }`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            {m.status === 'Completed' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Leaderboard panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} className="text-amber-400" style={{ color: 'var(--color-warning)' }} />
              <h3>Leaderboard Teknisi</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {technicians
                .sort((a, b) => b.mission_completed - a.mission_completed)
                .map((tech, index) => {
                  const total = tech.mission_completed + tech.mission_incompleted;
                  const rate = total > 0 ? Math.round((tech.mission_completed / total) * 100) : 100;
                  return (
                    <div
                      key={tech.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: index === 0 ? 'var(--color-warning)' : 'var(--bg-secondary)',
                            color: index === 0 ? '#000' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '14px' }}>{tech.name}</p>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Success Rate: {rate}%
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                          {tech.mission_completed} ✓
                        </span>
                        <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                          {tech.mission_incompleted} ✗
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
      {/* Complete Task Modal */}
      {isCompleteModalOpen && (
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
            backgroundColor: '#fff',
            color: '#1e293b',
            width: '100%',
            maxWidth: '480px',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsCompleteModalOpen(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Selesaikan Tiket Gangguan
            </h3>

            <form onSubmit={handleCompleteTaskSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#475569' }}>
                  Tindakan Perbaikan / Cara Penanganan
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Contoh: Restart ONT / Router, penggantian kabel FO yang patchcore-nya ditekuk kencang, dsb."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#1e293b',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Selesaikan & Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompleteModalOpen(false)}
                  style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Create Ticket Modal */}
      {isTaskModalOpen && (
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
            backgroundColor: '#fff',
            color: '#1e293b',
            width: '100%',
            maxWidth: '480px',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsTaskModalOpen(false)}
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              Buat Tiket Gangguan Manual
            </h3>

            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Pilih Perangkat Jaringan</label>
                <select
                  required
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value ? Number(e.target.value) : '')}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#1e293b',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="">-- Pilih Perangkat --</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.ip_address} - {d.status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Tingkat Kerawanan (Severity)</label>
                <select
                  value={ticketSeverity}
                  onChange={(e: any) => setTicketSeverity(e.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#1e293b',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="Warning">Warning</option>
                  <option value="Alert">Alert</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>SLA Target Waktu (Menit)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={ticketSla}
                  onChange={(e) => setTicketSla(Number(e.target.value))}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '14px',
                    outline: 'none',
                    color: '#1e293b',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, backgroundColor: 'var(--accent-primary)', color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Simpan & Kirim Alert
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
