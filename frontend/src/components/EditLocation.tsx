import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Device, DeviceCategory } from '../types';

interface EditLocationProps {
  devices: Device[];
  token: string;
  onRefresh: () => void;
  categories: DeviceCategory[];
}

export const EditLocation: React.FC<EditLocationProps> = ({ devices, token, onRefresh, categories }) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState(-8.2205);
  const [longitude, setLongitude] = useState(114.3595);
  const [msg, setMsg] = useState('');

  // Search/Filter for devices list
  const [deviceSearchQuery, setDeviceSearchQuery] = useState('');

  // Geocoding search query (places search)
  const [placeSearchQuery, setPlaceSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const selectedDevice = devices.find(d => d.id === selectedDeviceId);

  // Filter devices list based on search query
  const filteredDevicesList = devices.filter(d => 
    d.name.toLowerCase().includes(deviceSearchQuery.toLowerCase()) ||
    d.ip_address.includes(deviceSearchQuery) ||
    d.location.toLowerCase().includes(deviceSearchQuery.toLowerCase())
  );

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center: [-8.2205, 114.3595],
      zoom: 17,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapInstance.current);

    // Map click handler to update coordinates
    mapInstance.current.on('click', (e: L.LeafletMouseEvent) => {
      if (!selectedDeviceId) return;
      const { lat, lng } = e.latlng;
      setLatitude(parseFloat(lat.toFixed(6)));
      setLongitude(parseFloat(lng.toFixed(6)));
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update selection details when selectedDevice changes
  useEffect(() => {
    if (selectedDevice) {
      setLocationName(selectedDevice.location);
      setLatitude(selectedDevice.latitude);
      setLongitude(selectedDevice.longitude);
      setMsg('');
    }
  }, [selectedDeviceId]);

  // Update marker position on map when coords update
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    if (selectedDeviceId && selectedDevice) {
      const position: L.LatLngExpression = [latitude, longitude];
      
      // Pan map to new position
      mapInstance.current.setView(position, mapInstance.current.getZoom());

      // Calculate status colors for custom SVGs to inherit
      let topColor1 = '#4ade80', topColor2 = '#10b981';
      let bodyColor1 = '#10b981', bodyColor2 = '#047857';
      let leftColor1 = '#059669', leftColor2 = '#064e3b';
      let shadowColor = 'rgba(16, 185, 129, 0.4)';
      let statusColor = '#10b981';

      if (selectedDevice.status === 'Down') {
        topColor1 = '#f87171'; topColor2 = '#ef4444';
        bodyColor1 = '#ef4444'; bodyColor2 = '#b91c1c';
        leftColor1 = '#dc2626'; leftColor2 = '#7f1d1d';
        shadowColor = 'rgba(239, 68, 68, 0.5)';
        statusColor = '#ef4444';
      } else if (selectedDevice.status === 'Warning') {
        topColor1 = '#fbbf24'; topColor2 = '#f59e0b';
        bodyColor1 = '#f59e0b'; bodyColor2 = '#b45309';
        leftColor1 = '#d97706'; leftColor2 = '#78350f';
        shadowColor = 'rgba(245, 158, 11, 0.5)';
        statusColor = '#f59e0b';
      } else if (selectedDevice.status === 'Maintenance') {
        topColor1 = '#94a3b8'; topColor2 = '#64748b';
        bodyColor1 = '#64748b'; bodyColor2 = '#475569';
        leftColor1 = '#475569'; leftColor2 = '#1e293b';
        shadowColor = 'rgba(100, 116, 139, 0.3)';
        statusColor = '#64748b';
      }

      // Look up category SVG
      const matchedCategory = categories.find(c => c.name.toLowerCase() === selectedDevice.type.toLowerCase());
      let svgIconMarkup = '';

      if (matchedCategory && matchedCategory.svg_icon) {
        const uniqueId = `edit-map-${selectedDevice.id}-${Math.random().toString(36).substr(2, 4)}`;
        svgIconMarkup = matchedCategory.svg_icon
          .replace(/id="topGrad-[^"]*"/g, `id="topGrad-${uniqueId}"`)
          .replace(/url\(#topGrad-[^)]*\)/g, `url(#topGrad-${uniqueId})`)
          .replace(/id="topGrad"/g, `id="topGrad-${uniqueId}"`)
          .replace(/url\(#topGrad\)/g, `url(#topGrad-${uniqueId})`)
          
          .replace(/id="bodyGrad-[^"]*"/g, `id="bodyGrad-${uniqueId}"`)
          .replace(/url\(#bodyGrad-[^)]*\)/g, `url(#bodyGrad-${uniqueId})`)
          .replace(/id="bodyGrad"/g, `id="bodyGrad-${uniqueId}"`)
          .replace(/url\(#bodyGrad\)/g, `url(#bodyGrad-${uniqueId})`)
          
          .replace(/id="leftGrad-[^"]*"/g, `id="leftGrad-${uniqueId}"`)
          .replace(/url\(#leftGrad-[^)]*\)/g, `url(#leftGrad-${uniqueId})`)
          .replace(/id="leftGrad"/g, `id="leftGrad-${uniqueId}"`)
          .replace(/url\(#leftGrad\)/g, `url(#leftGrad-${uniqueId})`);
      } else {
        // Fallback AP icon
        svgIconMarkup = `
          <svg width="38" height="38" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="28" rx="13" ry="5" fill="rgba(0,0,0,0.2)" />
            <path d="M 8,22 A 12,5 0 0,0 32,22 L 32,25 A 12,5 0 0,1 8,25 Z" fill="var(--body-color-2)" />
            <ellipse cx="20" cy="22" rx="12" ry="5" fill="var(--top-color-2)" stroke="#fff" stroke-width="1" />
            <path d="M 20,22 L 20,10" stroke="#fff" stroke-width="2" stroke-linecap="round" />
            <circle cx="20" cy="9" r="1.5" fill="#fff" />
            <path d="M 14,9 A 8,8 0 0,1 26,9" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.85" />
            <path d="M 11,6 A 12,12 0 0,1 29,6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
          </svg>
        `;
      }

      // Create custom 3D div icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-3d',
        html: `
          <div style="
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-10px, -10px);
            color: ${statusColor};
            --top-color-1: ${topColor1};
            --top-color-2: ${topColor2};
            --body-color-1: ${bodyColor1};
            --body-color-2: ${bodyColor2};
            --left-color-1: ${leftColor1};
            --left-color-2: ${leftColor2};
            --shadow-color: ${shadowColor};
            filter: drop-shadow(0px 3px 6px ${shadowColor});
          ">
            ${svgIconMarkup}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      // Add draggable marker
      markerRef.current = L.marker(position, { draggable: true, icon: customIcon })
        .addTo(mapInstance.current)
        .bindPopup(`<strong>${selectedDevice?.name}</strong><br/>Drag marker ini atau klik peta untuk memindahkan`)
        .openPopup();

      // Drag event handler
      markerRef.current.on('dragend', (e: any) => {
        const marker = e.target;
        const position = marker.getLatLng();
        setLatitude(parseFloat(position.lat.toFixed(6)));
        setLongitude(parseFloat(position.lng.toFixed(6)));
      });
    }
  }, [latitude, longitude, selectedDeviceId]);

  // Handle preset clicks (instant coordinate jumps)
  const handlePresetJump = (lat: number, lng: number) => {
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], 17);
      if (selectedDeviceId) {
        setLatitude(lat);
        setLongitude(lng);
      }
    }
  };

  // Search Address Geocoding using free OpenStreetMap Nominatim API
  const handleGeocodeSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeSearchQuery.trim() || !mapInstance.current) return;
    setSearchLoading(true);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeSearchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        mapInstance.current.setView([lat, lon], 17);
        if (selectedDeviceId) {
          setLatitude(parseFloat(lat.toFixed(6)));
          setLongitude(parseFloat(lon.toFixed(6)));
        }
      } else {
        alert('Tempat tidak ditemukan. Silakan masukkan kata kunci pencarian yang lain.');
      }
    } catch (err) {
      console.error(err);
      alert('Gagal melakukan pencarian geocoding.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId || !selectedDevice) return;
    setMsg('');

    try {
      const response = await fetch(`http://localhost:5000/api/devices/${selectedDeviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...selectedDevice,
          location: locationName,
          latitude,
          longitude
        })
      });

      if (response.ok) {
        setMsg('✓ Lokasi perangkat berhasil disimpan.');
        onRefresh();
      } else {
        const err = await response.json();
        setMsg(`Error: ${err.error}`);
      }
    } catch (err) {
      setMsg('Gagal menyambung ke server.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', minHeight: 'calc(100vh - 120px)' }}>
      {/* Left sidebar: list of devices & editor form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Device selector search console */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ margin: 0, color: '#fff' }}>Pilih Perangkat</h4>
          
          <input
            type="text"
            placeholder="Cari perangkat atau IP..."
            value={deviceSearchQuery}
            onChange={(e) => setDeviceSearchQuery(e.target.value)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              color: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '13px',
              outline: 'none'
            }}
          />

          <div style={{
            maxHeight: '180px',
            overflowY: 'auto',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.4)'
          }}>
            {filteredDevicesList.map(d => {
              const isSel = d.id === selectedDeviceId;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDeviceId(d.id)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    backgroundColor: isSel ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: isSel ? 'var(--accent-primary)' : '#fff',
                    fontWeight: isSel ? 600 : 400,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{d.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{d.ip_address} | {d.location}</div>
                </div>
              );
            })}
            {filteredDevicesList.length === 0 && (
              <div style={{ padding: '12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                Tidak ada perangkat ditemukan
              </div>
            )}
          </div>
        </div>

        {selectedDeviceId ? (
          <form onSubmit={handleSaveLocation} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ margin: 0, color: '#fff' }}>Edit Lokasi</h4>
            
            {msg && (
              <div style={{
                backgroundColor: msg.startsWith('✓') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: msg.startsWith('✓') ? '#22c55e' : '#ef4444',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px',
                border: `1px solid ${msg.startsWith('✓') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {msg}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama Perangkat</label>
              <input
                type="text"
                disabled
                value={selectedDevice?.name || ''}
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '13.5px', color: 'var(--text-muted)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Nama Lokasi</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '13.5px', color: '#fff', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Latitude</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '13.5px', color: '#fff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Longitude</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px 12px', fontSize: '13.5px', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
              }}
            >
              Simpan Koordinat
            </button>
          </form>
        ) : (
          <div className="glass-card" style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
            Pilih perangkat untuk mulai memodifikasi koordinat di peta.
          </div>
        )}
      </div>

      {/* Right column: Map visualization & geocoder console */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', position: 'relative' }}>
        {/* Floating Places Search Console */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '60px',
          right: '12px',
          zIndex: 999,
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          pointerEvents: 'auto'
        }}>
          {/* Geocoding Search Form */}
          <form onSubmit={handleGeocodeSearch} style={{ display: 'flex', gap: '6px', flex: 1, maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Cari lokasi (contoh: Untag Banyuwangi)..."
              value={placeSearchQuery}
              onChange={(e) => setPlaceSearchQuery(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12.5px',
                outline: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
              }}
            />
            <button
              type="submit"
              disabled={searchLoading}
              style={{
                backgroundColor: '#6366f1',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(99, 102, 241, 0.2)'
              }}
            >
              {searchLoading ? 'Mencari...' : 'Cari'}
            </button>
          </form>

          {/* Preset Buttons for Quick Campus Jumps */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => handlePresetJump(-8.2205, 114.3595)}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📍 UNTAG BWI
            </button>
            <button
              type="button"
              onClick={() => handlePresetJump(-8.1652, 113.7175)}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📍 UNEJ Jember
            </button>
            <button
              type="button"
              onClick={() => handlePresetJump(-7.9797, 112.6304)}
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                color: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              📍 Malang
            </button>
          </div>
        </div>

        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '520px', zIndex: 1 }} />
      </div>
    </div>
  );
};
