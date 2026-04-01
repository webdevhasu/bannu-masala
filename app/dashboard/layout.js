'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faShoppingCart, faChartLine, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h2>Bannu Admin</h2>
        </div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faChartLine} style={{width:'20px'}} />
            Overview
          </Link>
          <Link href="/dashboard/products" className={`${styles.navItem} ${pathname === '/dashboard/products' ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faBox} style={{width:'20px'}} />
            Products
          </Link>
          <Link href="/dashboard/orders" className={`${styles.navItem} ${pathname === '/dashboard/orders' ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faShoppingCart} style={{width:'20px'}} />
            Orders
          </Link>
        </nav>
        <div className={styles.bottomNav}>
          <Link href="/" className={styles.navItem}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{width:'20px'}} />
            Back to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
