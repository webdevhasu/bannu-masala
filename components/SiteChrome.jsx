'use client';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import CartSidebar from './CartSidebar';
import WhatsAppFloat from './WhatsAppFloat';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

export default function SiteChrome({ settings, children }) {
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isAdminArea) {
    return children;
  }

  return (
    <>
      <AnnouncementBar config={settings?.announcements} />
      <Header store={settings?.store} />
      <main>{children}</main>
      <CartSidebar />
      <WhatsAppFloat number={settings?.store?.whatsapp} />
      <Footer store={settings?.store} shipping={settings?.shipping} />
      <MobileBottomNav />
    </>
  );
}
