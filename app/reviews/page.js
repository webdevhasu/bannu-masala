import Link from 'next/link';
import sql from '@/lib/db';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faQuoteLeft,
  faCircleCheck,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Customer Reviews | Bannu Masala',
  description: 'Read genuine customer reviews for Bannu Masala products.',
};

export default async function ReviewsPage() {
  const reviews = await sql`
    SELECT r.id, r.reviewer_name, r.rating, r.comment, r.created_at, r.is_verified,
           p.name AS product_name, p.slug AS product_slug, p.image AS product_image
    FROM reviews r
    JOIN products p ON p.id = r.product_id AND p.is_active = true
    WHERE r.is_approved = true
    ORDER BY r.created_at DESC
  `;

  const total = reviews.length;
  const average =
    total > 0
      ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total).toFixed(1)
      : null;
  const productCount = new Set(reviews.map((review) => review.product_slug)).size;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>Customer Reviews</span>
          <h1 className={styles.title}>What Our Customers Say</h1>
          <p className={styles.subtitle}>
            Real reviews from customers who have cooked with Bannu Masala.
          </p>

          {total > 0 && (
            <div className={styles.stats}>
              <div>
                <strong>{average}</strong>
                <span>Average rating</span>
              </div>
              <div>
                <strong>{total}</strong>
                <span>{total === 1 ? 'Review' : 'Reviews'}</span>
              </div>
              <div>
                <strong>{productCount}</strong>
                <span>{productCount === 1 ? 'Product' : 'Products'} reviewed</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="container">
        {total === 0 ? (
          <div className={styles.empty}>
            <h2>No reviews yet</h2>
            <p>
              Be the first to share your experience. Open any product page and write a review.
            </p>
            <Link href="/products" className={styles.cta}>
              Browse Products <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {reviews.map((review) => (
              <article key={review.id} className={styles.card}>
                <FontAwesomeIcon icon={faQuoteLeft} className={styles.quoteIcon} />

                <div className={styles.stars} aria-label={`${review.rating} out of 5 stars`}>
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
                        <FontAwesomeIcon icon={faCircleCheck} /> Verified Purchase
                      </span>
                    )}
                    <span className={styles.date}>
                      {new Date(review.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <Link href={`/products/${review.product_slug}`} className={styles.product}>
                    {review.product_image && (
                      <img src={review.product_image} alt="" className={styles.productImage} />
                    )}
                    <span>{review.product_name}</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
