import { jwtVerify } from 'jose';

export const ADMIN_COOKIE = 'bm_admin_token';

const FALLBACK_SECRET = 'bannu-masala-secret-key-123';

export function getJwtSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || FALLBACK_SECRET);
}

export async function verifyAdminToken(token) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload?.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}

export function getRequestToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return request.cookies.get(ADMIN_COOKIE)?.value || null;
}

export async function isAdminRequest(request) {
  const token = getRequestToken(request);
  const payload = await verifyAdminToken(token);
  return Boolean(payload);
}
