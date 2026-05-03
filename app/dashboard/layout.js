'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faShoppingCart, faChartLine, faSignOutAlt, faMessage } from '@fortawesome/free-solid-svg-icons';
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
            <span>Overview</span>
          </Link>
          <Link href="/dashboard/products" className={`${styles.navItem} ${pathname === '/dashboard/products' ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faBox} style={{width:'20px'}} />
            <span>Products</span>
          </Link>
          <Link href="/dashboard/orders" className={`${styles.navItem} ${pathname === '/dashboard/orders' ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faShoppingCart} style={{width:'20px'}} />
            <span>Orders</span>
          </Link>
          <Link href="/dashboard/reviews" className={`${styles.navItem} ${pathname === '/dashboard/reviews' ? styles.active : ''}`}>
            <FontAwesomeIcon icon={faMessage} style={{width:'20px'}} />
            <span>Reviews</span>
          </Link>
        </nav>
        <div className={styles.bottomNav}>
          <Link href="/" className={styles.navItem}>
            <FontAwesomeIcon icon={faSignOutAlt} style={{width:'20px'}} />
            <span>Back to Store</span>
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
