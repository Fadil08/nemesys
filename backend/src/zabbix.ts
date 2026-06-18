import dotenv from 'dotenv';
import { pool } from './db';

dotenv.config();

const zabbixUrl = process.env.ZABBIX_API_URL;
const zabbixUser = process.env.ZABBIX_USER || 'Admin';
const zabbixPassword = process.env.ZABBIX_PASSWORD || 'zabbix';

let zabbixAuthToken: string | null = null;

// Helper to communicate with Zabbix API
async function callZabbixAPI(method: string, params: any, auth: string | null = null) {
  if (!zabbixUrl) return null;

  try {
    const payload: any = {
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now(),
    };

    const headers: any = {
      'Content-Type': 'application/json-rpc',
    };

    if (auth !== null) {
      headers['Authorization'] = `Bearer ${auth}`;
    }

    const response = await fetch(zabbixUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    const result: any = await response.json();
    if (result.error) {
      console.error(`Zabbix API Error [${method}]:`, result.error);
      return null;
    }
    return result.result;
  } catch (error) {
    console.error(`Network error calling Zabbix API [${method}]:`, error);
    return null;
  }
}

// 1. Authenticate with Zabbix
async function getAuthToken() {
  if (zabbixAuthToken) return zabbixAuthToken;

  const result = await callZabbixAPI('user.login', {
    username: zabbixUser,
    password: zabbixPassword,
  });

  if (result) {
    zabbixAuthToken = result;
    return zabbixAuthToken;
  }
  return null;
}

// 2. Fetch hosts from Zabbix and synchronize with MySQL
export async function syncZabbixHosts() {
  if (!zabbixUrl) {
    console.log('Zabbix API URL not configured. Skipping Zabbix hosts synchronization.');
    return;
  }

  const token = await getAuthToken();
  if (!token) {
    console.error('Failed to authenticate with Zabbix. Check ZABBIX_USER/PASSWORD credentials.');
    return;
  }

  // Get hosts with interface details (IP Address)
  const hosts = await callZabbixAPI(
    'host.get',
    {
      output: ['hostid', 'name', 'status', 'available'],
      selectInterfaces: ['ip'],
    },
    token
  );

  if (!hosts || !Array.isArray(hosts)) {
    console.warn('No hosts returned from Zabbix.');
    return;
  }

  console.log(`Syncing ${hosts.length} hosts from Zabbix API to MySQL...`);

  for (const zHost of hosts) {
    // Determine status: Zabbix available: 1 = Up, 2 = Down, 0 = Unknown
    const status = zHost.available === '2' ? 'Down' : 'Up';
    const ipAddress = zHost.interfaces && zHost.interfaces[0] ? zHost.interfaces[0].ip : '0.0.0.0';
    const isBackbone = zHost.name.toLowerCase().includes('core') || zHost.name.toLowerCase().includes('backbone') ? 1 : 0;
    
    // Check if host already exists in database
    const [rows]: any = await pool.query('SELECT * FROM devices WHERE name = ?', [zHost.name]);

    if (rows.length > 0) {
      // Update existing device
      await pool.query(
        'UPDATE devices SET status = ?, ip_address = ?, last_ping = "Just now", is_backbone = ? WHERE name = ?',
        [status, ipAddress, isBackbone, zHost.name]
      );
    } else {
      // Insert new device
      // Generate random lat/long coordinates around the campus map for visualization
      const latitude = -7.9790 + (Math.random() - 0.5) * 0.005;
      const longitude = 112.6300 + (Math.random() - 0.5) * 0.005;
      
      await pool.query(
        'INSERT INTO devices (name, type, ip_address, location, latitude, longitude, status, last_ping, is_backbone) VALUES (?, "Router", ?, "Lokasi Terdeteksi Zabbix", ?, ?, ?, "Just now", ?)',
        [zHost.name, ipAddress, latitude, longitude, status, isBackbone]
      );
    }
  }

  console.log('Zabbix synchronization complete.');
}

export async function testZabbixConnection() {
  if (!zabbixUrl) {
    return { success: false, error: 'Zabbix API URL not configured in .env' };
  }
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: 'Failed to authenticate with Zabbix. Check credentials.' };
    }
    const hosts = await callZabbixAPI(
      'host.get',
      {
        output: ['hostid', 'name', 'status', 'available'],
        selectInterfaces: ['ip'],
      },
      token
    );
    if (!hosts) {
      return { success: false, error: 'Failed to fetch hosts from Zabbix' };
    }
    return { success: true, token, hostsCount: hosts.length, hosts };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

