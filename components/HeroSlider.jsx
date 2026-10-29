'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './HeroSlider.module.css';

const DEFAULTS = {
  badge: '100% Pure & Authentic Spices',
  headline: 'Bringing Authentic Flavor',
  highlight: 'to Your Kitchen',
  subheading: 'Apne khanay mein laayein lajawab khushboo aur bharpoor zaiqa — 100% pure, natural ingredients se tayar kardah masalay.',
  primary_label: 'Shop Now',
  primary_link: '/products',
  secondary_label: 'Explore Spices',
  secondary_link: '/products',
};

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function HeroSlider({ hero, storeWhatsapp }) {
  const content = { ...DEFAULTS, ...(hero || {}) };
  const waNumber = storeWhatsapp || '923099907713';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    'Assalam-o-Alaikum! Mujhe Bannu Masala ke baare mein maloomat / order karna hai.'
  )}`;

  return (
    <section className={styles.hero}>
      <div className={styles.ambientGlow} />

      <div className="container">
        <div className={styles.bannerGrid}>
          {/* Left: 3 Spices Pouches Showcase */}
          <motion.div
            className={styles.imageCol}
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className={styles.pouchWrap}>
              <div className={styles.pouchSpotlight} />
              <img
                src="/heroimg.png"
                alt="Bannu Masala - Turmeric, Chilli & Mix Spice Powder"
                className={styles.pouchImg}
                loading="eager"
              />
            </div>
          </motion.div>

          {/* Right: Text & Actions */}
          <motion.div
            className={styles.textCol}
            initial={{ opacity: 0, x: 35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
          >
            {content.badge && (
              <span className={styles.badge}>{content.badge}</span>
            )}

            <h1 className={styles.headline}>
              <span>{content.headline}</span>
              {content.highlight && (
                <span className={styles.highlight}>{content.highlight}</span>
              )}
            </h1>

            {content.subheading && (
              <p className={styles.subtext}>{content.subheading}</p>
            )}

            {/* Buttons: Shop Now, Explore Spices, WhatsApp */}
            <div className={styles.actions}>
              <Link
                href={content.primary_link || '/products'}
                className={styles.shopNowBtn}
              >
                {content.primary_label || 'Shop Now'}
              </Link>

              <Link
                href={content.secondary_link || '/products'}
                className={styles.exploreBtn}
              >
                {content.secondary_label || 'Explore Spices'}
              </Link>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                <WhatsAppIcon size={18} />
                <span>WhatsApp</span>
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
