// Authentication service with JWT and bcrypt
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const DEV_FALLBACK_JWT_SECRET = 'default-secret-change-in-production';

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (typeof secret === 'string' && secret.trim().length > 0) {
    console.log("[auth] key loaded from env");
    return secret;
  }
  console.log("missing fallback")
  
  return DEV_FALLBACK_JWT_SECRET;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, resolveJwtSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, resolveJwtSecret()) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
