import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
let bot: TelegramBot | null = null;

export function initTelegramBot(onAction: (action: 'accept' | 'complete', taskId: number) => void) {
  if (!token || token.includes('YOUR_TELEGRAM_BOT_TOKEN')) {
    console.warn('⚠️ WARNING: Telegram Bot Token not set in .env. Bot features will run in simulation mode.');
    return;
  }

  try {
    bot = new TelegramBot(token, { polling: true });
    console.log('🤖 Telegram Bot Service successfully initialized.');

    // Command /start <username>
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
      const chatId = msg.chat.id.toString();
      const usernameParam = match ? match[1] : null;

      if (!usernameParam) {
        bot?.sendMessage(chatId, 'Selamat datang di Nemesys Bot.\nSilakan gunakan perintah: /start <username_dashboard> untuk menghubungkan akun Anda.');
        return;
      }

      try {
        const [rows]: any = await pool.query('SELECT * FROM users WHERE username = ?', [usernameParam]);
        if (rows.length === 0) {
          bot?.sendMessage(chatId, `❌ Gagal menghubungkan: Username "${usernameParam}" tidak ditemukan di database.`);
          return;
        }

        await pool.query('UPDATE users SET telegram_chat_id = ? WHERE username = ?', [chatId, usernameParam]);
        bot?.sendMessage(chatId, `✓ Halo ${rows[0].name}, akun Telegram Anda berhasil terhubung ke Dashboard NEMESYS sebagai role: ${rows[0].role}!`);
      } catch (err) {
        console.error('Error connecting Telegram chat_id:', err);
        bot?.sendMessage(chatId, '❌ Terjadi kesalahan internal saat menghubungkan akun.');
      }
    });

    // Callback query handling (Inline buttons: Terima Tugas, Selesai)
    bot.on('callback_query', async (query) => {
      const data = query.data;
      if (!data) return;

      const [action, taskIdStr] = data.split(':');
      const taskId = parseInt(taskIdStr);

      if (action === 'accept') {
        onAction('accept', taskId);
        bot?.answerCallbackQuery(query.id, { text: 'Tugas diterima!' });
      } else if (action === 'complete') {
        onAction('complete', taskId);
        bot?.answerCallbackQuery(query.id, { text: 'Tugas diselesaikan!' });
      }
    });
  } catch (error) {
    console.error('Failed to start Telegram Bot:', error);
  }
}

// Push alert to all registered technicians or specific assigned tech
export async function sendTelegramAlert(task: { id: number; device_name: string; ip_address: string; location: string; severity: string }) {
  if (!bot) {
    console.log(`[SIMULATED TG BOT ALERT] ${task.device_name} is DOWN.`);
    return;
  }

  try {
    // Get all registered techs to push notification to them
    const [techs]: any = await pool.query('SELECT telegram_chat_id FROM users WHERE role = "Teknisi" AND telegram_chat_id IS NOT NULL');
    
    for (const tech of techs) {
      const message = `🚨 *GANGGUAN BARU DETEKSI ZABBIX*\n\n*Perangkat:* ${task.device_name}\n*IP:* ${task.ip_address}\n*Lokasi:* ${task.location}\n*Tingkat Bahaya:* ${task.severity}\n*Status:* DOWN\n\nSilakan terima tugas melalui tombol di bawah:`;
      
      await bot.sendMessage(tech.telegram_chat_id, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✓ Terima Tugas', callback_data: `accept:${task.id}` }
            ]
          ]
        }
      });
    }
  } catch (err) {
    console.error('Error sending Telegram alert:', err);
  }
}

// Update Telegram message with complete status
export async function updateTelegramMessage(task: { id: number; device_name: string }, status: 'In Progress' | 'Completed') {
  if (!bot) return;

  try {
    const [techs]: any = await pool.query('SELECT telegram_chat_id FROM users WHERE role = "Teknisi" AND telegram_chat_id IS NOT NULL');
    
    for (const tech of techs) {
      if (status === 'In Progress') {
        await bot.sendMessage(tech.telegram_chat_id, `📢 Tugas [${task.device_name}] sedang dikerjakan oleh teknisi.`, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✓ Selesai', callback_data: `complete:${task.id}` }
              ]
            ]
          }
        });
      } else if (status === 'Completed') {
        await bot.sendMessage(tech.telegram_chat_id, `✓ Tugas [${task.device_name}] telah diselesaikan.`);
      }
    }
  } catch (err) {
    console.error('Error updating telegram state message:', err);
  }
}
