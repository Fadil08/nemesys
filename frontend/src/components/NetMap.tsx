import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Device, DeviceCategory } from '../types';

interface NetMapProps {
  devices: Device[];
  isCoreOnly: boolean;
  categories: DeviceCategory[];
}

export const NetMap: React.FC<NetMapProps> = ({ devices, isCoreOnly, categories }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerGroup = useRef<L.LayerGroup | null>(null);

  const filteredDevices = isCoreOnly ? devices.filter(d => d.is_backbone) : devices;

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Center map around UNTAG Banyuwangi Campus
    const centerLatLng: L.LatLngExpression = [-8.2295813,114.3632317];
    
    mapInstance.current = L.map(mapRef.current, {
      center: centerLatLng,
      zoom: 17,
      zoomControl: true
    });

    // Premium light voyager street tiles matching the screenshot's Google Maps vibe
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapInstance.current);

    markerGroup.current = L.layerGroup().addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers on device updates or view mode toggle
  useEffect(() => {
    if (!mapInstance.current || !markerGroup.current) return;

    // Clear previous markers
    markerGroup.current.clearLayers();

    filteredDevices.forEach(device => {
      const isUp = device.status === 'Up';
      
      // Calculate status colors for custom SVGs to inherit
      let topColor1 = '#4ade80', topColor2 = '#10b981';
      let bodyColor1 = '#10b981', bodyColor2 = '#047857';
      let leftColor1 = '#059669', leftColor2 = '#064e3b';
      let shadowColor = 'rgba(16, 185, 129, 0.4)';
      let statusColor = '#10b981';

      if (device.status === 'Down') {
        topColor1 = '#f87171'; topColor2 = '#ef4444';
        bodyColor1 = '#ef4444'; bodyColor2 = '#b91c1c';
        leftColor1 = '#dc2626'; leftColor2 = '#7f1d1d';
        shadowColor = 'rgba(239, 68, 68, 0.5)';
        statusColor = '#ef4444';
      } else if (device.status === 'Warning') {
        topColor1 = '#fbbf24'; topColor2 = '#f59e0b';
        bodyColor1 = '#f59e0b'; bodyColor2 = '#b45309';
        leftColor1 = '#d97706'; leftColor2 = '#78350f';
        shadowColor = 'rgba(245, 158, 11, 0.5)';
        statusColor = '#f59e0b';
      } else if (device.status === 'Maintenance') {
        topColor1 = '#94a3b8'; topColor2 = '#64748b';
        bodyColor1 = '#64748b'; bodyColor2 = '#475569';
        leftColor1 = '#475569'; leftColor2 = '#1e293b';
        shadowColor = 'rgba(100, 116, 139, 0.3)';
        statusColor = '#64748b';
      }

      // Look up category SVG
      const matchedCategory = categories.find(c => c.name.toLowerCase() === device.type.toLowerCase());
      let svgIconMarkup = '';

      if (matchedCategory && matchedCategory.svg_icon) {
        // We will generate a unique ID suffix to avoid duplicate linearGradient ID conflicts on map
        const uniqueId = `map-${device.id}-${device.status}-${Math.random().toString(36).substr(2, 4)}`;
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
          <svg width="34" height="34" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="28" rx="13" ry="5" fill="rgba(0,0,0,0.18)" />
            <path d="M 8,22 A 12,5 0 0,0 32,22 L 32,25 A 12,5 0 0,1 8,25 Z" fill="var(--body-color-2)" />
            <ellipse cx="20" cy="22" rx="12" ry="5" fill="var(--top-color-2)" stroke="#fff" stroke-width="0.8" />
            <path d="M 20,22 L 20,10" stroke="#fff" stroke-width="2" stroke-linecap="round" />
            <circle cx="20" cy="9" r="1.5" fill="#fff" />
            <path d="M 14,9 A 8,8 0 0,1 26,9" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.85" />
            <path d="M 11,6 A 12,12 0 0,1 29,6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
          </svg>
        `;
      }

      // Custom 3D SVG icon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker-3d',
        html: `
          <div style="
            width: 34px;
            height: 34px;
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
            filter: drop-shadow(0px 3px 5px ${shadowColor});
          ">
            ${svgIconMarkup}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const popupContent = `
        <div style="color: #0b0f19; font-family: sans-serif; font-size: 13px;">
          <h4 style="margin: 0 0 6px 0; font-weight: 600;">${device.name}</h4>
          <p style="margin: 0 0 4px 0;"><strong>IP:</strong> ${device.ip_address}</p>
          <p style="margin: 0 0 4px 0;"><strong>Tipe:</strong> ${device.type}</p>
          <p style="margin: 0 0 4px 0;"><strong>Lokasi:</strong> ${device.location}</p>
          <p style="margin: 0 0 4px 0;">
            <strong>Status:</strong> 
            <span style="color: ${isUp ? '#10b981' : '#ef4444'}; font-weight: 600;">
              ${device.status}
            </span>
          </p>
          <p style="margin: 0; font-size: 11px; color: #6b7280;">Last check: ${device.last_ping}</p>
        </div>
      `;

      let lat = device.latitude;
      let lng = device.longitude;

      // Auto-sanitize coordinates with missing decimal separators
      if (lng > 180) {
        const lngStr = String(lng);
        if (lngStr.startsWith('114')) {
          lng = parseFloat('114.' + lngStr.substring(3));
        }
      }
      if (lat < -90) {
        const latStr = String(lat);
        if (latStr.startsWith('-8')) {
          lat = parseFloat('-8.' + latStr.substring(2).replace(/\./g, ''));
        }
      }

      L.marker([lat, lng], { icon: customIcon })
        .bindPopup(popupContent)
        .addTo(markerGroup.current!);
    });

  }, [filteredDevices]);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3>{isCoreOnly ? 'NetMap Core - Infrastruktur Utama Jaringan' : 'NetMap Global - Sebaran Node Geografis'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            {isCoreOnly 
              ? 'Menampilkan perangkat backbone utama (Router Core & Data Center).' 
              : 'Menampilkan seluruh sebaran Access Point, Router, dan Switch di area jangkauan.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} /> Up
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger)' }} /> Down
          </span>
        </div>
      </div>

      {/* Map Element */}
      <div ref={mapRef} style={{ width: '100%', height: '500px', zIndex: 1 }} />
    </div>
  );
};
