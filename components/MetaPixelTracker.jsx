'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { pixelEvents } from '@/lib/pixel';

export default function MetaPixelTracker({ pixelConfig }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstLoad = useRef(true);

  const rawPixelId = pixelConfig?.meta_pixel_id;
  const isEnabled = pixelConfig?.enabled !== false;
  const pixelId = rawPixelId ? String(rawPixelId).trim() : '';

  // Listen to route changes and fire PageView (subsequent navigations)
  useEffect(() => {
    if (!pixelId || !isEnabled) return;

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    // Trigger PageView on internal client navigations
    pixelEvents.pageView();
  }, [pathname, searchParams, pixelId, isEnabled]);

  if (!pixelId || !isEnabled) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt="facebook pixel"
        />
      </noscript>
    </>
  );
}
