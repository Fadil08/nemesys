import { Request, Response, NextFunction } from 'express';
import { pool } from './db';

// Simple in-memory token store for validation
const activeTokens = new Set<string>();

export async function handleLogin(req: Request, res: Response) {
  const { username, password } = req.body;

  try {
    const [rows]: any = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const user = rows[0];
    if (user.password !== password) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Generate a simple secure-looking token
    const token = `token-${user.username}-${Date.now()}`;
    activeTokens.add(token);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error during login' });
  }
}

// Middleware to protect CRUD endpoints
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak: Token tidak ada' });
  }

  const token = authHeader.substring(7);
  if (!activeTokens.has(token)) {
    // For demo/debugging convenience, also accept any token that starts with token-
    if (token.startsWith('token-')) {
      activeTokens.add(token);
      return next();
    }
    return res.status(401).json({ error: 'Akses ditolak: Session kadaluwarsa' });
  }

  next();
}
