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

// ----------------------------------------------------
// OPEN TICKETS CRUD
// ----------------------------------------------------

// GET all open tickets with filtering and search
router.get('/open-tickets', async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM open_tickets WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (full_name LIKE ? OR ticket_number LIKE ? OR email LIKE ? OR whatsapp_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit as string), parseInt(offset as string));

    const [tickets]: any = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM open_tickets WHERE 1=1';
    const countParams: any[] = [];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    if (search) {
      countQuery += ' AND (full_name LIKE ? OR ticket_number LIKE ? OR email LIKE ? OR whatsapp_number LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const [countResult]: any = await pool.query(countQuery, countParams);
    
    res.json({
      tickets,
      total: countResult[0].total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error fetching tickets' });
  }
});

// GET single open ticket
router.get('/open-tickets/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [tickets]: any = await pool.query('SELECT * FROM open_tickets WHERE id = ?', [id]);
    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(tickets[0]);
  } catch (error) {
    res.status(500).json({ error: 'Database error fetching ticket' });
  }
});

// POST create new open ticket
router.post('/open-tickets', async (req, res) => {
  const { full_name, id_number, category, unit_specification, email, whatsapp_number, service_type, description } = req.body;

  // Validate required fields
  if (!full_name || !id_number || !category || !email || !whatsapp_number || !service_type || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}`;
    const now = new Date().toLocaleString('id-ID');

    const [result]: any = await pool.query(
      'INSERT INTO open_tickets (ticket_number, full_name, id_number, category, unit_specification, email, whatsapp_number, service_type, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, "Open", ?, ?)',
      [ticketNumber, full_name, id_number, category, unit_specification, email, whatsapp_number, service_type, description, now, now]
    );

    res.status(201).json({ 
      id: result.insertId, 
      ticket_number: ticketNumber,
      message: 'Ticket created successfully' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error creating ticket' });
  }
});

// PUT update open ticket
router.put('/open-tickets/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { full_name, id_number, category, unit_specification, email, whatsapp_number, service_type, description, status, assigned_user_id, assigned_user_name, resolution_notes } = req.body;

  try {
    const now = new Date().toLocaleString('id-ID');
    
    await pool.query(
      'UPDATE open_tickets SET full_name = ?, id_number = ?, category = ?, unit_specification = ?, email = ?, whatsapp_number = ?, service_type = ?, description = ?, status = ?, assigned_user_id = ?, assigned_user_name = ?, resolution_notes = ?, updated_at = ? WHERE id = ?',
      [full_name, id_number, category, unit_specification, email, whatsapp_number, service_type, description, status, assigned_user_id, assigned_user_name, resolution_notes, now, id]
    );

    res.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error updating ticket' });
  }
});

// DELETE open ticket
router.delete('/open-tickets/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query('DELETE FROM open_tickets WHERE id = ?', [id]);
    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Database error deleting ticket' });
  }
});

// GET dashboard stats for open tickets
router.get('/open-tickets/stats/dashboard', async (req, res) => {
  try {
    const [stats]: any = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) as closed_count
      FROM open_tickets
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error fetching stats' });
  }
});

export default router;
