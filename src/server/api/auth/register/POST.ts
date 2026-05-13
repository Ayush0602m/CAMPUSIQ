// Register a new user.
// Admin accounts: require adminCode + an institutional (.edu / .ac.in / .edu.in) email
// Student accounts: any valid email
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../../../db/memory.js';
import { generateToken } from '../../../services/auth.js';

const ADMIN_CODE = 'STUDYRAG_ADMIN'; // In a real app, use a secure env variable and not hardcoded

// Institutional email domains accepted for admin accounts
const EDU_PATTERN = /^[^\s@]+@[^\s@]+\.(edu|ac\.in|edu\.in|ac\.uk|edu\.au)$/i;

export default async function handler(req: Request, res: Response) {
  try {
    const { name, email, password, adminCode } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isAdmin = adminCode === ADMIN_CODE;

    // Admins must use an institutional email
    if (isAdmin && !EDU_PATTERN.test(normalizedEmail)) {
      res.status(400).json({
        error: 'Admin accounts require an institutional email address (e.g. name@college.edu or name@college.ac.in)',
      });
      return;
    }

    if (db.getUserByEmail(normalizedEmail)) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      id: randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      isAdmin,
      createdAt: new Date(),
    };

    db.createUser(user);
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', message: String(error) });
  }
}
