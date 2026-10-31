'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCircleCheck, faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

function getInitials(name) {
  if (!name) return 'BM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [visibleCount, setVisibleCount] = useState(8);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!comment.trim()) {
      alert('Please write your review comment');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, name, phone }),
      });

      const result = await res.json();
      if (res.ok) {
        setComment('');
        setName('');
        setPhone('');
        setRating(5);
        setSuccessMessage(
          result.verified
            ? 'Shukriya! Aapka verified review submit ho chuka hai aur approve hone par display hoga.'
            : 'Shukriya! Aapka review submit ho chuka hai aur approval ke baad display hoga.'
        );
      } else {
        alert(result.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className={styles.reviewsContainer}>
      <div className={styles.reviewsHeader}>
        <div>
          <span className={styles.reviewsEyebrow}>CUSTOMER OPINIONS</span>
          <h2 className={styles.reviewsTitle}>Customer Reviews &amp; Ratings</h2>
        </div>
        <button
          type="button"
          className={styles.writeReviewToggleBtn}
          onClick={() => setShowForm(!showForm)}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
          {showForm ? 'Hide Form' : 'Write a Review'}
        </button>
      </div>

      {/* Trust Rating Summary Card */}
      <div className={styles.ratingSummaryCard}>
        <div className={styles.ratingBigScoreCol}>
          <span className={styles.bigRatingScore}>{avgRating}</span>
          <div className={styles.summaryStars}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={s <= Math.round(Number(avgRating)) ? styles.summaryStarFilled : styles.summaryStarEmpty}
              >
                ★
              </span>
            ))}
          </div>
          <span className={styles.summaryCountText}>
            {reviews.length > 0
              ? `Based on ${reviews.length} customer review${reviews.length > 1 ? 's' : ''}`
              : '100% Quality & Taste Satisfaction'}
          </span>
        </div>

        <div className={styles.ratingPerksCol}>
          <div className={styles.ratingPerkItem}>
            <span className={styles.perkIcon}>⭐</span>
            <div>
              <strong>Pure KPK Spices:</strong>
              <p>Authentic traditional recipes made from freshly selected spices.</p>
            </div>
          </div>
          <div className={styles.ratingPerkItem}>
            <span className={styles.perkIcon}>🛡️</span>
            <div>
              <strong>Verified Purchases:</strong>
              <p>Real customer experiences and honest feedback across Pakistan.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Drawer / Box */}
      {showForm && (
        <div className={styles.reviewFormBox}>
          <div className={styles.formHeader}>
            <h3>Share Your Experience</h3>
            <p>Tell us how this Bannu Masala blend enhanced your dish!</p>
          </div>

          {successMessage && (
            <div className={styles.reviewSuccess}>
              <FontAwesomeIcon icon={faCircleCheck} /> {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmitReview}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Your Name *</label>
                <input
                  type="text"
                  className={styles.reviewInput}
                  placeholder="e.g. Hassan Irfan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone / WhatsApp (Optional for verification)</label>
                <input
                  type="tel"
                  className={styles.reviewInput}
                  placeholder="0300 1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.ratingSelectWrap}>
              <label className={styles.formLabel}>Your Rating *</label>
              <div className={styles.interactiveStars}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = hoverRating ? star <= hoverRating : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      className={`${styles.starBtn} ${active ? styles.starBtnActive : ''}`}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`${star} star`}
                    >
                      ★
                    </button>
                  );
                })}
                <span className={styles.ratingLabelText}>
                  {hoverRating || rating} out of 5 Stars
                </span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Your Review / Recipe Feedback *</label>
              <textarea
                className={styles.reviewTextarea}
                rows={4}
                placeholder="Khushboo aur zaika kaisa laga? Recipe mein results kaisay thay..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />
            </div>

            <button type="submit" className={styles.submitReviewBtn} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        {loading ? (
          <div className={styles.loadingReviews}>
            <p>Loading authentic customer reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyReviews}>
            <p className={styles.emptyTitle}>No reviews published yet for this blend.</p>
            <p className={styles.emptySub}>
              Be the first to share your review! Click &quot;Write a Review&quot; above to let other food lovers know your experience.
            </p>
          </div>
        ) : (
          <>
            {reviews.slice(0, visibleCount).map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    <div className={styles.avatarCircle}>
                      {getInitials(review.reviewer_name)}
                    </div>
                    <div>
                      <div className={styles.reviewerNameRow}>
                        <span className={styles.reviewerName}>{review.reviewer_name}</span>
                        {review.is_verified && (
                          <span className={styles.verifiedBadge} title="Verified Order">
                            <FontAwesomeIcon icon={faCircleCheck} /> Verified Buyer
                          </span>
                        )}
                      </div>
                      <span className={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span
                        key={s}
                        className={s <= review.rating ? styles.reviewStarFilled : styles.reviewStarEmpty}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}

            {reviews.length > visibleCount && (
              <button
                type="button"
                className={styles.seeMoreBtn}
                onClick={() => setVisibleCount((prev) => prev + 6)}
              >
                Load More Reviews ({reviews.length - visibleCount} remaining)
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
