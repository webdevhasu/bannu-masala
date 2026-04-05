import './globals.css';
import { CartProvider } from '@/components/CartContext';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Bannu Masala | Premium Authentic Spices & Handcrafted Blends',
  description: 'Authentic handcrafted spice blends from Bannu, KPK. Pure, natural, and preservative-free spices delivered across Pakistan. Free delivery on orders above Rs. 3,000.',
  keywords: 'Bannu Masala, authentic spices, pure masalas, KPK spices, handcrafted spice blends, biryani masala, Pulao masala, organic spices Pakistan, wholesale spices Bannu',
  authors: [{ name: 'Bannu Masala Team' }],
  metadataBase: new URL('https://bannumasala.vercel.app'), // Note: Update with custom domain later if needed
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Bannu Masala | Pure & Authentic Handcrafted Spices',
    description: 'The soul of Bannu on your dining table. Order 100% natural spices online.',
    url: 'https://bannumasala.vercel.app',
    siteName: 'Bannu Masala',
    images: [
      {
        url: '/logo.png', // Fallback to logo
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
    description: 'Authentic handcrafted spice blends delivered pan-Pakistan.',
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
export default function RootLayout({ children }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bannu Masala",
    "url": "https://bannumasala.vercel.app",
    "logo": "https://bannumasala.vercel.app/logo.png",
    "description": "Premium handcrafted spice blends from Bannu, KPK. Authentic, pure, and preservative-free.",
    "sameAs": [
      "https://www.facebook.com/bannumasala",
      "https://www.instagram.com/bannumasala786/",
      "https://www.tiktok.com/@bannumasala786"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+92-309-9907713",
      "contactType": "customer service",
      "areaServed": "PK",
      "availableLanguage": ["Urdu", "English", "Pashto"]
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <CartSidebar />
          <WhatsAppFloat />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
