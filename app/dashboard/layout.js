'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faShoppingCart,
  faChartLine,
  faSignOutAlt,
  faMessage,
  faFire,
  faCog,
  faHouse,
  faLayerGroup,
  faEnvelope,
  faComments,
} from '@fortawesome/free-solid-svg-icons';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: faChartLine, exact: true },
  { href: '/dashboard/products', label: 'Products', icon: faBox },
  { href: '/dashboard/categories', label: 'Categories', icon: faLayerGroup },
  { href: '/dashboard/orders', label: 'Orders', icon: faShoppingCart },
  { href: '/dashboard/reviews', label: 'Reviews', icon: faMessage, badgeKey: 'reviews' },
  { href: '/dashboard/chat-reviews', label: 'Chat Reviews', icon: faComments },
  { href: '/dashboard/messages', label: 'Messages', icon: faEnvelope, badgeKey: 'messages' },
  { href: '/dashboard/deals', label: 'Hot Deals', icon: faFire },
  { href: '/dashboard/settings', label: 'Settings', icon: faCog },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState({ messages: 0, reviews: 0 });

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch('/api/contact')
        .then((response) => (response.ok ? response.json() : []))
        .catch(() => []),
      fetch('/api/reviews')
        .then((response) => (response.ok ? response.json() : []))
        .catch(() => []),
    ]).then(([messages, reviews]) => {
      if (cancelled) return;
    setCounts({
        messages: Array.isArray(messages)
          ? messages.filter((message) => !message.is_read).length
          : 0,
        reviews: Array.isArray(reviews)
          ? reviews.filter((review) => !review.is_approved).length
          : 0,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h2>Bannu Admin</h2>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.active : ''}`}
              >
                <FontAwesomeIcon icon={item.icon} style={{ width: '20px' }} />
                <span>{item.label}</span>
                {item.badgeKey && counts[item.badgeKey] > 0 && (
                  <span className={styles.navBadge}>
                    {counts[item.badgeKey] > 99 ? '99+' : counts[item.badgeKey]}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className={styles.bottomNav}>
          <Link href="/" className={styles.navItem}>
            <FontAwesomeIcon icon={faHouse} style={{ width: '20px' }} />
            <span>Back to Store</span>
          </Link>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{ width: '20px' }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
