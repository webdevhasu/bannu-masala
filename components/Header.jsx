'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';
import styles from './Header.module.css';

const WHATSAPP_NUMBER = '923001234567';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { itemCount, setSidebarOpen } = useCart();
  const { user, loading, popAuthModal, logout } = useAuth();

  return (
    <header className={styles.header}>
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
          {/* Auth Button */}
          {!loading && (
            user ? (
              <div 
                className={styles.userDropdownContainer} 
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className={styles.authBtn}>
                  <div className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</div>
                  <span className={styles.userName}>{user.name.split(' ')[0]}</span>
                </button>
                {dropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <button onClick={logout} className={styles.dropdownItem}>
                      <FontAwesomeIcon icon={faSignOutAlt} width="16" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className={styles.loginBtn} onClick={popAuthModal}>
                <FontAwesomeIcon icon={faUser} /> Login
              </button>
            )
          )}

          {/* Cart Button */}
          <button className={styles.cartBtn} onClick={() => setSidebarOpen(true)}>
            <FontAwesomeIcon icon={faShoppingCart} />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
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
