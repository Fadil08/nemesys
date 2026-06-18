import React from 'react';
import { Thermometer, Sun, Battery, Activity, ShieldAlert } from 'lucide-react';
import type { Device, TemperatureLog } from '../types';

interface TempSolarProps {
  devices: Device[];
  tempLogs: TemperatureLog[];
  currentTemp: number;
}

export const TempSolar: React.FC<TempSolarProps> = ({ devices, tempLogs, currentTemp }) => {
  const solarDevice = devices.find((d) => d.id === 5); // AP-Solar-Outdoor

  // thresholds
  const isWarning = currentTemp >= 28 && currentTemp < 32;
  const isEmergency = currentTemp >= 32;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* Server Temperature Monitor */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Thermometer size={20} className="text-rose-400" style={{ color: 'var(--color-danger)' }} />
            <h3>Monitoring Suhu Ruang Server (Zabbix Sensor)</h3>
          </div>

          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: isEmergency
                ? 'rgba(239,68,68,0.15)'
                : isWarning
                ? 'rgba(245,158,11,0.15)'
                : 'rgba(255,255,255,0.02)',
              border: `1px solid ${
                isEmergency ? 'var(--color-danger)' : isWarning ? 'var(--color-warning)' : 'var(--border-color)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Suhu Saat Ini</span>
              <p
                style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  color: isEmergency
                    ? 'var(--color-danger)'
                    : isWarning
                    ? 'var(--color-warning)'
                    : 'var(--color-success)',
                }}
              >
                {currentTemp}°C
              </p>
            </div>
            {isEmergency ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontSize: '13px', fontWeight: 600 }}>
                <ShieldAlert size={20} className="pulse-indicator" />
                OVERHEATING EMERGENCY
              </div>
            ) : isWarning ? (
              <div style={{ color: 'var(--color-warning)', fontSize: '13px', fontWeight: 600 }}>
                WARNING: High Temp (&gt;28°C)
              </div>
            ) : (
              <div style={{ color: 'var(--color-success)', fontSize: '13px', fontWeight: 600 }}>
                Normal Operating Temp
              </div>
            )}
          </div>

          {/* Logs summary */}
          <div>
            <h4 style={{ fontSize: '13px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Log Tren Suhu Terbaru</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tempLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    borderRadius: '6px',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{log.recorded_at}</span>
                  <span style={{ fontWeight: 600, color: log.temperature > 30 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
                    {log.temperature}°C
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Solar Panel Power Monitor */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sun size={20} className="text-amber-400" style={{ color: 'var(--color-warning)' }} />
            <h3>Solar Power & Green Energy Monitoring</h3>
          </div>

          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Node Terhubung</span>
                <h4 style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
                  {solarDevice?.name || 'AP-Solar-Outdoor'}
                </h4>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--color-success)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontWeight: 600,
                }}
              >
                <Activity size={12} />
                {solarDevice?.solar_status || 'Charging'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Kapasitas Baterai</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <Battery size={20} style={{ color: (solarDevice?.battery_percentage || 85) < 30 ? 'var(--color-danger)' : 'var(--color-success)' }} />
                  <span style={{ fontSize: '20px', fontWeight: 700 }}>
                    {solarDevice?.battery_percentage || 85}%
                  </span>
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tegangan Aktual</span>
                <div style={{ marginTop: '6px', fontSize: '20px', fontWeight: 700 }}>
                  {solarDevice?.voltage || 12.8} V
                </div>
              </div>
            </div>
            
            {(solarDevice?.battery_percentage || 85) < 30 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)', fontSize: '12px', fontWeight: 600 }}>
                <ShieldAlert size={16} />
                Baterai Kritis! Di bawah ambang batas minimum &lt; 30%.
              </div>
            )}
          </div>

          <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Sistem panel surya ini dirancang untuk mendayai node jaringan terluar secara independen. Data ditarik menggunakan monitoring SNMP voltase baterai untuk mendeteksi dini kegagalan suplai listrik sebelum perangkat mati total.
          </div>
        </div>
      </div>
    </div>
  );
};
