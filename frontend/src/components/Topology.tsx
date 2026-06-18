import React, { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network';
import type { Device } from '../types';
import { BACKEND_URL } from '../App';

interface TopologyProps {
  devices: Device[];
  token: string;
  onRefresh: () => void;
  isAdmin: boolean;
}

export const Topology: React.FC<TopologyProps> = ({ devices, token, onRefresh, isAdmin }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);

  // Connection form state
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | ''>('');
  const [selectedParentId, setSelectedParentId] = useState<number | ''>('');
  const [isHierarchical, setIsHierarchical] = useState(true);
  const [msg, setMsg] = useState('');

  // Helper to check if a device is isolated (if any parent in its lineage is Down)
  const checkIsIsolated = (device: Device): boolean => {
    let current = device;
    // Prevent infinite loop in case of circular references
    const visited = new Set<number>();

    while (current.parent_id) {
      if (visited.has(current.id)) break;
      visited.add(current.id);

      const parent = devices.find(d => d.id === current.parent_id);
      if (!parent) break;
      if (parent.status === 'Down') {
        return true;
      }
      current = parent;
    }
    return false;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Create dynamic nodes based on database devices
    const nodes = devices.map(d => {
      const isIsolated = checkIsIsolated(d);
      
      let label = `${d.name}\n[${d.ip_address}]`;
      let backgroundColor = '#10b981'; // Up (Green)

      if (d.status === 'Down') {
        backgroundColor = '#ef4444'; // Down (Red)
        label += '\n[Offline]';
      } else if (isIsolated) {
        backgroundColor = '#64748b'; // Isolated (Grey)
        label += '\n[Isolated]';
      } else if (d.status === 'Warning') {
        backgroundColor = '#f59e0b'; // Warning (Orange)
        label += '\n[Warning]';
      } else if (d.status === 'Maintenance') {
        backgroundColor = '#8b5cf6'; // Maintenance (Purple)
        label += '\n[Maintenance]';
      } else {
        label += '\n[Online]';
      }

      // Router/Switch gets box, AP gets ellipse
      const shape = d.type === 'Access_Point' ? 'ellipse' : 'box';

      return {
        id: d.id,
        label,
        shape,
        color: {
          background: backgroundColor,
          border: '#ffffff',
          highlight: {
            background: 'var(--accent-primary)',
            border: '#ffffff'
          }
        },
        font: { color: '#ffffff', face: 'Outfit', size: 12, strokeWidth: 1, strokeColor: '#0f172a' }
      };
    });

    // Create dynamic edges based on parent_id connections
    const edges: any[] = [];
    devices.forEach(d => {
      if (d.parent_id) {
        const parentExists = devices.some(p => p.id === d.parent_id);
        if (parentExists) {
          edges.push({
            from: d.parent_id,
            to: d.id,
            width: d.is_backbone ? 3 : 2,
            color: d.status === 'Down' || checkIsIsolated(d) ? '#94a3b8' : '#38bdf8',
            arrows: 'to'
          });
        }
      }
    });

    const data = { nodes, edges };
    
    const options = {
      layout: isHierarchical ? {
        hierarchical: {
          direction: 'UD',
          sortMethod: 'directed',
          nodeSpacing: 180,
          levelSeparation: 110,
          parentCentralization: true
        }
      } : {
        hierarchical: false
      },
      physics: {
        enabled: !isHierarchical, // Enable physics only in free view for organic structure
        stabilization: true,
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04
        }
      },
      interaction: {
        dragNodes: true,
        zoomView: true,
        dragView: true
      }
    };

    networkInstance.current = new Network(containerRef.current, data, options as any);

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy();
        networkInstance.current = null;
      }
    };
  }, [devices, isHierarchical]);

  const handleUpdateConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceId) return;
    setMsg('');

    const targetDev = devices.find(d => d.id === selectedDeviceId);
    if (!targetDev) return;

    // Prevent linking a device to itself
    if (selectedDeviceId === selectedParentId) {
      alert('Perangkat tidak bisa terhubung ke dirinya sendiri.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/devices/${selectedDeviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...targetDev,
          parent_id: selectedParentId === '' ? null : selectedParentId
        })
      });

      if (response.ok) {
        setMsg('✓ Link topology berhasil diperbarui.');
        setSelectedDeviceId('');
        setSelectedParentId('');
        onRefresh();
      } else {
        const err = await response.json();
        setMsg(`Error: ${err.error}`);
      }
    } catch (error) {
      setMsg('Gagal menyambung ke server.');
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: 0 }}>Topology - Custom Network Editor</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
            Visualisasikan hubungan logis perangkat jaringan Anda. Geser node secara bebas untuk merancang diagram kustom.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsHierarchical(true)}
            style={{
              backgroundColor: isHierarchical ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Pohon (Hierarki)
          </button>
          <button
            onClick={() => setIsHierarchical(false)}
            style={{
              backgroundColor: !isHierarchical ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Bebas (The Dude Vibe)
          </button>
        </div>
      </div>

      {isAdmin && (
        <form onSubmit={handleUpdateConnection} className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 200px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pilih Perangkat</label>
            <select
              required
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(parseInt(e.target.value) || '')}
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="">-- Pilih Perangkat --</option>
              {devices.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.ip_address})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: '1 1 200px' }}>
            <label style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Hubungkan ke Parent (Induk)</label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(parseInt(e.target.value) || '')}
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '13px', cursor: 'pointer' }}
            >
              <option value="">-- Tanpa Induk (Root Node) --</option>
              {devices.filter(d => d.id !== selectedDeviceId).map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.ip_address})</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
            }}
          >
            Hubungkan Link +
          </button>

          {msg && (
            <div style={{
              fontSize: '12px',
              color: msg.startsWith('✓') ? '#22c55e' : '#ef4444',
              alignSelf: 'center',
              fontWeight: 600
            }}>
              {msg}
            </div>
          )}
        </form>
      )}

      {/* Vis Network Container */}
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '480px', 
          backgroundColor: 'rgba(0,0,0,0.35)', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.5)'
        }} 
      />
    </div>
  );
};
