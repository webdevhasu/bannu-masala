'use client';
import { Suspense, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import CartSidebar from './CartSidebar';
import WhatsAppFloat from './WhatsAppFloat';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import TopProgressBar from './TopProgressBar';

export default function SiteChrome({ settings, children }) {
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  // Ensure every page load and navigation always starts at the top
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  if (isAdminArea) {
    return (
      <>
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        {children}
      </>
    );
  }

  return (
    <>
      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>
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
