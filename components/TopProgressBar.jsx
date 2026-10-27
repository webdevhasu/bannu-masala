'use client';
import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);

  // When pathname or searchParams change, complete loading
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept link clicks to start loading bar immediately
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');

      // Only handle internal navigation links
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/#') &&
        !href.includes('#') &&
        target !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        // If clicking on current exact page, don't trigger
        const currentFull = window.location.pathname + window.location.search;
        if (href === currentFull) return;

        setLoading(true);
        setProgress(25);

        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              clearInterval(timerRef.current);
              return 85;
            }
            return prev + Math.floor(Math.random() * 15) + 5;
          });
        }, 150);
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3.5px',
        zIndex: 99999,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #800000 0%, #c9932a 50%, #e5b54a 100%)',
          boxShadow: '0 0 10px rgba(201, 147, 42, 0.7), 0 0 5px rgba(128, 0, 0, 0.5)',
          transition: progress === 100 ? 'width 0.2s ease-out, opacity 0.3s ease-out' : 'width 0.25s ease-out',
          opacity: progress === 100 ? 0 : 1,
          borderRadius: '0 3px 3px 0',
        }}
      />
    </div>
  );
}
