'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartContext';
import styles from './Header.module.css';

const FALLBACK_WHATSAPP = '923099907713';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/deals', label: 'Sales & Deals' },
  { href: '/track', label: 'Track Order' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
];

export default function Header({ store }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);
  const { itemCount, setSidebarOpen } = useCart();

  const whatsapp = store?.whatsapp || FALLBACK_WHATSAPP;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (itemCount > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="Bannu Masala" width={50} height={50} className={styles.logoImg} />
          <div className={styles.logoText}>
            <span className={styles.logoMain}>Bannu</span>
            <span className={styles.logoSub}>Masala</span>
          </div>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <form className={styles.searchForm} action="/products" role="search">
            <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
            <input
              type="search"
              name="q"
              placeholder="Search masalay..."
              aria-label="Search products"
              className={styles.searchInput}
            />
          </form>

          <button
            className={styles.cartBtn}
            onClick={() => setSidebarOpen(true)}
            aria-label={`Open cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
          >
            <FontAwesomeIcon icon={faShoppingCart} />
            {itemCount > 0 && (
              <span className={`${styles.badge} ${animateBadge ? styles.pop : ''}`}>{itemCount}</span>
            )}
          </button>

          <button
            className={styles.burger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={menuOpen ? styles.burgerLineTop : ''} />
            <span className={menuOpen ? styles.burgerLineMid : ''} />
            <span className={menuOpen ? styles.burgerLineBot : ''} />
          </button>
        </div>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <form className={styles.mobileSearch} action="/products" role="search">
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="search"
            name="q"
            placeholder="Search masalay..."
            aria-label="Search products"
            className={styles.searchInput}
          />
        </form>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <a
          href={`https://wa.me/${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mobileWa}
          onClick={() => setMenuOpen(false)}
        >
          WhatsApp Us
        </a>
      </div>
    </header>
  );
}
