import { Router } from 'express';
import { pool } from '../db';
import { requireAuth } from '../auth';

const router = Router();

// Apply auth protection to all CRUD routes
router.use(requireAuth);

// ----------------------------------------------------
// USER CRUD
// ----------------------------------------------------

router.post('/users', async (req, res) => {
  const { username, password, name, role } = req.body;

  try {
    const [result]: any = await pool.query(
      'INSERT INTO users (username, password, name, role, status) VALUES (?, ?, ?, ?, "Available")',
      [username, password || 'password', name, role]
    );
    res.status(201).json({ id: result.insertId, message: 'User created' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
    res.status(500).json({ error: 'Database error creating user' });
  }
});

router.put('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { username, name, role, password, status, daily_tasks_count, mission_completed, mission_incompleted } = req.body;

  try {
    if (password) {
      await pool.query(
        'UPDATE users SET username = ?, password = ?, name = ?, role = ?, status = ?, daily_tasks_count = ?, mission_completed = ?, mission_incompleted = ? WHERE id = ?',
        [username, password, name, role, status || 'Available', daily_tasks_count || 0, mission_completed || 0, mission_incompleted || 0, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET username = ?, name = ?, role = ?, status = ?, daily_tasks_count = ?, mission_completed = ?, mission_incompleted = ? WHERE id = ?',
        [username, name, role, status || 'Available', daily_tasks_count || 0, mission_completed || 0, mission_incompleted || 0, id]
      );
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error updating user' });
  }
});

router.delete('/users/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error deleting user' });
  }
});

// ----------------------------------------------------
// DEVICE CRUD
// ----------------------------------------------------

router.post('/devices', async (req, res) => {
  const { name, type, ip_address, location, latitude, longitude, is_backbone, description, category, web_config_url, device_image, status, battery_percentage, voltage, solar_status, parent_id } = req.body;

  try {
    const [result]: any = await pool.query(
      'INSERT INTO devices (name, type, ip_address, location, latitude, longitude, status, last_ping, is_backbone, description, category, web_config_url, device_image, battery_percentage, voltage, solar_status, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, "Just now", ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name, 
        type, 
        ip_address, 
        location, 
        latitude, 
        longitude, 
        status || "Up", 
        is_backbone ? 1 : 0, 
        description || null, 
        category || null, 
        web_config_url || null, 
        device_image || null,
        battery_percentage !== undefined ? battery_percentage : null,
        voltage !== undefined ? voltage : null,
        solar_status || null,
        parent_id !== undefined ? parent_id : null
      ]
    );
    res.status(201).json({ id: result.insertId, message: 'Device created' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error creating device' });
  }
});

router.put('/devices/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, type, ip_address, location, latitude, longitude, is_backbone, description, category, web_config_url, device_image, status, battery_percentage, voltage, solar_status, parent_id } = req.body;

  try {
    await pool.query(
      'UPDATE devices SET name = ?, type = ?, ip_address = ?, location = ?, latitude = ?, longitude = ?, is_backbone = ?, description = ?, category = ?, web_config_url = ?, device_image = ?, status = ?, battery_percentage = ?, voltage = ?, solar_status = ?, parent_id = ? WHERE id = ?',
      [
        name, 
        type, 
        ip_address, 
        location, 
        latitude, 
        longitude, 
        is_backbone ? 1 : 0, 
        description || null, 
        category || null, 
        web_config_url || null, 
        device_image || null,
        status || 'Up',
        battery_percentage !== undefined ? battery_percentage : null,
        voltage !== undefined ? voltage : null,
        solar_status || null,
        parent_id !== undefined ? parent_id : null,
        id
      ]
    );
    res.json({ message: 'Device updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error updating device' });
  }
});

router.delete('/devices/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await pool.query('DELETE FROM devices WHERE id = ?', [id]);
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error deleting device' });
  }
});

// ----------------------------------------------------
// DEVICE CATEGORIES CRUD
// ----------------------------------------------------

router.post('/categories', async (req, res) => {
  const { name, svg_icon } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO device_categories (name, svg_icon) VALUES (?, ?)',
      [name, svg_icon || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Category created' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nama kategori sudah digunakan' });
    }
    res.status(500).json({ error: 'Database error creating category' });
  }
});

router.put('/categories/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, svg_icon } = req.body;
  try {
    await pool.query(
      'UPDATE device_categories SET name = ?, svg_icon = ? WHERE id = ?',
      [name, svg_icon || null, id]
    );
    res.json({ message: 'Category updated successfully' });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Nama kategori sudah digunakan' });
    }
    res.status(500).json({ error: 'Database error updating category' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query('DELETE FROM device_categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error deleting category' });
  }
});

export default router;
