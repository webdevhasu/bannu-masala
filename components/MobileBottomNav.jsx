'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faMagnifyingGlass,
  faBagShopping,
  faCartShopping,
} from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartContext';
import styles from './MobileBottomNav.module.css';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { itemCount, setSidebarOpen } = useCart();

  const links = [
    { href: '/', label: 'Home', icon: faHouse },
    { href: '/products?focus=search', label: 'Search', icon: faMagnifyingGlass },
    { href: '/products', label: 'Products', icon: faBagShopping },
  ];

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      {links.map((link) => {
        const active =
          link.href === '/'
            ? pathname === '/'
            : link.href.startsWith('/products') && pathname.startsWith('/products');

        return (
          <Link
            key={link.label}
            href={link.href}
            className={`${styles.item} ${active ? styles.active : ''}`}
          >
            <FontAwesomeIcon icon={link.icon} className={styles.icon} />
            <span>{link.label}</span>
          </Link>
        );
      })}

      <button
        type="button"
        className={styles.item}
        onClick={() => setSidebarOpen(true)}
        aria-label={`Open cart with ${itemCount} items`}
      >
        <span className={styles.cartIconWrap}>
          <FontAwesomeIcon icon={faCartShopping} className={styles.icon} />
          {itemCount > 0 && <span className={styles.badge}>{itemCount > 99 ? '99+' : itemCount}</span>}
        </span>
        <span>Cart</span>
      </button>
    </nav>
  );
}
