import jwt from 'jsonwebtoken';

function secret() {
  const s = typeof process.env.JWT_SECRET === 'string' ? process.env.JWT_SECRET.trim() : '';
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

function expiresIn() {
  const e = process.env.JWT_EXPIRES_IN;
  return typeof e === 'string' && e.trim() ? e.trim() : '7d';
}

export function signAccessToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: expiresIn() });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, secret());
}
