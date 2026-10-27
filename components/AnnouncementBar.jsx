'use client';
import { useEffect, useMemo, useState } from 'react';
import styles from './AnnouncementBar.module.css';

export default function AnnouncementBar({ config }) {
  const items = useMemo(
    () => (config?.items || []).filter((item) => item?.enabled !== false && item?.text?.trim()),
    [config]
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [items.length]);

  useEffect(() => {
    if (!config?.enabled || items.length < 2) return undefined;

    const interval = Math.max(2000, Number(config.interval_ms) || 4000);
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [config?.enabled, config?.interval_ms, items.length]);

  if (!config?.enabled || items.length === 0) return null;

  return (
    <div className={styles.bar} role="status" aria-live="polite">
      <div className={styles.inner}>
        <span className={styles.dot} aria-hidden="true" />
        <span key={index} className={styles.message}>
          {items[index].text}
        </span>
      </div>
    </div>
  );
}
