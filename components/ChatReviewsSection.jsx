'use client';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faTimes,
  faSearchPlus,
} from '@fortawesome/free-solid-svg-icons';
import styles from './ChatReviewsSection.module.css';

function WhatsAppIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function ChatReviewsSection({ productId, initialReviews = null }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [loading, setLoading] = useState(!initialReviews);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const trackRef = useRef(null);

  useEffect(() => {
    if (initialReviews) return;

    let cancelled = false;
    const url = productId
      ? `/api/chat-reviews?productId=${productId}&activeOnly=true`
      : `/api/chat-reviews?activeOnly=true`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (!cancelled) {
          setReviews(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, initialReviews]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % reviews.length);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, reviews.length]);

  const scrollTrack = (direction) => {
    if (!trackRef.current) return;
    const offset = direction === 'left' ? -300 : 300;
    trackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  if (!loading && reviews.length === 0) {
    return null;
  }

  const currentReview = lightboxIndex !== null ? reviews[lightboxIndex] : null;

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <span className={styles.eyebrow}>
            <span className={styles.whatsappIcon}>
              <WhatsAppIcon size={16} />
            </span>
            Real WhatsApp Feedback
          </span>
          <h2 className={styles.title}>Chat Reviews</h2>
          <p className={styles.subtitle}>
            Real chats and feedback sent directly by our customers on WhatsApp.
          </p>
        </div>

        {reviews.length > 3 && (
          <div className={styles.navArrows}>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={() => scrollTrack('left')}
              aria-label="Scroll left"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={() => scrollTrack('right')}
              aria-label="Scroll right"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Strip */}
      <div className={styles.sliderTrack} ref={trackRef}>
        {reviews.map((item, index) => (
          <div
            key={item.id}
            className={styles.reviewCard}
            onClick={() => setLightboxIndex(index)}
            title="Click to view full screenshot"
          >
            <div className={styles.thumbWrap}>
              <img
                src={item.image_url}
                alt={item.caption || item.customer_name || 'Chat Review'}
                className={styles.thumbImg}
                loading="lazy"
              />
              <div className={styles.waBadge}>
                <WhatsAppIcon size={14} />
              </div>
              <div className={styles.zoomPill}>
                <FontAwesomeIcon icon={faSearchPlus} />
                <span>View</span>
              </div>
            </div>

            {(item.customer_name || item.caption) && (
              <div className={styles.cardMeta}>
                <p className={styles.customerLabel}>
                  {item.customer_name || item.caption}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {currentReview && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setLightboxIndex(null)}
        >
          <div
            className={styles.lightboxModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.topBar}>
              <span className={styles.counter}>
                {lightboxIndex + 1} of {reviews.length}
              </span>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setLightboxIndex(null)}
                aria-label="Close"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className={styles.imageStage}>
              {reviews.length > 1 && (
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.prevBtn}`}
                  onClick={handlePrev}
                  aria-label="Previous screenshot"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
              )}

              <img
                src={currentReview.image_url}
                alt={currentReview.caption || 'Chat Review Screenshot'}
                className={styles.lightboxImage}
              />

              {reviews.length > 1 && (
                <button
                  type="button"
                  className={`${styles.navButton} ${styles.nextBtn}`}
                  onClick={handleNext}
                  aria-label="Next screenshot"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              )}
            </div>

            {(currentReview.customer_name || currentReview.caption) && (
              <div className={styles.lightboxCaptionBox}>
                {currentReview.customer_name && (
                  <p className={styles.lightboxCaptionTitle}>
                    {currentReview.customer_name}
                  </p>
                )}
                {currentReview.caption && (
                  <p className={styles.lightboxCaptionText}>
                    {currentReview.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

