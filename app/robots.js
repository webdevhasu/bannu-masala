export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/checkout/success'], // Don't index checkout success or APIs
    },
    sitemap: 'https://bannu-masala.vercel.app/sitemap.xml',
  };
}
