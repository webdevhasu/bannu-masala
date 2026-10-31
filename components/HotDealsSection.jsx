'use client';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import styles from './HotDealsSection.module.css';

export default function HotDealsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.dealContainer}>
        {/* Special Deals & Discounts Banner */}
        <div className={styles.dealBanner}>
          <div className={styles.bannerPattern} />

          <motion.div
            className={styles.bannerText}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.bannerBadge}>
              <FontAwesomeIcon icon={faFire} /> Special Offers
            </span>
            <h2 className={styles.bannerTitle}>Special Deals &amp; Discounts</h2>
            <p className={styles.bannerSub}>
              Enjoy exciting discounts and exclusive deals on your favorite spice collections today.
            </p>
            <Link href="/deals" className={styles.viewOffersBtn}>
              View Offers <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '8px' }} />
            </Link>
          </motion.div>

          <motion.div
            className={styles.bannerImgWrap}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className={styles.dealSpotlight} />
            <img
              src="/dealimg.png"
              alt="Special Deals & Discounts - Bannu Masala"
              className={styles.dealImg}
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
