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
          <div className={styles.socialSection}>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 448 512" width="20" height="20"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.4c-32.5 0-64.4-8.7-92.4-25.1l-6.6-4-68.5 18 18.3-66.8-4.4-7C52 300 42.1 262.7 42.1 223.9c0-100.2 81.6-181.8 181.9-181.8 50.1 0 97.1 19.5 132.5 54.9 35.4 35.4 54.8 82.4 54.8 132.5 0 100.3-81.6 181.9-181.9 181.9zm100-136c-5.5-2.8-32.3-15.9-37.3-17.8-5-1.9-8.7-2.8-12.4 2.8-3.7 5.5-14.1 17.8-17.3 21.4-3.2 3.7-6.5 4.1-12 1.4-5.5-2.8-23-8.5-43.8-27.1-16.1-14.4-27-32.3-30.2-37.8-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.2-9.7 2.8-3.3 3.7-5.5 5.5-9.2 1.9-3.7.9-7-4.4-12.4-5.5-5.5-12.4-32.3-17.1-44.2-4.6-11.6-9.1-10-12.4-10.2-3.1-.2-6.7-.2-10.4-.2-3.7 0-9.7 1.4-14.8 7-5.1 5.5-19.4 19-19.4 46.4s19.9 53.7 22.6 57.4c2.8 3.7 39.3 59.9 94.9 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.3-13.2 36.8-25.9 4.6-12.7 4.6-23.7 3.2-25.9-1.3-2.3-5.1-3.7-10.6-6.5z"/></svg>
              <span>+92 309 9907713</span>
            </a>
            <div className={styles.socialIcons}>
              <a href="https://www.facebook.com/bannumasala" target="_blank" rel="noopener noreferrer" className={styles.iconLink} aria-label="Facebook">
                <svg viewBox="0 0 320 512" width="18" height="18"><path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg>
              </a>
              <a href="https://www.instagram.com/bannumasala786/" target="_blank" rel="noopener noreferrer" className={styles.iconLink} aria-label="Instagram">
                <svg viewBox="0 0 448 512" width="18" height="18"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.8 9.9 67.6 36.1 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@bannumasala786" target="_blank" rel="noopener noreferrer" className={styles.iconLink} aria-label="TikTok">
                <svg viewBox="0 0 448 512" width="18" height="18"><path fill="currentColor" d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0h88a121.18 121.18 0 0 0 1.86 22.32A126.66 126.66 0 0 0 448 109.42z"/></svg>
              </a>
            </div>
          </div>
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
