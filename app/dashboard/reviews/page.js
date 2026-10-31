'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faTrash,
  faMessage,
  faCircleCheck,
  faEyeSlash,
  faEye,
  faShieldHalved,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../orders/page.module.css';

const FILTERS = [
  { key: 'all',    label: 'All Reviews' },
  { key: 'hidden', label: 'Hidden'      },
];

export default function ReviewsManager() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');
  const [toast, setToast]       = useState('');

  const showToast = (msg, color = '#10b981') => {
    setToast({ msg, color });
    setTimeout(() => setToast(''), 3000);
  };

  const fetchReviews = async () => {
    try {
      const res  = await fetch('/api/reviews?t=' + Date.now());
      const data = await res.json();
      if (res.ok) setReviews(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, []);

  /* Toggle hide / restore */
  const handleToggle = async (review) => {
    const next = !review.is_approved;
    setReviews((prev) => prev.map((r) => r.id === review.id ? { ...r, is_approved: next } : r));
    try {
      const res = await fetch(`/api/reviews/moderate/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved: next }),
      });
      if (!res.ok) { fetchReviews(); return; }
      showToast(next ? 'Review restored & visible!' : 'Review hidden from storefront.');
    } catch { fetchReviews(); }
  };

  /* Delete */
  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/moderate/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        showToast('Review deleted.', '#ef4444');
      }
    } catch { alert('Failed to delete review.'); }
  };

  if (loading) return <div style={{ padding: '40px', color: '#64748b' }}>Loading reviews...</div>;

  const totalCount  = reviews.length;
  const hiddenCount = reviews.filter((r) => !r.is_approved).length;
  const avgRating   = totalCount
    ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / totalCount).toFixed(1)
    : '—';

  const filtered = reviews.filter((r) => {
    if (filter === 'hidden') return !r.is_approved;
    return true;
  }).filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.reviewer_name?.toLowerCase().includes(q) ||
      r.product_name?.toLowerCase().includes(q) ||
      r.comment?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>
            <FontAwesomeIcon icon={faMessage} style={{ width: '22px', marginRight: '10px', color: 'var(--maroon, #7c1a1a)' }} />
            Reviews
          </h1>
          <p className={styles.pageSub}>All reviews are published automatically. Hide or delete inappropriate ones.</p>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <FontAwesomeIcon icon={faSearch} style={{ color: '#94a3b8', fontSize: '0.85rem' }} />
          <input
            type="search"
            placeholder="Search reviewer, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Review Type Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <Link
          href="/dashboard/reviews"
          style={{
            padding: '8px 18px',
            borderRadius: '50px',
            background: 'var(--maroon, #7b1c1c)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            textDecoration: 'none',
          }}
        >
          Customer Text Reviews
        </Link>
        <Link
          href="/dashboard/chat-reviews"
          style={{
            padding: '8px 18px',
            borderRadius: '50px',
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            color: '#334155',
            fontWeight: 700,
            fontSize: '0.85rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          💬 WhatsApp Chat Reviews
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { label: 'Total Reviews', value: totalCount,  color: '#0f172a' },
          { label: 'Avg Rating',    value: `⭐ ${avgRating}`, color: '#d97706' },
          { label: 'Visible',       value: totalCount - hiddenCount, color: '#047857' },
          { label: 'Hidden',        value: hiddenCount, color: '#94a3b8' },
        ].map((s) => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '14px 22px',
            textAlign: 'center', minWidth: '100px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94a3b8', marginTop: '3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabsBar}>
        {FILTERS.map((item) => {
          const count = item.key === 'hidden' ? hiddenCount : totalCount;
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`${styles.tabBtn} ${active ? styles.tabBtnActive : ''}`}
            >
              {item.label}
              <span className={styles.tabBadge}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Reviewer</th>
              <th>Product</th>
              <th style={{ textAlign: 'center' }}>Rating</th>
              <th>Comment</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} style={{ opacity: r.is_approved ? 1 : 0.55 }}>

                {/* Reviewer */}
                <td>
                  <div className={styles.bold} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {r.reviewer_name}
                    {r.is_verified && (
                      <FontAwesomeIcon icon={faShieldHalved} style={{ color: '#047857', fontSize: '0.75rem' }} title="Verified purchase" />
                    )}
                  </div>
                </td>

                {/* Product */}
                <td>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 600, color: '#475569',
                    background: '#f1f5f9', padding: '3px 9px',
                    borderRadius: '6px', display: 'inline-block',
                  }}>
                    {r.product_name}
                  </span>
                </td>

                {/* Rating */}
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                    {[1,2,3,4,5].map((s) => (
                      <FontAwesomeIcon
                        key={s}
                        icon={faStar}
                        style={{ fontSize: '0.75rem', color: s <= r.rating ? '#fbbf24' : '#e2e8f0' }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{r.rating}/5</div>
                </td>

                {/* Comment */}
                <td style={{ maxWidth: '280px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.45 }}>
                    {r.comment || <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>No comment</span>}
                  </p>
                </td>

                {/* Status */}
                <td style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: '0.74rem', fontWeight: 700,
                    padding: '4px 11px', borderRadius: '20px',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    color: r.is_approved ? '#15803d' : '#64748b',
                    background: r.is_approved ? '#dcfce7' : '#f1f5f9',
                    border: `1px solid ${r.is_approved ? '#86efac' : '#e2e8f0'}`,
                  }}>
                    <FontAwesomeIcon icon={r.is_approved ? faEye : faEyeSlash} style={{ fontSize: '0.65rem' }} />
                    {r.is_approved ? 'Visible' : 'Hidden'}
                  </span>
                </td>

                {/* Date */}
                <td style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {new Date(r.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>

                {/* Actions */}
                <td>
                  <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleToggle(r)}
                      className={r.is_approved ? styles.btnEdit : styles.btnEdit}
                      style={r.is_approved ? {} : { background: '#f0fdf4', borderColor: '#86efac', color: '#15803d' }}
                      title={r.is_approved ? 'Hide from storefront' : 'Restore to storefront'}
                    >
                      <FontAwesomeIcon icon={r.is_approved ? faEyeSlash : faEye} />
                      {r.is_approved ? 'Hide' : 'Restore'}
                    </button>
                    <button className={styles.btnDanger} onClick={() => handleDelete(r.id)} title="Delete permanently">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>⭐</div>
            <p style={{ margin: 0, fontWeight: 600, color: '#64748b' }}>
              {search ? 'No reviews match your search.' : filter === 'hidden' ? 'No hidden reviews.' : 'No reviews yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: toast.color || '#10b981', color: 'white',
          padding: '13px 22px', borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 3000, display: 'flex', alignItems: 'center',
          gap: '8px', fontWeight: 600, fontSize: '0.9rem',
          animation: 'slideIn 0.3s ease-out',
        }}>
          <FontAwesomeIcon icon={faCircleCheck} /> {toast.msg}
        </div>
      )}
    </div>
  );
}
