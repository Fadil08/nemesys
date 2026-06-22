import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create the pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nemesys',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper to check connection and run auto migration
export async function initializeDatabase() {
  try {
    // 1. Establish connection to server to make sure database exists (or create it)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'nemesys'}\``);
    await connection.end();

    console.log('Database verification successful.');

    // 2. Initialize tables using the pool
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL DEFAULT 'password',
        name VARCHAR(150) NOT NULL,
        role ENUM('Administrator', 'Manager', 'Teknisi') NOT NULL,
        telegram_chat_id VARCHAR(100) NULL,
        status ENUM('Available', 'Busy') NOT NULL DEFAULT 'Available',
        daily_tasks_count INT NOT NULL DEFAULT 0,
        mission_completed INT NOT NULL DEFAULT 0,
        mission_incompleted INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS device_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        svg_icon LONGTEXT NULL
      ) ENGINE=InnoDB;
    `);

    // Migration: Modify type column to VARCHAR to allow custom categories
    try {
      await pool.query('ALTER TABLE devices MODIFY COLUMN type VARCHAR(100) NOT NULL');
      console.log('Migration: devices.type altered to VARCHAR(100).');
    } catch (e) {
      // ignore
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        type VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DOUBLE NOT NULL,
        longitude DOUBLE NOT NULL,
        status ENUM('Up', 'Down') NOT NULL DEFAULT 'Up',
        last_ping VARCHAR(100) NOT NULL,
        is_backbone BOOLEAN NOT NULL DEFAULT FALSE,
        battery_percentage INT NULL,
        voltage DOUBLE NULL,
        solar_status ENUM('Charging', 'Discharging', 'Full') NULL
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id BIGINT PRIMARY KEY,
        device_id INT NOT NULL,
        device_name VARCHAR(150) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        location VARCHAR(255) NOT NULL,
        assigned_user_id INT NULL,
        assigned_user_name VARCHAR(150) NULL,
        status ENUM('Open', 'Approved', 'Rejected', 'In Progress', 'Completed') NOT NULL DEFAULT 'Open',
        severity ENUM('Warning', 'Alert', 'Emergency') NOT NULL DEFAULT 'Alert',
        started_at VARCHAR(100) NOT NULL,
        completed_at VARCHAR(100) NULL,
        sla_minutes INT NOT NULL DEFAULT 30
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id BIGINT PRIMARY KEY,
        task_id BIGINT NOT NULL,
        user_id INT NOT NULL,
        user_name VARCHAR(150) NOT NULL,
        task_device_name VARCHAR(150) NOT NULL,
        status ENUM('Completed', 'Incompleted') NOT NULL,
        completed_at VARCHAR(100) NOT NULL
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS temp_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        temperature DOUBLE NOT NULL,
        recorded_at VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_name VARCHAR(255) NOT NULL,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_missions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        slots INT NOT NULL DEFAULT 1,
        progress_percent INT NOT NULL DEFAULT 0,
        created_at VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'Active'
      ) ENGINE=InnoDB;
    `);

    // Add extra mission columns
    try {
      await pool.query("ALTER TABLE custom_missions ADD COLUMN created_by VARCHAR(150) NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE custom_missions ADD COLUMN date_finished VARCHAR(100) NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE custom_missions ADD COLUMN duration_str VARCHAR(100) NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE custom_missions ADD COLUMN note TEXT NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE custom_missions ADD COLUMN mission_image VARCHAR(255) NULL");
      console.log('Migration: Verified extra custom_missions columns.');
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS mission_participants (
        mission_id INT NOT NULL,
        user_id INT NOT NULL,
        PRIMARY KEY (mission_id, user_id)
      ) ENGINE=InnoDB;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_number VARCHAR(50) NOT NULL UNIQUE,
        reporter_name VARCHAR(150) NOT NULL,
        reporter_id VARCHAR(50) NOT NULL,
        reporter_type VARCHAR(100) NOT NULL,
        reporter_unit VARCHAR(150) NOT NULL,
        email VARCHAR(150) NOT NULL,
        whatsapp VARCHAR(50) NOT NULL,
        category VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('Open', 'In Progress', 'Completed', 'Rejected') NOT NULL DEFAULT 'Open',
        assigned_user_id INT NULL,
        assigned_user_name VARCHAR(150) NULL,
        resolution_notes TEXT NULL,
        created_at VARCHAR(100) NOT NULL,
        updated_at VARCHAR(100) NULL
      ) ENGINE=InnoDB;
    `);

    // Migration: Add password column to users if it doesn't exist
    try {
      await pool.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'password'");
      console.log('Migration: Added password column to users table.');
    } catch (e) {
      // Column probably already exists
    }

    // Migration: Add new device columns if they don't exist
    try {
      await pool.query("ALTER TABLE devices ADD COLUMN description TEXT NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE devices ADD COLUMN category VARCHAR(100) NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE devices ADD COLUMN web_config_url VARCHAR(255) NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE devices ADD COLUMN device_image VARCHAR(255) NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE tasks ADD COLUMN resolution_notes TEXT NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE tasks ADD COLUMN steps TEXT NULL");
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE missions ADD COLUMN resolution_notes TEXT NULL");
      console.log('Migration: Added resolution_notes and steps to tasks and missions tables.');
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE devices ADD COLUMN parent_id INT NULL");
      console.log('Migration: Verified extra device columns (description, category, web_config_url, device_image, parent_id).');
    } catch (e) {}

    // Create open_tickets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS open_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_number VARCHAR(50) NOT NULL UNIQUE,
        full_name VARCHAR(150) NOT NULL,
        id_number VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        unit_specification VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL,
        whatsapp_number VARCHAR(20) NOT NULL,
        service_type VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
        assigned_user_id INT NULL,
        assigned_user_name VARCHAR(150) NULL,
        created_at VARCHAR(100) NOT NULL,
        updated_at VARCHAR(100) NOT NULL,
        resolution_notes TEXT NULL,
        image_url LONGTEXT NULL
      ) ENGINE=InnoDB;
    `);

    try {
      await pool.query("ALTER TABLE open_tickets MODIFY COLUMN category VARCHAR(100) NOT NULL");
      console.log("Migration: open_tickets.category altered to VARCHAR(100)");
    } catch (e) {}

    try {
      await pool.query("ALTER TABLE open_tickets ADD COLUMN image_url LONGTEXT NULL");
      console.log("Migration: open_tickets.image_url added as LONGTEXT");
    } catch (e) {}

    // Migration: Expand tasks status ENUM for Manager approve/reject workflow
    try {
      await pool.query("ALTER TABLE tasks MODIFY COLUMN status ENUM('Open', 'Approved', 'Rejected', 'In Progress', 'Completed') NOT NULL DEFAULT 'Open'");
      console.log('Migration: Expanded tasks.status ENUM with Approved/Rejected.');
    } catch (e) {}

    // Force update default users to have the correct password
    try {
      await pool.query("UPDATE users SET password = 'password' WHERE username IN ('rizal_tech', 'dian_tech')");
      await pool.query("UPDATE users SET password = 'admin123' WHERE username = 'admin_dika'");
      console.log('Migration: Default user passwords synchronized.');
    } catch (e) {
      // ignore
    }

    // Seed initial device categories if empty
    const [categoryRows]: any = await pool.query('SELECT COUNT(*) as count FROM device_categories');
    if (categoryRows[0].count === 0) {
      const defaultRouterSvg = `<svg width="34" height="34" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 5px var(--shadow-color)); overflow: visible;">
  <defs>
    <linearGradient id="topGrad-router" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="var(--top-color-1)" />
      <stop offset="100%" stop-color="var(--top-color-2)" />
    </linearGradient>
    <linearGradient id="bodyGrad-router" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="var(--body-color-1)" />
      <stop offset="100%" stop-color="var(--body-color-2)" />
    </linearGradient>
  </defs>
  <ellipse cx="20" cy="26" rx="15" ry="6" fill="rgba(0,0,0,0.18)" />
  <path d="M 5,18 A 15,6 0 0,0 35,18 L 35,24 A 15,6 0 0,1 5,24 Z" fill="url(#bodyGrad-router)" />
  <ellipse cx="20" cy="18" rx="15" ry="6" fill="url(#topGrad-router)" stroke="#fff" stroke-width="0.8" />
  <path d="M 12,18 L 28,18 M 20,14 L 20,22" stroke="#fff" stroke-width="2" stroke-linecap="round" />
  <path d="M 15,16 L 12,18 L 15,20 M 25,16 L 28,18 L 25,20 M 18,16 L 20,14 L 22,16 M 18,20 L 20,22 L 22,20" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
</svg>`;

      const defaultSwitchSvg = `<svg width="34" height="34" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 5px var(--shadow-color)); overflow: visible;">
  <defs>
    <linearGradient id="topGrad-switch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="var(--top-color-1)" />
      <stop offset="100%" stop-color="var(--top-color-2)" />
    </linearGradient>
    <linearGradient id="bodyGrad-switch" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="var(--body-color-1)" />
      <stop offset="100%" stop-color="var(--body-color-2)" />
    </linearGradient>
    <linearGradient id="leftGrad-switch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="var(--left-color-1)" />
      <stop offset="100%" stop-color="var(--left-color-2)" />
    </linearGradient>
  </defs>
  <polygon points="5,22 20,28 35,22 20,16" fill="rgba(0,0,0,0.18)" />
  <polygon points="5,16 20,10 35,16 20,22" fill="url(#topGrad-switch)" stroke="#fff" stroke-width="0.8" />
  <polygon points="5,16 20,22 20,27 5,21" fill="url(#leftGrad-switch)" />
  <polygon points="20,22 35,16 35,21 20,27" fill="url(#bodyGrad-switch)" />
  <line x1="8" y1="19" x2="17" y2="22.5" stroke="rgba(255,255,255,0.75)" stroke-width="1.5" stroke-dasharray="1.5,1.5" />
  <line x1="23" y1="22.5" x2="32" y2="19" stroke="rgba(255,255,255,0.75)" stroke-width="1.5" stroke-dasharray="1.5,1.5" />
  <path d="M 12,14 C 12,14 20,19 28,14 M 28,18 C 28,18 20,13 12,18" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" />
  <path d="M 25,13 L 28,14 L 26,11 M 15,19 L 12,18 L 14,21" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
</svg>`;

      const defaultAccessPointSvg = `<svg width="34" height="34" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 5px var(--shadow-color)); overflow: visible;">
  <defs>
    <linearGradient id="topGrad-ap" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="var(--top-color-1)" />
      <stop offset="100%" stop-color="var(--top-color-2)" />
    </linearGradient>
    <linearGradient id="bodyGrad-ap" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="var(--body-color-1)" />
      <stop offset="100%" stop-color="var(--body-color-2)" />
    </linearGradient>
  </defs>
  <ellipse cx="20" cy="28" rx="13" ry="5" fill="rgba(0,0,0,0.18)" />
  <path d="M 8,22 A 12,5 0 0,0 32,22 L 32,25 A 12,5 0 0,1 8,25 Z" fill="url(#bodyGrad-ap)" />
  <ellipse cx="20" cy="22" rx="12" ry="5" fill="url(#topGrad-ap)" stroke="#fff" stroke-width="0.8" />
  <path d="M 20,22 L 20,10" stroke="#fff" stroke-width="2" stroke-linecap="round" />
  <circle cx="20" cy="9" r="1.5" fill="#fff" />
  <path d="M 14,9 A 8,8 0 0,1 26,9" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.85" />
  <path d="M 11,6 A 12,12 0 0,1 29,6" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.6" />
</svg>`;

      await pool.query(
        'INSERT INTO device_categories (name, svg_icon) VALUES (?, ?), (?, ?), (?, ?)',
        ['Router', defaultRouterSvg, 'Switch', defaultSwitchSvg, 'Access_Point', defaultAccessPointSvg]
      );
      console.log('Seeded default device categories.');
    }

    // Seed initial users if empty
    const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      await pool.query(`
        INSERT INTO users (id, username, password, name, role, telegram_chat_id, status, daily_tasks_count, mission_completed, mission_incompleted) VALUES
        (1, 'rizal_tech', 'password', 'Rizal Kurniawan', 'Teknisi', '12345678', 'Available', 0, 12, 1),
        (2, 'dian_tech', 'password', 'Dian Prasetyo', 'Teknisi', '87654321', 'Available', 0, 9, 2),
        (3, 'admin_dika', 'admin123', 'Dika Admin', 'Administrator', NULL, 'Available', 0, 0, 0)
      `);
      console.log('Seeded default users.');
    }

    // Seed initial devices (Refreshed for UNTAG Banyuwangi Campus layout)
    const [deviceRows]: any = await pool.query('SELECT COUNT(*) as count FROM devices');
    // If we have old coordinates (Malang/Jember or old off-center BWI), reset devices for precise UNTAG BWI coordinates
    const [sampleDev]: any = await pool.query('SELECT latitude, longitude FROM devices LIMIT 1');
    const needsBwiReset = sampleDev.length > 0 && (sampleDev[0].longitude < 114.3 || sampleDev[0].latitude > -8.225);

    if (deviceRows[0].count === 0 || needsBwiReset) {
      await pool.query('DELETE FROM devices');
      await pool.query(`
        INSERT INTO devices (id, name, type, ip_address, location, latitude, longitude, status, last_ping, is_backbone, battery_percentage, voltage, solar_status) VALUES
        (1, 'Core Router Utama UNTAG BWI', 'Router', '10.10.10.1', 'Gedung Rektorat Lt 1', -8.229581, 114.363231, 'Up', 'Just now', TRUE, NULL, NULL, NULL),
        (2, 'Switch Backbone Rektorat', 'Switch', '10.10.10.2', 'Server Room Rektorat', -8.229181, 114.362931, 'Up', 'Just now', TRUE, NULL, NULL, NULL),
        (3, 'Switch Gedung Kopi BWI', 'Switch', '10.10.20.1', 'Gedung Kopi Center BWI', -8.231181, 114.364131, 'Down', '5m ago', FALSE, NULL, NULL, NULL),
        (4, 'AP-GedungKopi-BWI-01', 'Access_Point', '10.10.20.11', 'Lobi Gazebo Gedung Kopi', -8.231281, 114.364231, 'Down', '5m ago', FALSE, NULL, NULL, NULL),
        (5, 'AP-Rektorat-Lobi', 'Access_Point', '10.10.30.11', 'Lobi Rektorat UNTAG', -8.229081, 114.363031, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (6, 'AP-Perpustakaan-Lt1', 'Access_Point', '10.10.40.11', 'Perpustakaan Lt 1', -8.230081, 114.363831, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (7, 'AP-Teknik-GdA', 'Access_Point', '10.10.50.11', 'Fakultas Teknik Gd A', -8.230581, 114.362231, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (8, 'AP-Teknik-GdB', 'Access_Point', '10.10.50.12', 'Fakultas Teknik Gd B', -8.230881, 114.361931, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (9, 'AP-Hukum-RuangBaca', 'Access_Point', '10.10.60.11', 'Fakultas Hukum R. Baca', -8.228581, 114.362731, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (10, 'AP-Ekonomi-Lobi', 'Access_Point', '10.10.60.12', 'Fakultas Ekonomi Lobi', -8.229381, 114.364531, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (11, 'AP-FISIP-Lobi', 'Access_Point', '10.10.70.11', 'FISIP Lobi Utama', -8.229881, 114.363631, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (12, 'AP-Masjid-Darussalam', 'Access_Point', '10.10.80.11', 'Masjid UNTAG BWI', -8.228281, 114.362531, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (13, 'AP-Student-Center', 'Access_Point', '10.10.90.11', 'Student Center Hall', -8.229681, 114.362731, 'Down', '10m ago', FALSE, NULL, NULL, NULL),
        (14, 'AP-Auditorium-Lt1', 'Access_Point', '10.10.100.11', 'Auditorium Lt 1', -8.230281, 114.363231, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (15, 'AP-Auditorium-Lt2', 'Access_Point', '10.10.100.12', 'Auditorium Lt 2', -8.230381, 114.363331, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (16, 'AP-Lab-Komputer', 'Access_Point', '10.10.110.11', 'Lab Komputer Bersama', -8.230481, 114.362531, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (17, 'AP-Gazebo-Utara', 'Access_Point', '10.10.120.11', 'Gazebo Area Utara', -8.227881, 114.362831, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (18, 'AP-Kantin-Kampus', 'Access_Point', '10.10.130.11', 'Kantin Kampus UNTAG', -8.231381, 114.362631, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (19, 'AP-Parkir-Utama', 'Access_Point', '10.10.140.11', 'Area Parkir Utama', -8.228081, 114.363731, 'Up', 'Just now', FALSE, NULL, NULL, NULL),
        (20, 'AP-Solar-OutdoorBWI', 'Access_Point', '10.10.150.11', 'AP Solar Lapangan Basket', -8.230181, 114.364431, 'Up', 'Just now', FALSE, 90, 12.8, 'Charging'),
        (21, 'AP-Koperasi-Mahasiswa', 'Access_Point', '10.10.160.11', 'Koperasi Mahasiswa BWI', -8.231581, 114.363531, 'Down', '15m ago', FALSE, NULL, NULL, NULL),
        (22, 'AP-Gedung-B-Lobi', 'Access_Point', '10.10.170.11', 'Gedung B Lobi Tengah', -8.230781, 114.362831, 'Up', 'Just now', FALSE, NULL, NULL, NULL)
      `);
      console.log('Seeded UNTAG Banyuwangi precise default devices.');
    }

    console.log('Database tables verified and ready.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  }
}
