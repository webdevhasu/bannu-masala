'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for 1.2 seconds, then fade out over 0.3s
    const fadeTimer = setTimeout(() => {
      setFading(true);
      const removeTimer = setTimeout(() => {
        setVisible(false);
      }, 400); // Wait for CSS transition to finish 
      return () => clearTimeout(removeTimer);
    }, 1200);

    return () => clearTimeout(fadeTimer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`${styles.loaderWrap} ${fading ? styles.fadeOut : ''}`}>
      <div className={styles.loaderContent}>
        <div className={styles.pulsingLogo}>
          <div className={styles.logoWrapper}>
            <Image src="/logo.png" alt="Bannu Masala" fill style={{ objectFit: 'contain' }} priority />
          </div>
        </div>
        <div className={styles.spinner}></div>
      </div>
    </div>
  );
}
