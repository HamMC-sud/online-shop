import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'crypto';

export async function hashPassword(value: string): Promise<string> {
  return argon2.hash(value);
}

export async function verifyPassword(
  value: string,
  hash: string,
): Promise<boolean> {
  return argon2.verify(hash, value);
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function hashCode(code: string): Promise<string> {
  return argon2.hash(code);
}

export async function verifyCode(code: string, hash: string): Promise<boolean> {
  return argon2.verify(hash, code);
}

export function generateOpaqueToken(size = 32): string {
  return randomBytes(size).toString('hex');
}
