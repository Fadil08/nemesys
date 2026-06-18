import React, { useState } from 'react';
import type { Device, DeviceCategory } from '../types';
import { Search, Plus, X } from 'lucide-react';
import { BACKEND_URL } from '../App';

interface NetListProps {
  devices: Device[];
  token: string;
  onRefresh: () => void;
  isAdmin: boolean;
  categories: DeviceCategory[];
}

export const NetList: React.FC<NetListProps> = ({ devices, token, onRefresh, isAdmin, categories }) => {
  // Device Form State
  const [deviceId, setDeviceId] = useState<number | null>(null);
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<string>('Router');
  const [ipAddress, setIpAddress] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState(-7.9790);
  const [lng, setLng] = useState(112.6300);
  const [isBackbone, setIsBackbone] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [webConfigUrl, setWebConfigUrl] = useState('');
  const [deviceImage, setDeviceImage] = useState('');
  const [status, setStatus] = useState<'Up' | 'Down' | 'Warning' | 'Maintenance'>('Up');
  const [batteryPercentage, setBatteryPercentage] = useState<number | ''>('');
  const [voltage, setVoltage] = useState<number | ''>('');
  const [solarStatus, setSolarStatus] = useState<'Charging' | 'Discharging' | 'Full' | ''>('');

  // UI state
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [deviceLocFilter, setDeviceLocFilter] = useState('All');
  const [msg, setMsg] = useState('');

  const resetDeviceForm = () => {
    setDeviceId(null);
    setDeviceName('');
    setDeviceType(categories.length > 0 ? categories[0].name : 'Router');
    setIpAddress('');
    setLocation('');
    setLat(-7.9790);
    setLng(112.6300);
    setIsBackbone(false);
    setDescription('');
    setCategory('');
    setWebConfigUrl('');
    setDeviceImage('');
    setStatus('Up');
    setBatteryPercentage('');
    setVoltage('');
    setSolarStatus('');
  };

  const handleSaveDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const url = deviceId 
      ? `${BACKEND_URL}/api/devices/${deviceId}` 
      : `${BACKEND_URL}/api/devices`;
    
    const method = deviceId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: deviceName,
          type: deviceType,
          ip_address: ipAddress,
          location,
          latitude: lat,
          longitude: lng,
          is_backbone: isBackbone,
          description,
          category,
          web_config_url: webConfigUrl,
          device_image: deviceImage,
          status,
          battery_percentage: batteryPercentage === '' ? null : batteryPercentage,
          voltage: voltage === '' ? null : voltage,
          solar_status: solarStatus === '' ? null : solarStatus
        })
      });

      if (response.ok) {
        setMsg(deviceId ? 'Perangkat berhasil diperbarui.' : 'Perangkat berhasil ditambahkan.');
        resetDeviceForm();
        setIsDeviceModalOpen(false);
        onRefresh();
      } else {
        const err = await response.json();
        setMsg(`Error: ${err.error}`);
      }
    } catch (error) {
      setMsg('Gagal menghubungi server.');
    }
  };

  const handleDeleteDevice = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus perangkat ini?')) return;
    setMsg('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/devices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMsg('Perangkat berhasil dihapus.');
        onRefresh();
      }
    } catch (error) {
      setMsg('Gagal menghapus perangkat.');
    }
  };

  const handleEditDevice = (dev: Device) => {
    setDeviceId(dev.id);
    setDeviceName(dev.name);
    setDeviceType(dev.type);
    setIpAddress(dev.ip_address);
    setLocation(dev.location);
    setLat(dev.latitude);
    setLng(dev.longitude);
    setIsBackbone(!!dev.is_backbone);
    setDescription(dev.description || '');
    setCategory(dev.category || '');
    setWebConfigUrl(dev.web_config_url || '');
    setDeviceImage(dev.device_image || '');
    setStatus(dev.status || 'Up');
    setBatteryPercentage(dev.battery_percentage !== undefined && dev.battery_percentage !== null ? dev.battery_percentage : '');
    setVoltage(dev.voltage !== undefined && dev.voltage !== null ? dev.voltage : '');
    setSolarStatus(dev.solar_status || '');
    setIsDeviceModalOpen(true);
  };

  // Filter logic
  const filteredDevices = devices.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(deviceSearch.toLowerCase()) || d.ip_address.includes(deviceSearch);
    const matchesLoc = deviceLocFilter === 'All' ? true : d.location === deviceLocFilter;
    return matchesSearch && matchesLoc;
  });

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

      {/* Top Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--bg-secondary)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {isAdmin ? (
          <button
            onClick={() => { resetDeviceForm(); setIsDeviceModalOpen(true); }}
            style={{
              backgroundColor: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={18} /> Add New Devices +
          </button>
        ) : (
          <h3 style={{ margin: 0 }}>NetList - Inventaris Seluruh Perangkat</h3>
        )}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Name / IP..."
              value={deviceSearch}
              onChange={(e) => setDeviceSearch(e.target.value)}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: '#fff',
                fontSize: '13.5px',
                width: '220px',
              }}
            />
          </div>

          {/* Location Selector */}
          <select
            value={deviceLocFilter}
            onChange={(e) => setDeviceLocFilter(e.target.value)}
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
            <option value="All">Location (All)</option>
            {Array.from(new Set(devices.map(d => d.location).filter(Boolean))).map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Device Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '24px',
        marginTop: '8px'
      }}>
        {filteredDevices.map(d => {
          return (
            <div key={d.id} className="glass-card" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              padding: '20px'
            }}>
              {/* Dynamic Hardware Render */}
              <div style={{
                height: '80px',
                background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                border: '1.5px solid #334155',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 16px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Ears for rack mount */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#475569', borderRight: '1px solid #1e293b' }}></div>
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#475569', borderLeft: '1px solid #1e293b' }}></div>
                
                {/* Panel metadata */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', letterSpacing: '1px' }}>
                    {d.type.toUpperCase()} NODE • ID-{d.id}
                  </span>
                  <span style={{
                    display: 'inline-block',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: d.status === 'Up' ? '#10b981' : d.status === 'Warning' ? '#f59e0b' : d.status === 'Maintenance' ? '#8b5cf6' : '#ef4444',
                    boxShadow: d.status === 'Up' ? '0 0 8px #10b981' : d.status === 'Warning' ? '0 0 8px #f59e0b' : d.status === 'Maintenance' ? '0 0 8px #8b5cf6' : '0 0 8px #ef4444'
                  }}></span>
                </div>
                
                {/* Blink Ports indicator */}
                <div style={{ display: 'flex', gap: '3px', overflow: 'hidden' }}>
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div key={i} style={{
                      width: '9px',
                      height: '9px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '1px',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        top: '-2px',
                        left: '2.5px',
                        width: '2.5px',
                        height: '2.5px',
                        borderRadius: '50%',
                        backgroundColor: (d.status === 'Up' || d.status === 'Warning') && Math.random() > 0.35 ? '#10b981' : '#475569',
                        boxShadow: (d.status === 'Up' || d.status === 'Warning') && Math.random() > 0.35 ? '0 0 3px #10b981' : 'none'
                      }}></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Metadata */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>{d.name}</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', minHeight: '36px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.description || 'Tidak ada deskripsi untuk perangkat ini.'}
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  <strong>Location:</strong> {d.location}
                </span>
                {d.battery_percentage !== undefined && d.battery_percentage !== null && (
                  <span style={{ fontSize: '12.5px', color: '#10b981', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px', fontWeight: 600 }}>
                    🔋 Baterai: {d.battery_percentage}% 
                    {d.voltage && ` (${d.voltage}V)`} 
                    {d.solar_status && ` • Panel: ${d.solar_status}`}
                  </span>
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  <strong>Status Pemantauan:</strong> <span style={{
                    color: d.status === 'Up' ? '#10b981' : d.status === 'Warning' ? '#f59e0b' : d.status === 'Maintenance' ? '#a78bfa' : '#ef4444',
                    fontWeight: 700
                  }}>{d.status || 'Up'}</span>
                </span>
              </div>

              {/* SSH Command Badge */}
              <div style={{
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11.5px',
                fontFamily: 'monospace',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>ssh admin@{d.ip_address}</span>
                <span style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigator.clipboard.writeText(`ssh admin@${d.ip_address}`)}>Copy</span>
              </div>

              {/* Bottom details / Action Webconfig */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => d.web_config_url ? window.open(d.web_config_url, '_blank') : alert('Web config URL tidak tersedia')}
                    style={{
                      backgroundColor: 'var(--accent-primary)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      opacity: d.web_config_url ? 1 : 0.5
                    }}
                  >
                    Access Webconfig
                  </button>

                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleEditDevice(d)}
                        style={{
                          backgroundColor: '#eab308',
                          color: '#000',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(d.id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>

                <span style={{
                  fontSize: '11px',
                  color: d.is_backbone ? '#eab308' : '#38bdf8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {d.is_backbone ? '⚡ CORE NETWORK' : 'NETMAP READY'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Modal Add/Edit Device */}
      {isDeviceModalOpen && (
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
            maxWidth: '520px',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.5)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setIsDeviceModalOpen(false)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '16px',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
              {deviceId ? 'Edit Network Device' : 'Add New Network Devices'}
            </h3>

            <form onSubmit={handleSaveDevice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter device name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                />
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Description</label>
                <textarea
                  placeholder="Enter device description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit', color: '#1e293b' }}
                />
              </div>

              {/* Category / Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Category</label>
                <select
                  value={deviceType}
                  onChange={(e: any) => setDeviceType(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', cursor: 'pointer', color: '#1e293b' }}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {/* IP Address */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>IP Address</label>
                <input
                  type="text"
                  required
                  placeholder="Enter IP address"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                />
              </div>

              {/* Web Config URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Web Config URL (Kosongi Jika Tidak ada)</label>
                <input
                  type="text"
                  placeholder="Enter web config URL (http://ip:port)"
                  value={webConfigUrl}
                  onChange={(e) => setWebConfigUrl(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                />
              </div>

              {/* Name Location */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Name Location</label>
                <input
                  type="text"
                  required
                  placeholder="Enter device location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                />
              </div>

              {/* Coordinates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Enter latitude"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Enter longitude"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                  />
                </div>
              </div>

              {/* Select from Map Button */}
              <button
                type="button"
                onClick={() => {
                  setLat(-8.2295813 + (Math.random() - 0.5) * 0.005);
                  setLng(114.3632317 + (Math.random() - 0.5) * 0.005);
                }}
                style={{
                  backgroundColor: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: 'fit-content'
                }}
              >
                Select from Map (UNTAG BWI Coord)
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Device Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', cursor: 'pointer', color: '#1e293b' }}
                  >
                    <option value="Up">Up (Online)</option>
                    <option value="Down">Down (Offline)</option>
                    <option value="Warning">Warning (Degraded)</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Battery Percentage */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Baterai (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Kosongi jika tidak ada"
                    value={batteryPercentage}
                    onChange={(e) => setBatteryPercentage(e.target.value === '' ? '' : parseInt(e.target.value))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Voltage */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Voltage (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Kosongi jika tidak ada"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#1e293b' }}
                  />
                </div>

                {/* Solar Panel Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Panel Surya</label>
                  <select
                    value={solarStatus}
                    onChange={(e: any) => setSolarStatus(e.target.value)}
                    style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '14px', outline: 'none', cursor: 'pointer', color: '#1e293b' }}
                  >
                    <option value="">Tidak ada</option>
                    <option value="Charging">Charging</option>
                    <option value="Discharging">Discharging</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
              </div>

              {/* Device Image */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Device Image</label>
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setDeviceImage(e.target.files[0].name);
                    }
                  }}
                  style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', fontSize: '13px', outline: 'none', color: '#1e293b' }}
                />
              </div>

              {/* Backbone Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="backbone_chk_netlist"
                  checked={isBackbone}
                  onChange={(e) => setIsBackbone(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="backbone_chk_netlist" style={{ fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                  Yes, this is core networks
                </label>
              </div>

              {/* Action Buttons */}
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
                  Save Device
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeviceModalOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
