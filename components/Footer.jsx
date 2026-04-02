import Link from 'next/link';
import styles from './Footer.module.css';

const WHATSAPP_NUMBER = '923099907713';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <h3 className={styles.brandName}>Bannu Masala</h3>
          <p className={styles.tagline}>Authentic spices, crafted with love from the heart of Bannu, KPK.</p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waLink}
          >
            📱 +92 309 9907713
          </a>
          <a
            href="https://www.facebook.com/bannumasala"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waLink}
            style={{ marginTop: '10px', background: '#1877F2', color: '#fff' }}
          >
            📘 Facebook Page
          </a>
        </div>
        <div className={styles.links}>
          <h4 className={styles.linkTitle}>Quick Links</h4>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/products" className={styles.link}>Products</Link>
          <Link href="/about" className={styles.link}>About Us</Link>
          <Link href="/checkout" className={styles.link}>Checkout</Link>
        </div>
        <div className={styles.info}>
          <h4 className={styles.linkTitle}>Information</h4>
          <p className={styles.infoText}>🚚 Free delivery on orders Rs 3,000+</p>
          <p className={styles.infoText}>✅ 100% Natural, no preservatives</p>
          <p className={styles.infoText}>📦 Pan-Pakistan delivery</p>
          <p className={styles.infoText}>💬 WhatsApp order support</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Bannu Masala. All rights reserved.</p>
      </div>
    </footer>
  );
}
