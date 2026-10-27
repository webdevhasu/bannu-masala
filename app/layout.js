import './globals.css';
import { CartProvider } from '@/components/CartContext';
import SiteChrome from '@/components/SiteChrome';
import { getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bannumasala.com';

export const metadata = {
  title: 'Bannu Masala | Premium Authentic Spices & Handcrafted Blends',
  description: 'Authentic handcrafted spice blends from Bannu, KPK. Shop Bannu Masala products online.',
  keywords: 'Bannu Masala, handcrafted spice blends, biryani masala, karahi masala, tikka masala, KPK spices, Bannu spices',
  authors: [{ name: 'Bannu Masala Team' }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'lsk5o-P8Ns6haaZc1jZs8h20ZScB3C_DqyJw-XrQY8E',
  },
  openGraph: {
    title: 'Bannu Masala | Handcrafted Spice Blends from Bannu',
    description: 'Explore handcrafted spice blends from Bannu, KPK. Shop online or order on WhatsApp.',
    url: SITE_URL,
    siteName: 'Bannu Masala',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'Bannu Masala Premium Branding',
      },
    ],
    locale: 'en_PK',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bannu Masala | Premium Spices from Bannu',
    description: 'Handcrafted spice blends from Bannu, KPK.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({ children }) {
  let settings = null;
  try {
    settings = await getAllSettings();
  } catch (error) {
    console.error('Failed to load settings for layout:', error.message);
  }

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Bannu Masala',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Handcrafted spice blends from Bannu, KPK.',
    sameAs: [
      settings?.store?.facebook || 'https://www.facebook.com/bannumasala',
      settings?.store?.instagram || 'https://www.instagram.com/bannumasala786/',
      settings?.store?.tiktok || 'https://www.tiktok.com/@bannumasala786',
    ].filter(Boolean),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings?.store?.phone || '+92-309-9907713',
      contactType: 'customer service',
      areaServed: 'PK',
      availableLanguage: ['Urdu', 'English', 'Pashto'],
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (!theme) theme = 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <CartProvider>
          <SiteChrome settings={settings}>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
