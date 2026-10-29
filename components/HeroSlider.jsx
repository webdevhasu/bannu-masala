'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './HeroSlider.module.css';

const DEFAULTS = {
  badge: 'Premium Handcrafted Quality',
  headline: 'Har Pakwan Ka Asal Zaiqa',
  highlight: 'Bannu Masala',
  subheading: 'Apne khanay mein laayein lajawab khushboo aur bharpoor zaiqa.',
  primary_label: 'Shop Now',
  primary_link: '/products',
  secondary_label: 'Explore Deals',
  secondary_link: '/deals',
  desktop_image: '',
  mobile_image: '',
};

function CtaLink({ href, className, children }) {
  const isExternal = /^https?:\/\//i.test(href || '');

  if (isExternal) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href || '/'} className={className}>
      {children}
    </Link>
  );
}

export default function HeroSlider({ hero }) {
  const content = { ...DEFAULTS, ...(hero || {}) };
  const hasImage = Boolean(content.desktop_image);

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
        <div className={`${styles.grid} ${hasImage ? styles.gridImage : ''}`}>
          <motion.div
            className={styles.content}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {content.badge && <span className={styles.premiumBadge}>{content.badge}</span>}
            <h1 className={styles.headline}>
              {content.headline}
              {content.highlight && <span className={styles.highlight}>{content.highlight}</span>}
            </h1>
            {content.subheading && <p className={styles.subtext}>{content.subheading}</p>}
            <div className={styles.actions}>
              {content.primary_label && (
                <CtaLink href={content.primary_link} className={styles.ctaBtn}>
                  {content.primary_label}
                </CtaLink>
              )}
              {content.secondary_label && (
                <CtaLink href={content.secondary_link} className={styles.secondaryBtn}>
                  {content.secondary_label}
                </CtaLink>
              )}
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

          {!hasImage && (
            <motion.div
              className={styles.productView}
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            >
              <div className={styles.productCircle}>
                <div className={styles.floatingIcons}>
                  <span className={styles.float1}>🌶️</span>
                  <span className={styles.float2}>🌿</span>
                  <span className={styles.float3}>🥘</span>
                </div>
                <div className={styles.mainVisual}>
                  <div className={styles.freeBadge}>
                    <span>BANNU</span>
                    <small>MASALA</small>
                  </div>
                  <img src="/logo.png" alt="Bannu Masala" className={styles.heroLogo} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
