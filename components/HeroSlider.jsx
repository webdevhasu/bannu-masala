'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './HeroSlider.module.css';

const DEFAULTS = {
  badge: 'Premium Handcrafted Quality',
  headline: 'Har Pakwan Ka Asal Zaiqa',
  highlight: 'Bannu Masala',
  subheading: 'Apne khanay mein laayein lajawab khushboo aur bharpoor zaiqa — 100% khaliss aur zaiqedaar masalay.',
  primary_label: 'Shop Now',
  primary_link: '/products',
  secondary_label: 'Explore Products',
  secondary_link: '/products',
  desktop_image: '',
  mobile_image: '',
};

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function BagIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export default function HeroSlider({ hero, storeWhatsapp }) {
  const content = { ...DEFAULTS, ...(hero || {}) };
  const hasImage = Boolean(content.desktop_image);
  const waNumber = storeWhatsapp || '923099907713';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Assalam-o-Alaikum! Mujhe Bannu Masala ke baare mein maloomat / order karna hai.'
  )}`;

  return (
    <section className={`${styles.hero} ${hasImage ? styles.imageHero : ''}`}>
      {hasImage && (
        <picture className={styles.heroMedia}>
          {content.mobile_image && (
            <source media="(max-width: 768px)" srcSet={content.mobile_image} />
          )}
          <img src={content.desktop_image} alt="" fetchPriority="high" />
        </picture>
      )}
      <div className={styles.overlay} />

      <div className="container">
        <div className={styles.grid}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {content.badge && (
              <div className={styles.badgeWrapper}>
                <span className={styles.premiumBadge}>{content.badge}</span>
              </div>
            )}

            <h1 className={styles.headline}>
              <span>{content.headline}</span>
              {content.highlight && <span className={styles.highlight}>{content.highlight}</span>}
            </h1>

            {content.subheading && <p className={styles.subtext}>{content.subheading}</p>}

            {/* 3 CTAs: Shop Now, Explore Products, Order on WhatsApp */}
            <div className={styles.actions}>
              <Link href={content.primary_link || '/products'} className={styles.shopNowBtn}>
                <BagIcon size={16} />
                <span>{content.primary_label || 'Shop Now'}</span>
                <span className={styles.arrowIcon}>→</span>
              </Link>

              <Link href={content.secondary_link || '/products'} className={styles.exploreBtn}>
                <span>{content.secondary_label || 'Explore Products'}</span>
              </Link>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <WhatsAppIcon size={18} />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Trust Stats Bar */}
            <div className={styles.trustBar}>
              <div className={styles.trustStat}>
                <span className={styles.trustNum}>50k+</span>
                <span className={styles.trustLabel}>Customers</span>
              </div>
              <div className={styles.trustDivider} />
              <div className={styles.trustStat}>
                <span className={styles.trustNum}>100%</span>
                <span className={styles.trustLabel}>Pure</span>
              </div>
              <div className={styles.trustDivider} />
              <div className={styles.trustStat}>
                <span className={styles.trustNum}>50+</span>
                <span className={styles.trustLabel}>Blends</span>
              </div>
              <div className={styles.trustDivider} />
              <div className={styles.trustStat}>
                <span className={styles.trustNum}>1999</span>
                <span className={styles.trustLabel}>Est.</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
