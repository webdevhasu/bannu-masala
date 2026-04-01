import './globals.css';
import { CartProvider } from '@/components/CartContext';
import Header from '@/components/Header';
import CartSidebar from '@/components/CartSidebar';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Bannu Masala | Premium Authentic Spices',
  description: 'Premium handcrafted spice blends from Bannu, KPK. Free delivery on orders above Rs. 3,000. Order on WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
