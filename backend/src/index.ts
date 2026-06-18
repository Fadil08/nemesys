import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { pool, initializeDatabase } from './db';
import { initTelegramBot, sendTelegramAlert, updateTelegramMessage } from './telegram';
import { syncZabbixHosts, testZabbixConnection } from './zabbix';

dotenv.config();

const app = express();

// Detect if running on Vercel (serverless) or locally
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;

let io: Server | null = null;
let httpServer: ReturnType<typeof createServer> | null = null;

// Only create HTTP server + Socket.io when NOT on Vercel
if (!IS_VERCEL) {
  httpServer = createServer(app);
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
}

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

import { handleLogin } from './auth';
import crudRouter from './routes/crud';

app.post('/api/login', handleLogin);

// Broadcast database change helper (no-op on Vercel)
async function broadcastUpdate() {
  if (io) {
    io.emit('data_changed');
  }
}

// Track if database has been initialized (for serverless cold starts)
let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
}

// Middleware: ensure DB is ready on every Vercel request (cold start handling)
if (IS_VERCEL) {
  app.use(async (req, res, next) => {
    try {
      await ensureDbInitialized();
      next();
    } catch (error) {
      console.error('DB initialization error:', error);
      res.status(500).json({ error: 'Database initialization failed' });
    }
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: IS_VERCEL ? 'vercel' : 'local', timestamp: new Date().toISOString() });
});

// ----------------------------------------------------
// REST API Endpoints
// ----------------------------------------------------

app.get('/api/devices', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM devices');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching devices' });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching tasks' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching users' });
  }
});

app.get('/api/missions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM missions ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching missions' });
  }
});

app.get('/api/temp-logs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM temp_logs ORDER BY id DESC LIMIT 10');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching temperature logs' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM device_categories ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching device categories' });
  }
});

// Zabbix API connection test & manual sync endpoints
app.get('/api/zabbix/test', async (req, res) => {
  const result = await testZabbixConnection();
  res.json(result);
});

app.post('/api/zabbix/sync', async (req, res) => {
  try {
    await syncZabbixHosts();
    res.json({ success: true, message: 'Zabbix sync manually triggered and completed' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || String(error) });
  }
});

