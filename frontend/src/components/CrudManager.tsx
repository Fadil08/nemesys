import React, { useState, useEffect } from 'react';
import { Trash2, Edit2, Shield, Radio, Plus, Search, X, Layers, Upload } from 'lucide-react';
import type { Device, User, DeviceCategory } from '../types';
import { BACKEND_URL } from '../App';

interface CrudManagerProps {
  devices: Device[];
  users: User[];
  token: string;
  onRefresh: () => void;
}

export const CrudManager: React.FC<CrudManagerProps> = ({ devices, users, token, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'devices' | 'categories'>('users');
  
  // Categories State
  const [categories, setCategories] = useState<DeviceCategory[]>([]);
  
  // User Form State
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Administrator' | 'Manager' | 'Teknisi'>('Teknisi');
  const [password, setPassword] = useState('');

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

  // Category Form State
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySvgIcon, setCategorySvgIcon] = useState<string | null>(null);
  
  // UI states
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [deviceSearch, setDeviceSearch] = useState('');
  const [deviceLocFilter, setDeviceLocFilter] = useState('All');

  // General Status
  const [msg, setMsg] = useState('');

  // Fetch Categories from Backend
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`);
      const data = await response.json();
      if (!data.error) {
        setCategories(data);
        // Set default deviceType if empty
        if (data.length > 0 && !deviceType) {
          setDeviceType(data[0].name);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetUserForm = () => {
    setUserId(null);
    setUsername('');
    setName('');
    setRole('Teknisi');
    setPassword('');
  };

  const resetDeviceForm = () => {
    setDeviceId(null);
    setDeviceName('');
    setDeviceType(categories.length > 0 ? categories[0].name : 'Router');
    setIpAddress('');
    setLocation('');
    setLat(-8.2295813);
    setLng(114.3632317);
    setIsBackbone(false);
    setDescription('');
    setCategory('');
    setWebConfigUrl('');
    setDeviceImage('');
  };

  const resetCategoryForm = () => {
    setCategoryId(null);
    setCategoryName('');
    setCategorySvgIcon(null);
  };

  // ----------------------------------------------------
  // USER HANDLERS
  // ----------------------------------------------------
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const url = userId 
      ? `${BACKEND_URL}/api/users/${userId}` 
      : `${BACKEND_URL}/api/users`;
    
    const method = userId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username, name, role, password })
      });

      if (response.ok) {
        setMsg(userId ? 'User berhasil diperbarui.' : 'User berhasil dibuat.');
        resetUserForm();
        onRefresh();
      } else {
        const err = await response.json();
        setMsg(`Error: ${err.error}`);
      }
    } catch (error) {
      setMsg('Gagal menghubungi server.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
    setMsg('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMsg('User berhasil dihapus.');
        onRefresh();
      }
    } catch (error) {
      setMsg('Gagal menghapus user.');
    }
  };

  const handleEditUser = (user: User) => {
    setUserId(user.id);
    setUsername(user.username);
    setName(user.name);
    setRole(user.role);
    setPassword(''); // keep blank unless update password
  };

  // ----------------------------------------------------
  // DEVICE CATEGORY HANDLERS (CRUD)
  // ----------------------------------------------------
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');

    const url = categoryId 
      ? `${BACKEND_URL}/api/categories/${categoryId}` 
      : `${BACKEND_URL}/api/categories`;
    
    const method = categoryId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: categoryName, svg_icon: categorySvgIcon })
      });

      if (response.ok) {
        setMsg(categoryId ? 'Kategori berhasil diperbarui.' : 'Kategori berhasil ditambahkan.');
        resetCategoryForm();
        fetchCategories();
        onRefresh();
      } else {
        const err = await response.json();
        setMsg(`Error: ${err.error}`);
      }
    } catch (error) {
      setMsg('Gagal menghubungi server.');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua perangkat dengan tipe kategori ini mungkin kehilangan ikon custom-nya.')) return;
    setMsg('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setMsg('Kategori berhasil dihapus.');
        resetCategoryForm();
        fetchCategories();
        onRefresh();
      }
    } catch (error) {
      setMsg('Gagal menghapus kategori.');
    }
  };

  const handleEditCategory = (cat: DeviceCategory) => {
    setCategoryId(cat.id);
    setCategoryName(cat.name);
    setCategorySvgIcon(cat.svg_icon);
  };

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
      alert('Hanya file SVG (.svg) yang diperbolehkan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Basic sanitization or validation of SVG text
      if (result.includes('<svg') && result.includes('</svg>')) {
        setCategorySvgIcon(result);
      } else {
        alert('File SVG tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // ----------------------------------------------------
  // DEVICE HANDLERS
  // ----------------------------------------------------
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
          device_image: deviceImage
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
    setIsDeviceModalOpen(true);
  };

  const filteredDevices = devices.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(deviceSearch.toLowerCase()) || 
                        d.ip_address.includes(deviceSearch);
    const matchLoc = deviceLocFilter === 'All' ? true : d.location === deviceLocFilter;
    return matchSearch && matchLoc;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tab Selector */}
      <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <button
          onClick={() => { setActiveTab('users'); setMsg(''); }}
          style={{
            background: 'transparent', border: 'none',
            color: activeTab === 'users' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: '16px', fontWeight: 600, padding: '8px 16px',
            borderBottom: activeTab === 'users' ? '2.5px solid var(--accent-primary)' : 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Shield size={18} /> Kelola Pengguna (Users)
        </button>
        <button
          onClick={() => { setActiveTab('devices'); setMsg(''); }}
          style={{
            background: 'transparent', border: 'none',
            color: activeTab === 'devices' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: '16px', fontWeight: 600, padding: '8px 16px',
            borderBottom: activeTab === 'devices' ? '2.5px solid var(--accent-primary)' : 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Radio size={18} /> Kelola Perangkat (Devices)
        </button>
        <button
          onClick={() => { setActiveTab('categories'); setMsg(''); }}
          style={{
            background: 'transparent', border: 'none',
            color: activeTab === 'categories' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: '16px', fontWeight: 600, padding: '8px 16px',
            borderBottom: activeTab === 'categories' ? '2.5px solid var(--accent-primary)' : 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          <Layers size={18} /> Kategori Ikon (Categories)
        </button>
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

      {activeTab === 'users' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
          {/* User List */}
          <div className="glass-card">
            <h3>Daftar Pengguna</h3>
            <div className="table-container" style={{ marginTop: '16px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td><span style={{ fontWeight: 600 }}>{u.name}</span></td>
                      <td>@{u.username}</td>
                      <td><span className="badge badge-info">{u.role}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditUser(u)} style={{ background: 'transparent', border: 'none', color: 'var(--color-warning)', cursor: 'pointer' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Form */}
          <div className="glass-card">
            <h3>{userId ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Nama Lengkap</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Username</label>
                <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Password {userId && '(Kosongkan jika tidak diubah)'}</label>
                <input type="password" required={!userId} value={password} onChange={(e) => setPassword(e.target.value)} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Role Akses</label>
                <select value={role} onChange={(e: any) => setRole(e.target.value)} style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: '#fff' }}>
                  <option value="Teknisi">Teknisi</option>
                  <option value="Manager">Manager</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Simpan</button>
                {userId && <button type="button" onClick={resetUserForm} className="btn-primary" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: '#fff', justifyContent: 'center' }}>Batal</button>}
              </div>
            </form>
          </div>
        </div>
      ) : activeTab === 'categories' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
          {/* Category List */}
          <div className="glass-card">
            <h3>Daftar Kategori Jaringan</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '16px' }}>
              Daftar kategori perangkat jaringan beserta SVG ikon kustom yang digunakan pada visualisasi peta.
            </p>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Ikon Preview (Up)</th>
                    <th>Nama Kategori</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id}>
                      <td>
                        <div 
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            padding: '3px'
                          }}
                        >
                          {cat.svg_icon ? (
                            <div 
                              style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              dangerouslySetInnerHTML={{ 
                                __html: cat.svg_icon
                                  .replace(/var\(--top-color-1\)/g, '#4ade80')
                                  .replace(/var\(--top-color-2\)/g, '#10b981')
                                  .replace(/var\(--body-color-1\)/g, '#10b981')
                                  .replace(/var\(--body-color-2\)/g, '#047857')
                                  .replace(/var\(--left-color-1\)/g, '#059669')
                                  .replace(/var\(--left-color-2\)/g, '#064e3b')
                                  .replace(/var\(--shadow-color\)/g, 'rgba(16,185,129,0.3)')
                              }} 
                            />
                          ) : (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>No SVG</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleEditCategory(cat)} style={{ background: 'transparent', border: 'none', color: 'var(--color-warning)', cursor: 'pointer' }}>
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteCategory(cat.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add/Edit Category Form */}
          <div className="glass-card">
            <h3>{categoryId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
              Masukkan nama kategori dan upload file SVG ikon untuk penanda peta.
            </p>
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama Kategori</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: Modem, Server, Firewall"
                  value={categoryName} 
                  onChange={(e) => setCategoryName(e.target.value)} 
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)', outline: 'none' }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Upload File SVG</label>
                <div style={{
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  position: 'relative'
                }}>
                  <input 
                    type="file" 
                    accept=".svg"
                    onChange={handleSvgUpload} 
                    style={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      opacity: 0,
                      cursor: 'pointer'
                    }}
                  />
                  <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    Klik untuk memilih file SVG
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Hanya berkas .svg yang didukung.
                  </p>
                </div>
              </div>

              {categorySvgIcon && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Preview Ikon Terupload</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div 
                        style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}
                        dangerouslySetInnerHTML={{ 
                          __html: categorySvgIcon
                            .replace(/var\(--top-color-1\)/g, '#4ade80')
                            .replace(/var\(--top-color-2\)/g, '#10b981')
                            .replace(/var\(--body-color-1\)/g, '#10b981')
                            .replace(/var\(--body-color-2\)/g, '#047857')
                            .replace(/var\(--left-color-1\)/g, '#059669')
                            .replace(/var\(--left-color-2\)/g, '#064e3b')
                            .replace(/var\(--shadow-color\)/g, 'rgba(16,185,129,0.3)')
                        }} 
                      />
                      <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 600 }}>Up</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div 
                        style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                        dangerouslySetInnerHTML={{ 
                          __html: categorySvgIcon
                            .replace(/var\(--top-color-1\)/g, '#f87171')
                            .replace(/var\(--top-color-2\)/g, '#ef4444')
                            .replace(/var\(--body-color-1\)/g, '#ef4444')
                            .replace(/var\(--body-color-2\)/g, '#b91c1c')
                            .replace(/var\(--left-color-1\)/g, '#dc2626')
                            .replace(/var\(--left-color-2\)/g, '#7f1d1d')
                            .replace(/var\(--shadow-color\)/g, 'rgba(239,68,68,0.3)')
                        }} 
                      />
                      <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 600 }}>Down</span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>Tips Mewarnai Otomatis:</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '10px', lineHeight: '1.3' }}>
                        Gunakan kode <code style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '1px 2px', borderRadius: '3px' }}>var(--top-color-1)</code>, <code style={{ backgroundColor: 'rgba(0,0,0,0.05)', padding: '1px 2px', borderRadius: '3px' }}>var(--body-color-1)</code> dsb. di dalam fill/stroke SVG Anda agar otomatis berubah warna hijau/merah/orange berdasarkan status perangkat.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Simpan Kategori</button>
                {categoryId && (
                  <button type="button" onClick={resetCategoryForm} className="btn-primary" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', justifyContent: 'center' }}>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              const isUp = d.status === 'Up';
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
                  {/* Edit/Delete Kebab buttons */}
                  <div style={{ position: 'absolute', right: '16px', top: '16px', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleEditDevice(d)}
                      style={{ background: 'rgba(234, 179, 8, 0.15)', border: 'none', color: 'var(--color-warning)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteDevice(d.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: 'var(--color-danger)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Dynamic Hardware Render / Device Mock Image */}
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
                        backgroundColor: isUp ? '#10b981' : '#ef4444',
                        boxShadow: isUp ? '0 0 8px #10b981' : '0 0 8px #ef4444'
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
                            backgroundColor: isUp && Math.random() > 0.35 ? '#10b981' : '#475569',
                            boxShadow: isUp && Math.random() > 0.35 ? '0 0 3px #10b981' : 'none'
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
                    <button
                      onClick={() => d.web_config_url ? window.open(d.web_config_url, '_blank') : alert('Web config URL tidak tersedia')}
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 14px',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'opacity 0.2s',
                        opacity: d.web_config_url ? 1 : 0.5
                      }}
                    >
                      Access Webconfig
                    </button>

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
                backgroundColor: '#fff', // Light background matching standard modal screenshots
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
                      // Mock map selector - set coordinates randomly in university area
                      setLat(-7.9790 + (Math.random() - 0.5) * 0.005);
                      setLng(112.6300 + (Math.random() - 0.5) * 0.005);
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
                    Select from Map
                  </button>

                  {/* Device Image Upload Mock */}
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
                      id="backbone_chk"
                      checked={isBackbone}
                      onChange={(e) => setIsBackbone(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="backbone_chk" style={{ fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                      Yes, this is core networks
                    </label>
                  </div>

                  {/* Buttons */}
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
      )}
    </div>
  );
};
