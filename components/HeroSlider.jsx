'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './HeroSlider.module.css';

const defaultSlides = [
  {
    id: 'def-1',
    headline: "Taste the Soul of Bannu",
    subtext: "Handcrafted spice blends rooted in centuries-old Pashtun culinary tradition",
    cta: "Shop Now",
    href: "/#products",
    bg: "linear-gradient(135deg, #3D0000 0%, #7B1C1C 50%, #C9932A 100%)",
    badge: "Authentic & Pure",
    emoji: "🌶️",
  },
  {
    id: 'def-2',
    headline: "From Our Kitchen to Yours",
    subtext: "Free delivery on all orders above Rs. 3,000. Fresh spices, delivered to your doorstep.",
    cta: "View Products",
    href: "/#products",
    bg: "linear-gradient(135deg, #1A0A00 0%, #5C3317 50%, #C9932A 100%)",
    badge: "Free Shipping Rs 3,000+",
    emoji: "📦",
  },
];

export default function HeroSlider({ products = [] }) {
  // Map actual products to slider format if they exist
  const dynamicSlides = products.length > 0 ? products.map((p, index) => ({
    id: p.id,
    headline: p.name,
    subtext: p.description || "Premium quality handcrafted spices direct from Bannu.",
    cta: "Buy Now",
    href: "/#products", // We can link to specific product later if needed
    // Vary backgrounds based on index
    bg: index % 3 === 0 
      ? "linear-gradient(135deg, #3D0000 0%, #7B1C1C 50%, #C9932A 100%)"
      : index % 3 === 1 
      ? "linear-gradient(135deg, #1A0A00 0%, #5C3317 50%, #C9932A 100%)"
      : "linear-gradient(135deg, #0A1A00 0%, #2D4A14 50%, #C9932A 100%)",
    badge: "Featured Product",
    emoji: p.name.toLowerCase().includes('biryani') ? '🍚' : '🌶️',
    image: p.image
  })) : defaultSlides;

  const slidesToUse = dynamicSlides;
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const next = useCallback(() => {
    if (animating || slidesToUse.length <= 1) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(c => (c + 1) % slidesToUse.length);
      setAnimating(false);
    }, 400);
  }, [animating, slidesToUse.length]);

  useEffect(() => {
    if (slidesToUse.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, slidesToUse.length]);

  const goTo = (idx) => {
    if (animating || idx === current || slidesToUse.length <= 1) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 400);
  };

  const slide = slidesToUse[current];

  return (
    <section className={styles.hero} style={{ background: slide.bg }}>
      <div className={styles.overlay} />
      
      <div className="container">
        <div className={styles.grid}>
          {/* Left Content */}
          <div className={`${styles.content} ${animating ? styles.fadeOut : styles.fadeIn}`}>
            <span className={styles.badge}>{slide.emoji} {slide.badge}</span>
            <h1 className={styles.headline}>{slide.headline}</h1>
            <p className={styles.subtext}>{slide.subtext}</p>
            <div className={styles.actions}>
              <Link href={slide.href}>
                <button className={styles.ctaBtn}>{slide.cta} →</button>
              </Link>
              <Link href="/#products">
                <button className={styles.secondaryBtn}>Explore All Products</button>
              </Link>
            </div>
          </div>

          {/* Right Product View */}
          <div className={`${styles.productView} ${animating ? styles.productOut : styles.productIn}`}>
            <div className={styles.productCircle}>
              {slide.image ? (
                <img src={slide.image} alt={slide.headline} className={styles.productImg} />
              ) : (
                <>
                  <div className={styles.floatingEmoji}>{slide.emoji === '🌶️' ? '📦' : slide.emoji === '📦' ? '🫙' : '🌿'}</div>
                  <div className={styles.mainEmoji}>{slide.emoji}</div>
                </>
              )}
            </div>
            {/* Glossy Card */}
            <div className={styles.glossyCard}>
              <div className={styles.cardLine} style={{width: '60%'}}></div>
              <div className={styles.cardLine} style={{width: '40%'}}></div>
              <div className={styles.cardPrice}>Starting from Rs. {products.find(p => p.id === slide.id)?.price_250g || 250}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className={styles.dots}>
        {slidesToUse.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Nav arrows */}
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => goTo((current - 1 + slidesToUse.length) % slidesToUse.length)}>‹</button>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={next}>›</button>
    </section>
  );
}