// Zabbix Webhook Receiver / Simulated Alert
app.post('/api/alerts/trigger', async (req, res) => {
  try {
    // Pick an active device to fail
    const [activeDevices]: any = await pool.query('SELECT * FROM devices WHERE status = "Up" AND id != 1');
    if (activeDevices.length === 0) {
      return res.status(400).json({ error: 'All devices are already Down' });
    }
    const targetDevice = activeDevices[Math.floor(Math.random() * activeDevices.length)];

    // 1. Change device status
    await pool.query('UPDATE devices SET status = "Down" WHERE id = ?', [targetDevice.id]);

    // 2. Insert Daily Task
    const newTaskId = Date.now();
    const startedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const severity = targetDevice.is_backbone ? 'Emergency' : 'Alert';

    await pool.query(
      'INSERT INTO tasks (id, device_id, device_name, ip_address, location, status, severity, started_at, sla_minutes) VALUES (?, ?, ?, ?, ?, "Open", ?, ?, 30)',
      [newTaskId, targetDevice.id, targetDevice.name, targetDevice.ip_address, targetDevice.location, severity, startedAt]
    );

    // 3. Push telegram alert
    await sendTelegramAlert({
      id: newTaskId,
      device_name: targetDevice.name,
      ip_address: targetDevice.ip_address,
      location: targetDevice.location,
      severity,
    });

    broadcastUpdate();
    res.json({ message: `Triggered DOWN state for ${targetDevice.name}`, taskId: newTaskId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Manager approve ticket (Open → Approved)
app.post('/api/tasks/:id/approve', async (req, res) => {
  const taskId = parseInt(req.params.id);
  try {
    const [taskRows]: any = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (taskRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (taskRows[0].status !== 'Open') {
      return res.status(400).json({ error: 'Hanya tiket berstatus Open yang bisa di-approve' });
    }
    await pool.query('UPDATE tasks SET status = "Approved" WHERE id = ?', [taskId]);
    broadcastUpdate();
    res.json({ message: 'Tiket berhasil di-approve oleh Manager' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error approving task' });
  }
});

// Manager reject ticket (Open → Rejected, device back to Up)
app.post('/api/tasks/:id/reject', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { reason } = req.body;
  try {
    const [taskRows]: any = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (taskRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (taskRows[0].status !== 'Open') {
      return res.status(400).json({ error: 'Hanya tiket berstatus Open yang bisa di-reject' });
    }
    const task = taskRows[0];
    const rejectedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // 1. Reject ticket
    await pool.query(
      'UPDATE tasks SET status = "Rejected", completed_at = ?, resolution_notes = ? WHERE id = ?',
      [rejectedAt, reason || 'Tiket ditolak oleh Manager.', taskId]
    );

    // 2. Restore device status to Up
    await pool.query('UPDATE devices SET status = "Up" WHERE id = ?', [task.device_id]);

    broadcastUpdate();
    res.json({ message: 'Tiket berhasil di-reject oleh Manager' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error rejecting task' });
  }
});

// Manual assign task (only for Approved tickets)
app.post('/api/tasks/:id/assign', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { userId } = req.body;

  try {
    // Verify task exists and is in Approved status
    const [taskCheck]: any = await pool.query('SELECT status FROM tasks WHERE id = ?', [taskId]);
    if (taskCheck.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (taskCheck[0].status !== 'Approved' && taskCheck[0].status !== 'In Progress') {
      return res.status(400).json({ error: 'Tiket harus di-approve Manager terlebih dahulu sebelum bisa di-assign' });
    }

    const [userRows]: any = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRows[0];

    // Update task
    await pool.query(
      'UPDATE tasks SET assigned_user_id = ?, assigned_user_name = ?, status = "In Progress" WHERE id = ?',
      [user.id, user.name, taskId]
    );

    // Update user stats
    await pool.query('UPDATE users SET status = "Busy", daily_tasks_count = daily_tasks_count + 1 WHERE id = ?', [user.id]);

    broadcastUpdate();
    res.json({ message: 'Task assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Complete task endpoint with resolution notes
app.post('/api/tasks/:id/complete', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { resolution_notes } = req.body;
  const completedTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

  try {
    const [taskRows]: any = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (taskRows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    const task = taskRows[0];

    // 1. Device up
    await pool.query('UPDATE devices SET status = "Up" WHERE id = ?', [task.device_id]);

    // 2. Complete task
    await pool.query(
      'UPDATE tasks SET status = "Completed", completed_at = ?, resolution_notes = ? WHERE id = ?',
      [completedTime, resolution_notes || 'Tindakan perbaikan selesai.', taskId]
    );

    // 3. Record Mission
    await pool.query(
      'INSERT INTO missions (id, task_id, user_id, user_name, task_device_name, status, completed_at, resolution_notes) VALUES (?, ?, ?, ?, ?, "Completed", ?, ?)',
      [Date.now(), taskId, task.assigned_user_id, task.assigned_user_name, task.device_name, completedTime, resolution_notes || 'Tindakan perbaikan selesai.']
    );

    // 4. Update technician scores
    if (task.assigned_user_id) {
      await pool.query(
        'UPDATE users SET status = "Available", daily_tasks_count = GREATEST(0, daily_tasks_count - 1), mission_completed = mission_completed + 1 WHERE id = ?',
        [task.assigned_user_id]
      );
    }

    // Update Telegram Bot
    await updateTelegramMessage({ id: taskId, device_name: task.device_name }, 'Completed');

    broadcastUpdate();
    res.json({ message: 'Task completed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update task steps checklist
app.put('/api/tasks/:id/steps', async (req, res) => {
  const taskId = parseInt(req.params.id);
  const { steps } = req.body;
  try {
    const stepsStr = typeof steps === 'string' ? steps : JSON.stringify(steps);
    await pool.query('UPDATE tasks SET steps = ? WHERE id = ?', [stepsStr, taskId]);
    broadcastUpdate();
    res.json({ message: 'Task steps updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error updating task steps' });
  }
});

// Manually create network incident ticket
app.post('/api/tasks', async (req, res) => {
  const { deviceId, severity, slaMinutes } = req.body;
  const newTaskId = Date.now();
  const startedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

  try {
    const [deviceRows]: any = await pool.query('SELECT * FROM devices WHERE id = ?', [deviceId]);
    if (deviceRows.length === 0) {
      return res.status(404).json({ error: 'Device not found' });
    }
    const device = deviceRows[0];

    // Change device status to Down
    await pool.query('UPDATE devices SET status = "Down" WHERE id = ?', [device.id]);

    // Insert task
    await pool.query(
      'INSERT INTO tasks (id, device_id, device_name, ip_address, location, status, severity, started_at, sla_minutes) VALUES (?, ?, ?, ?, ?, "Open", ?, ?, ?)',
      [newTaskId, device.id, device.name, device.ip_address, device.location, severity || 'Alert', startedAt, slaMinutes || 30]
    );

    // Send Telegram Alert
    await sendTelegramAlert({
      id: newTaskId,
      device_name: device.name,
      ip_address: device.ip_address,
      location: device.location,
      severity: severity || 'Alert',
    });

    broadcastUpdate();
    res.status(201).json({ message: 'Task created successfully', taskId: newTaskId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error creating task' });
  }
});

// Daily Todos checklist CRUD
app.get('/api/daily-todos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM daily_todos ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'DB error fetching daily todos' });
  }
});

app.post('/api/daily-todos', async (req, res) => {
  const { task_name } = req.body;
  try {
    const [result]: any = await pool.query('INSERT INTO daily_todos (task_name) VALUES (?)', [task_name]);
    broadcastUpdate();
    res.status(201).json({ id: result.insertId, message: 'Todo created' });
  } catch (error) {
    res.status(500).json({ error: 'DB error creating todo' });
  }
});

app.put('/api/daily-todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { task_name, is_completed } = req.body;
  try {
    await pool.query(
      'UPDATE daily_todos SET task_name = ?, is_completed = ? WHERE id = ?',
      [task_name, is_completed ? 1 : 0, id]
    );
    broadcastUpdate();
    res.json({ message: 'Todo updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'DB error updating todo' });
  }
});

app.delete('/api/daily-todos/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query('DELETE FROM daily_todos WHERE id = ?', [id]);
    broadcastUpdate();
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'DB error deleting todo' });
  }
});

// Custom Missions CRUD
app.get('/api/custom-missions', async (req, res) => {
  try {
    const [missions]: any = await pool.query('SELECT * FROM custom_missions ORDER BY id DESC');
    const [participants]: any = await pool.query(
      'SELECT mp.mission_id, u.id, u.name, u.username, u.role FROM mission_participants mp JOIN users u ON mp.user_id = u.id'
    );
    
    const mappedMissions = missions.map((m: any) => {
      return {
        ...m,
        personnels: participants.filter((p: any) => p.mission_id === m.id)
      };
    });
    res.json(mappedMissions);
  } catch (error) {
    res.status(500).json({ error: 'DB error fetching custom missions' });
  }
});

app.post('/api/custom-missions', async (req, res) => {
  const { title, description, slots, user_ids, created_by, date_finished, duration_str, note, mission_image, progress_percent, status } = req.body;
  const createdAt = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(' pukul', ' -');
  
  try {
    const [result]: any = await pool.query(
      'INSERT INTO custom_missions (title, description, slots, progress_percent, created_at, status, created_by, date_finished, duration_str, note, mission_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, slots, progress_percent || 0, createdAt, status || 'Active', created_by || null, date_finished || null, duration_str || null, note || null, mission_image || null]
    );
    const missionId = result.insertId;

    if (user_ids && Array.isArray(user_ids)) {
      for (const userId of user_ids) {
        await pool.query('INSERT INTO mission_participants (mission_id, user_id) VALUES (?, ?)', [missionId, userId]);
      }
    }
    broadcastUpdate();
    res.status(201).json({ id: missionId, message: 'Mission created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'DB error creating mission' });
  }
});

app.put('/api/custom-missions/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, slots, progress_percent, status, user_ids, created_by, date_finished, duration_str, note, mission_image } = req.body;
  try {
    await pool.query(
      'UPDATE custom_missions SET title = ?, description = ?, slots = ?, progress_percent = ?, status = ?, created_by = ?, date_finished = ?, duration_str = ?, note = ?, mission_image = ? WHERE id = ?',
      [title, description || null, slots, progress_percent, status, created_by || null, date_finished || null, duration_str || null, note || null, mission_image || null, id]
    );
    
    if (user_ids && Array.isArray(user_ids)) {
      await pool.query('DELETE FROM mission_participants WHERE mission_id = ?', [id]);
      for (const userId of user_ids) {
        await pool.query('INSERT INTO mission_participants (mission_id, user_id) VALUES (?, ?)', [id, userId]);
      }
    }
    broadcastUpdate();
    res.json({ message: 'Mission updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'DB error updating mission' });
  }
});

app.delete('/api/custom-missions/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query('DELETE FROM custom_missions WHERE id = ?', [id]);
    await pool.query('DELETE FROM mission_participants WHERE mission_id = ?', [id]);
    broadcastUpdate();
    res.json({ message: 'Mission deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'DB error deleting mission' });
  }
});

// Periodic Temp update route
app.post('/api/temp/update', async (req, res) => {
  const { temperature } = req.body;
  const recordedAt = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  try {
    await pool.query('INSERT INTO temp_logs (temperature, recorded_at) VALUES (?, ?)', [temperature, recordedAt]);
    broadcastUpdate();
    res.json({ message: 'Temperature log inserted' });
  } catch (error) {
    res.status(500).json({ error: 'DB error log temperature' });
  }
});

// ----------------------------------------------------
// Telegram bot triggered callbacks
// ----------------------------------------------------
const handleTelegramBotAction = async (action: 'accept' | 'complete', taskId: number) => {
  try {
    const [taskRows]: any = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (taskRows.length === 0) return;
    const task = taskRows[0];

    if (action === 'accept') {
      // Find first available technician
      const [techRows]: any = await pool.query('SELECT * FROM users WHERE role = "Teknisi" AND status = "Available" LIMIT 1');
      const tech = techRows.length > 0 ? techRows[0] : (await pool.query('SELECT * FROM users WHERE role = "Teknisi" LIMIT 1') as any)[0][0];

      if (!tech) return;

      // Update task and technician
      await pool.query('UPDATE tasks SET assigned_user_id = ?, assigned_user_name = ?, status = "In Progress" WHERE id = ?', [tech.id, tech.name, taskId]);
      await pool.query('UPDATE users SET status = "Busy", daily_tasks_count = daily_tasks_count + 1 WHERE id = ?', [tech.id]);
      
      await updateTelegramMessage({ id: taskId, device_name: task.device_name }, 'In Progress');

    } else if (action === 'complete') {
      const completedTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

      // 1. Device up
      await pool.query('UPDATE devices SET status = "Up" WHERE id = ?', [task.device_id]);

      // 2. Complete task
      await pool.query('UPDATE tasks SET status = "Completed", completed_at = ?, resolution_notes = "Diselesaikan via Bot Telegram" WHERE id = ?', [completedTime, taskId]);

      // 3. Record Mission
      await pool.query(
        'INSERT INTO missions (id, task_id, user_id, user_name, task_device_name, status, completed_at, resolution_notes) VALUES (?, ?, ?, ?, ?, "Completed", ?, "Diselesaikan via Bot Telegram")',
        [Date.now(), taskId, task.assigned_user_id, task.assigned_user_name, task.device_name, completedTime]
      );

      // 4. Update technician scores
      await pool.query(
        'UPDATE users SET status = "Available", daily_tasks_count = GREATEST(0, daily_tasks_count - 1), mission_completed = mission_completed + 1 WHERE id = ?',
        [task.assigned_user_id]
      );

      await updateTelegramMessage({ id: taskId, device_name: task.device_name }, 'Completed');
    }

    broadcastUpdate();
  } catch (err) {
    console.error('Failed to handle telegram trigger action:', err);
  }
};

app.use('/api', crudRouter);

// ----------------------------------------------------
// Server Start: Local vs Vercel
// ----------------------------------------------------
if (!IS_VERCEL) {
  // LOCAL MODE: Start traditional HTTP server with WebSocket + Telegram + Zabbix polling
  const PORT = process.env.PORT || 5000;

  async function start() {
    await initializeDatabase();
    initTelegramBot(handleTelegramBotAction);

    // Sync Zabbix hosts on startup and then every 30 seconds
    await syncZabbixHosts();
    setInterval(async () => {
      await syncZabbixHosts();
      broadcastUpdate();
    }, 30000);

    httpServer!.listen(PORT, () => {
      console.log(`🚀 Server NEMESYS running on port ${PORT}`);
    });
  }

  start();
}

// VERCEL MODE: Export the Express app as the default handler for serverless
export default app;
