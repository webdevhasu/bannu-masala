'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

export default function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/${productId}`);
      const data = await res.json();
      if (res.ok) {
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment, name })
      });
      
      const result = await res.json();
      if (res.ok) {
        setComment('');
        setName('');
        fetchReviews(); // Refresh list
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.reviewsContainer}>
      <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
      
      <div className={styles.reviewsList}>
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className={styles.emptyReviews}>No reviews yet. Be the first to review this product!</p>
        ) : (
          <>
            {reviews.slice(0, visibleCount).map(review => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    <FontAwesomeIcon icon={faUserCircle} className={styles.userIcon} />
                    <span>{review.reviewer_name}</span>
                    <span className={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <FontAwesomeIcon 
                        key={star} 
                        icon={faStar} 
                        color={star <= review.rating ? '#fbbf24' : '#cbd5e1'} 
                        size="sm"
                      />
                    ))}
                  </div>
                </div>
                <p className={styles.reviewComment}>{review.comment}</p>
              </div>
            ))}
            
            {reviews.length > visibleCount && (
              <button 
                className={styles.seeMoreBtn} 
                onClick={() => setVisibleCount(prev => prev + 10)}
              >
                See More Reviews ({reviews.length - visibleCount} left)
              </button>
            )}
          </>
        )}
      </div>

      <div className={styles.reviewFormBox}>
        <h3>Write a Review</h3>
        <form onSubmit={handleSubmitReview}>
          <div className={styles.formGroup} style={{marginBottom: '16px'}}>
            <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '8px'}}>Your Name</label>
            <input 
              type="text"
              className={styles.reviewInput}
              placeholder="e.g. Hassan Ali"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.starSelect}>
            {[1, 2, 3, 4, 5].map(star => (
              <FontAwesomeIcon
                key={star}
                icon={faStar}
                color={star <= rating ? '#fbbf24' : '#cbd5e1'}
                className={styles.clickableStar}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <textarea
            className={styles.reviewInput}
            rows={3}
            placeholder="How was the product? Leave your thoughts here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button className={styles.submitReviewBtn} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
