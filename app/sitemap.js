import sql from '@/lib/db';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bannumasala.com';

  const products = await sql`SELECT slug FROM products WHERE is_active = true`;

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const pages = [
    { path: '', priority: 1, changeFrequency: 'weekly' },
    { path: '/products', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/deals', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/reviews', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/shipping-policy', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/returns-policy', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/privacy-policy', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/terms-and-conditions', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/faqs', priority: 0.4, changeFrequency: 'monthly' },
  ];

  return [
    ...pages.map((page) => ({
      url: `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...productUrls,
  ];
}
