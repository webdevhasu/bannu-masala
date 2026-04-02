'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartContext';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

const WHATSAPP_NUMBER = '923001234567';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);
  const { itemCount, setSidebarOpen } = useCart();

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
        {/* Logo */}
        <Link href="/#home" className={styles.logo}>
          <Image src="/logo.png" alt="Bannu Masala" width={50} height={50} className={styles.logoImg} />
          <div className={styles.logoText}>
            <span className={styles.logoMain}>Bannu</span>
            <span className={styles.logoSub}>Masala</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.nav}>
          <Link href="/#home" className={styles.navLink}>Home</Link>
          <Link href="/#products" className={styles.navLink}>Products</Link>
          <Link href="/about" className={styles.navLink}>About Us</Link>
        </nav>

        {/* Right Actions */}
        <div className={styles.actions}>
          {/* Cart Button */}
          <button className={styles.cartBtn} onClick={() => setSidebarOpen(true)}>
            <FontAwesomeIcon icon={faShoppingCart} />
            {itemCount > 0 && <span className={`${styles.badge} ${animateBadge ? styles.pop : ''}`}>{itemCount}</span>}
          </button>

          {/* Mobile Hamburger */}
          <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={menuOpen ? styles.burgerLineTop : ''} />
            <span className={menuOpen ? styles.burgerLineMid : ''} />
            <span className={menuOpen ? styles.burgerLineBot : ''} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}>
        <Link href="/" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
        <Link href="/products" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Products</Link>
        <Link href="/about" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>About Us</Link>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.mobileWa}
          onClick={() => setMenuOpen(false)}
        >
          📱 WhatsApp Us
        </a>
      </div>
    </header>
  );
}
