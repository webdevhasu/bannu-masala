import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { ADMIN_COOKIE, getJwtSecret } from '@/lib/auth';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map();

function getClientIp(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}

export async function POST(request) {
  const ip = getClientIp(request);
  const now = Date.now();
  const record = attempts.get(ip);

  if (record && now - record.first < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = await new SignJWT({ role: 'admin', username: ADMIN_USERNAME })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(getJwtSecret());

      attempts.delete(ip);

      const response = NextResponse.json({
        success: true,
        token,
        user: { username: ADMIN_USERNAME },
      });

      response.cookies.set(ADMIN_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    if (!record || now - record.first >= WINDOW_MS) {
      attempts.set(ip, { first: now, count: 1 });
    } else {
      attempts.set(ip, { ...record, count: record.count + 1 });
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
