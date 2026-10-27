export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bannumasala.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/checkout', '/dashboard', '/admin'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
