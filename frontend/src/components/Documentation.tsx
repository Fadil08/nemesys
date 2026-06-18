import React from 'react';
import { BookOpen, FileText, Search, Plus } from 'lucide-react';

export const Documentation: React.FC = () => {
  const docs = [
    { title: 'SOP Penanganan Router Core Down', category: 'SOP', updated: '2026-06-10' },
    { title: 'Panduan Troubleshooting Gangguan Access Point Gedung', category: 'Troubleshooting', updated: '2026-06-12' },
    { title: 'Konfigurasi IP Addressing Jaringan Universitas', category: 'Configuration', updated: '2026-05-30' },
    { title: 'Inventarisasi Router & Switch Backbone v1.3', category: 'Inventory', updated: '2026-06-01' }
  ];

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} className="text-indigo-400" style={{ color: 'var(--accent-primary)' }} />
          <h3>Dokumentasi SOP & Knowledge Base</h3>
        </div>
        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={() => alert('Fitur upload dokumen SOP baru...')}>
          <Plus size={14} /> Upload SOP
        </button>
      </div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Cari SOP / Panduan perbaikan..."
          style={{
            width: '100%',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 12px 8px 36px',
            color: '#fff',
            fontSize: '13.5px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '12px' }}>
        {docs.map((doc, index) => (
          <div
            key={index}
            style={{
              padding: '20px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <FileText size={24} style={{ color: 'var(--accent-secondary)', marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{doc.title}</h4>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '10px',
                    backgroundColor: 'rgba(6, 182, 212, 0.15)',
                    color: 'var(--accent-secondary)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    marginTop: '6px',
                    fontWeight: 600
                  }}
                >
                  {doc.category}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <span>Diedit: {doc.updated}</span>
              <button
                onClick={() => alert(`Membuka file: ${doc.title}`)}
                style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
              >
                Unduh PDF &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
