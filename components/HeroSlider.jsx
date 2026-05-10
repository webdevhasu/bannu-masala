'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './HeroSlider.module.css';

export default function HeroSlider() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      
      <div className="container">
        <div className={styles.grid}>
          {/* Left Content */}
          <motion.div 
            className={styles.content}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className={styles.premiumBadge}>✨ Premium Handcrafted Quality</span>
            <h1 className={styles.headline}>
              Authentic Bannu Spices <br />
              <span className={styles.highlight}>Delivered For FREE</span>
            </h1>
            <p className={styles.subtext}>
              Experience the soul of Bannu with our centuries-old traditional spice blends. 
              Pure, natural ingredients delivered across Pakistan with <strong>Zero Shipping Charges</strong> on every order.
            </p>
            <div className={styles.actions}>
              <Link href="/#products">
                <button className={styles.ctaBtn}>Shop Now & Get Free Shipping</button>
              </Link>
              <Link href="/about">
                <button className={styles.secondaryBtn}>Our Heritage</button>
              </Link>
            </div>
          </motion.div>

          {/* Right Product View */}
          <motion.div 
            className={styles.productView}
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            <div className={styles.productCircle}>
              <div className={styles.floatingIcons}>
                <span className={styles.float1}>🚚</span>
                <span className={styles.float2}>🌶️</span>
                <span className={styles.float3}>🌿</span>
              </div>
              <div className={styles.mainVisual}>
                <div className={styles.freeBadge}>
                  <span>FREE</span>
                  <small>SHIPPING</small>
                </div>
                <img src="/logo.png" alt="Bannu Masala" className={styles.heroLogo} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

