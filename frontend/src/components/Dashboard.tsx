import React from 'react';
import { ShieldCheck, ShieldAlert, ClipboardList, Clock, Activity, Wifi } from 'lucide-react';
import type { Device, DailyTask } from '../types';

interface DashboardProps {
  devices: Device[];
  tasks: DailyTask[];
  onTriggerAlert: () => void;
  onNavigate: (menu: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ devices, tasks, onTriggerAlert, onNavigate }) => {
  const totalDevices = devices.length;
  const upDevices = devices.filter((d) => d.status === 'Up').length;
  const downDevices = totalDevices - upDevices;
  const activeTasks = tasks.filter((t) => t.status !== 'Completed').length;
  
  const completedTasks = tasks.filter((t) => t.status === 'Completed');
  const avgMTTR = completedTasks.length > 0 
    ? Math.round(completedTasks.reduce((acc, t) => {
        const diff = new Date(t.completed_at!).getTime() - new Date(t.started_at).getTime();
        return acc + diff / 60000;
      }, 0) / completedTasks.length)
    : 15; // default simulation fallback

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Banner simulation */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.05))', borderColor: 'var(--accent-primary)' }}>
        <div>
          <h2 style={{ marginBottom: '8px' }}>Control Panel Simulasi NEMESYS v1.3</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px' }}>
            Gunakan tombol simulasi di samping untuk men-trigger status <strong>PROBLEM</strong> di server Zabbix. Ini akan menghasilkan tiket Daily Task dan push notifikasi ke Bot Telegram secara otomatis.
          </p>
        </div>
        <button className="btn-primary" onClick={onTriggerAlert}>
          <Activity size={18} />
          Simulasikan Gangguan Zabbix
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid-dashboard">
        <div className="glass-card stat-card">
          <div className="stat-info">
            <h4>Total Perangkat</h4>
            <p>{totalDevices}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-primary)' }}>
            <Wifi size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h4>Perangkat Aktif (Up)</h4>
            <p style={{ color: 'var(--color-success)' }}>{upDevices}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h4>Perangkat Mati (Down)</h4>
            <p style={{ color: downDevices > 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>{downDevices}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--color-danger)' }}>
            <ShieldAlert size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h4>Gangguan Aktif</h4>
            <p>{activeTasks}</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--color-warning)' }}>
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-info">
            <h4>Rata-rata MTTR</h4>
            <p>{avgMTTR} Menit</p>
          </div>
          <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-info)' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Left Section: Active Alerts Table */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Daftar Gangguan Aktif (Real-Time)</h3>
            <button 
              onClick={() => onNavigate('tasks')} 
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
            >
              Lihat Semua Tugas &rarr;
            </button>
          </div>
          <div className="table-container">
            {tasks.filter(t => t.status !== 'Completed').length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Tidak ada gangguan aktif. Semua jaringan dalam kondisi optimal (UP).
              </div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Perangkat</th>
                    <th>IP Address</th>
                    <th>Lokasi</th>
                    <th>Tingkat Bahaya</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.filter(t => t.status !== 'Completed').map(task => (
                    <tr key={task.id}>
                      <td><span style={{ fontWeight: 600 }}>{task.device_name}</span></td>
                      <td><code>{task.ip_address}</code></td>
                      <td>{task.location}</td>
                      <td>
                        <span className={`badge ${task.severity === 'Emergency' ? 'badge-danger' : task.severity === 'Alert' ? 'badge-warning' : 'badge-info'}`}>
                          {task.severity}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${task.status === 'Open' ? 'badge-danger' : 'badge-warning'}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Section: 7-Day Trend Chart Simulator */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3>Tren Gangguan (7 Hari)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '24px 0' }}>
            {[
              { day: 'Senin', count: 4 },
              { day: 'Selasa', count: 7 },
              { day: 'Rabu', count: 2 },
              { day: 'Kamis', count: 9 },
              { day: 'Jumat', count: 5 },
              { day: 'Sabtu', count: 1 },
              { day: 'Minggu (Hari Ini)', count: activeTasks },
            ].map((d, index) => {
              const max = 10;
              const pct = (d.count / max) * 100;
              return (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    <span>{d.day}</span>
                    <span style={{ fontWeight: 600 }}>{d.count} Gangguan</span>
                  </div>
                  <div className="chart-bar">
                    <div className="chart-bar-fill" style={{ width: `${pct}%`, backgroundColor: d.count > 5 ? 'var(--color-danger)' : 'var(--accent-primary)' }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', color: 'var(--text-muted)' }}>
            <span>Uptime Jaringan Bulanan</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>99.85%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
