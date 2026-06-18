import React from 'react';
import { Send, Check, ShieldAlert } from 'lucide-react';
import type { DailyTask } from '../types';

interface TelegramBotProps {
  tasks: DailyTask[];
  messages: Array<{ id: number; text: string; taskId?: number; showButtons?: boolean }>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAcceptTask: (taskId: number) => void;
  onCompleteTask: (taskId: number) => void;
}

export const TelegramBot: React.FC<TelegramBotProps> = ({
  tasks,
  messages,
  isOpen,
  setIsOpen,
  onAcceptTask,
  onCompleteTask,
}) => {
  if (!isOpen) return null;

  return (
    <div className="telegram-mock-panel">
      <div className="tg-header">
        <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={20} className="text-cyan-400" style={{ color: '#55b6ff' }} />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>@NemesysAlert_Bot</h4>
            <span style={{ fontSize: '10px', color: '#8596a5' }}>Official NMS Notification Bot</span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'transparent', border: 'none', color: '#8596a5', cursor: 'pointer', fontSize: '18px' }}
        >
          &times;
        </button>
      </div>

      <div className="tg-chat-list">
        {messages.map((msg) => (
          <div key={msg.id} className="tg-bubble">
            <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
            {msg.showButtons && msg.taskId && (
              <div className="tg-btn-container">
                {tasks.find((t) => t.id === msg.taskId)?.status === 'Open' ? (
                  <button className="tg-btn" onClick={() => onAcceptTask(msg.taskId!)}>
                    <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Terima Tugas
                  </button>
                ) : tasks.find((t) => t.id === msg.taskId)?.status === 'In Progress' ? (
                  <button className="tg-btn" onClick={() => onCompleteTask(msg.taskId!)}>
                    <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Selesai
                  </button>
                ) : (
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                    ✓ Selesai & Terupdate ke Web
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          padding: '12px',
          backgroundColor: '#24303f',
          display: 'flex',
          gap: '8px',
          borderTop: '1px solid rgba(0,0,0,0.15)',
        }}
      >
        <input
          type="text"
          placeholder="Tulis pesan /start <username>..."
          disabled
          style={{
            flex: 1,
            backgroundColor: '#182533',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '13px',
          }}
        />
        <button
          style={{
            backgroundColor: '#55b6ff',
            border: 'none',
            borderRadius: '6px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'not-allowed',
          }}
        >
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
};
