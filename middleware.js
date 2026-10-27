import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/auth';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function requiresAdmin(request) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (!pathname.startsWith('/api/')) return false;

  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') return false;
  if (pathname.startsWith('/api/admin/')) return true;

  if (pathname === '/api/upload') return true;

  if (pathname === '/api/orders') return method !== 'POST';
  if (pathname.startsWith('/api/orders/')) return true;

  if (pathname === '/api/products') return method !== 'GET';
  if (pathname.startsWith('/api/products/')) return method !== 'GET';

  if (pathname === '/api/deals') return method !== 'GET';
  if (pathname.startsWith('/api/deals/')) return method !== 'GET';

  if (pathname === '/api/categories') return method !== 'GET';
  if (pathname.startsWith('/api/categories/')) return method !== 'GET';

  if (pathname === '/api/hero-slides') return method !== 'GET';
  if (pathname.startsWith('/api/hero-slides/')) return method !== 'GET';

  if (pathname === '/api/reviews' || pathname.startsWith('/api/reviews/moderate')) return true;

  if (pathname === '/api/contact') return method !== 'POST';
  if (pathname.startsWith('/api/contact/')) return true;

  return false;
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  const host = request.headers.get('host') || '';
  if (host.includes('bannumasala.vercel.app')) {
    const url = request.nextUrl.clone();
    url.host = 'bannumasala.com';
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
  }

  const admin = await isAdminRequest(request);

  if (pathname === '/admin') {
    return NextResponse.redirect(new URL(admin ? '/dashboard' : '/admin/login', request.url));
  }

  if (pathname === '/admin/login') {
    if (admin) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith('/dashboard') && !admin) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/api/')) {
    if (requiresAdmin(request) && !admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: CORS_HEADERS });
    }

    const response = NextResponse.next();
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
