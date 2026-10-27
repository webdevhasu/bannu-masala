import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faQuoteLeft, faCircleCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from './TestimonialsSection.module.css';

export default function TestimonialsSection({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className="section-title">Loved by Our Customers</h2>
        <p className="section-subtitle">Real reviews from our customers</p>
        <div className="gold-line" />

        <div className={styles.grid}>
          {reviews.map((review) => (
            <article key={review.id} className={styles.card}>
              <FontAwesomeIcon icon={faQuoteLeft} className={styles.quoteIcon} />

              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FontAwesomeIcon
                    key={star}
                    icon={faStar}
                    color={star <= review.rating ? '#fbbf24' : '#e2e8f0'}
                    size="sm"
                  />
                ))}
              </div>

              <p className={styles.comment}>&ldquo;{review.comment}&rdquo;</p>

              <div className={styles.footer}>
                <div>
                  <span className={styles.name}>{review.reviewer_name}</span>
                  {review.is_verified && (
                    <span className={styles.verified}>
                      <FontAwesomeIcon icon={faCircleCheck} /> Verified
                    </span>
                  )}
                </div>
                {review.product_slug && (
                  <Link href={`/products/${review.product_slug}`} className={styles.product}>
                    {review.product_name}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className={styles.allWrap}>
          <Link href="/reviews" className={styles.allLink}>
            Read All Reviews <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </div>
    </section>
  );
}
