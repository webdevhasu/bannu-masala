'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faTrash, faMessage, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import styles from '../orders/page.module.css';

export default function ReviewsManager() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews?t=' + Date.now());
      const data = await res.json();
      if (res.ok) setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`/api/reviews/moderate/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    } catch (err) {
      alert('Failed to delete review');
    }
  };

  if (loading) return <div style={{padding:'40px'}}>Loading reviews...</div>;

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>
          <FontAwesomeIcon icon={faMessage} style={{width:'24px', marginRight:'12px'}} /> 
          Reviews Moderation
        </h1>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Product</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r.id}>
                <td><div className={styles.bold}>{r.reviewer_name}</div></td>
                <td><div className={styles.subtext}>{r.product_name}</div></td>
                <td>
                   <div style={{display:'flex', gap:'2px'}}>
                    {[1,2,3,4,5].map(star => (
                      <FontAwesomeIcon 
                        key={star} 
                        icon={faStar} 
                        size="xs" 
                        color={star <= r.rating ? '#fbbf24' : '#e2e8f0'} 
                      />
                    ))}
                  </div>
                </td>
                <td><div style={{maxWidth: '300px', fontSize: '0.9rem', color: '#475569'}}>{r.comment}</div></td>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td className={styles.actionsCell}>
                  <button className={styles.btnDanger} onClick={() => handleDelete(r.id)}>
                    <FontAwesomeIcon icon={faTrash} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reviews.length === 0 && (
          <div className={styles.emptyStateContainer}>
            <p>No customer reviews found yet.</p>
          </div>
        )}
      </div>

      {showSuccessToast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', background: '#10b981', color: 'white',
          padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideIn 0.3s ease-out'
        }}>
          <FontAwesomeIcon icon={faCircleCheck} /> Review deleted successfully!
        </div>
      )}
    </div>
  );
}
