'use client';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faPlus,
  faTrash,
  faCloudUploadAlt,
  faTimes,
  faImages,
  faCheckCircle,
  faEye,
  faFilter,
} from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

export default function ChatReviewsDashboard() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');

  // Form states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [targetProductId, setTargetProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Lightbox preview
  const [previewReview, setPreviewReview] = useState(null);

  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsRes, productsRes] = await Promise.all([
        fetch('/api/chat-reviews?t=' + Date.now()),
        fetch('/api/products?t=' + Date.now()),
      ]);

      const [reviewsData, productsData] = await Promise.all([
        reviewsRes.ok ? reviewsRes.json() : [],
        productsRes.ok ? productsRes.json() : [],
      ]);

      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setSelectedFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveSelectedFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert('Please select at least one WhatsApp screenshot image.');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload all images to Cloudinary via /api/upload
      const uploadedUrls = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress(`Uploading screenshot ${i + 1} of ${selectedFiles.length}...`);
        const file = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error || 'Upload failed for file ' + file.name);
        }
        uploadedUrls.push(data.url);
      }

      setUploadProgress('Saving records to database...');

      // 2. Save records to /api/chat-reviews
      const saveRes = await fetch('/api/chat-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: uploadedUrls,
          product_id: targetProductId || null,
          customer_name: customerName,
          caption: caption,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) {
        throw new Error(saveData.error || 'Failed to save reviews');
      }

      // Reset form
      setSelectedFiles([]);
      setPreviews([]);
      setCustomerName('');
      setCaption('');
      setTargetProductId('');
      setShowUploadPanel(false);
      setUploadProgress('');

      // Refresh list
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error uploading screenshots');
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/chat-reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_active: !currentStatus } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this chat review screenshot?')) return;

    try {
      const res = await fetch(`/api/chat-reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert('Failed to delete review');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting review');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedProductFilter === 'ALL') return true;
    if (selectedProductFilter === 'GENERAL') return !r.product_id;
    return String(r.product_id) === String(selectedProductFilter);
  });

  const totalReviews = reviews.length;
  const productLinked = reviews.filter((r) => r.product_id).length;
  const generalReviews = reviews.filter((r) => !r.product_id).length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1>
            <FontAwesomeIcon icon={faComments} style={{ color: '#25D366' }} />
            Chat Reviews
          </h1>
          <p>
            Upload customer WhatsApp &amp; chat screenshots to display directly on product pages.
          </p>
        </div>

        <button
          type="button"
          className={styles.uploadTriggerBtn}
          onClick={() => setShowUploadPanel(!showUploadPanel)}
        >
          <FontAwesomeIcon icon={showUploadPanel ? faTimes : faPlus} />
          {showUploadPanel ? 'Close Upload' : 'Upload Screenshots'}
        </button>
      </div>

      {/* Stats Chips */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap}>
            <FontAwesomeIcon icon={faImages} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{totalReviews}</span>
            <span className={styles.statLbl}>Total Screenshots</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#fef3c7', color: '#b45309' }}>
            <FontAwesomeIcon icon={faComments} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{productLinked}</span>
            <span className={styles.statLbl}>Product Specific</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{generalReviews}</span>
            <span className={styles.statLbl}>General / All Products</span>
          </div>
        </div>
      </div>

      {/* Upload Drawer / Panel */}
      {showUploadPanel && (
        <div className={styles.uploadPanel}>
          <div className={styles.panelHeader}>
            <h2>
              <FontAwesomeIcon icon={faCloudUploadAlt} style={{ color: 'var(--maroon)' }} />
              Upload New Chat Screenshots
            </h2>
            <button
              type="button"
              className={styles.closePanelBtn}
              onClick={() => setShowUploadPanel(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <form onSubmit={handleSubmitUpload}>
            <div className={styles.formGrid}>
              <div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Link to Product</label>
                  <select
                    className={styles.formSelect}
                    value={targetProductId}
                    onChange={(e) => setTargetProductId(e.target.value)}
                  >
                    <option value="">All Products (General Store Feedback)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Customer Name / Location (Optional)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. Customer from Lahore / Mrs. Tariq"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Caption / Highlight Note (Optional)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="e.g. 'Bannu Biryani Masala ka zaika lajawab tha!'"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={styles.formLabel}>Select WhatsApp Screenshot(s) *</label>
                <div
                  className={styles.dropzone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className={styles.fileInput}
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelected}
                  />
                  <div className={styles.dropzoneIcon}>
                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                  </div>
                  <p className={styles.dropzoneText}>Click to browse WhatsApp screenshot images</p>
                  <p className={styles.dropzoneSub}>You can select multiple photos at once (JPG, PNG, WebP)</p>
                </div>

                {previews.length > 0 && (
                  <div className={styles.previewsGrid}>
                    {previews.map((src, idx) => (
                      <div key={idx} className={styles.previewThumbWrap}>
                        <img src={src} alt="Preview" className={styles.previewThumb} />
                        <button
                          type="button"
                          className={styles.removeThumbBtn}
                          onClick={() => handleRemoveSelectedFile(idx)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={uploading}>
              <FontAwesomeIcon icon={faCloudUploadAlt} />
              {uploading ? uploadProgress || 'Uploading...' : `Upload ${selectedFiles.length > 0 ? selectedFiles.length + ' Screenshot(s)' : ''}`}
            </button>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FontAwesomeIcon icon={faFilter} style={{ color: '#64748b' }} />
          <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>
            Filter by Product:
          </span>
          <select
            className={styles.filterSelect}
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
          >
            <option value="ALL">All Screenshots ({reviews.length})</option>
            <option value="GENERAL">General Feedback ({generalReviews})</option>
            {products.map((p) => {
              const count = reviews.filter((r) => r.product_id === p.id).length;
              return (
                <option key={p.id} value={p.id}>
                  {p.name} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading chat reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <FontAwesomeIcon icon={faComments} />
          </div>
          <h3>No Chat Reviews Found</h3>
          <p>
            {selectedProductFilter === 'ALL'
              ? 'Click "Upload Screenshots" above to upload your first customer WhatsApp review.'
              : 'No screenshots uploaded for this product yet.'}
          </p>
        </div>
      ) : (
        <div className={styles.galleryGrid}>
          {filteredReviews.map((item) => (
            <div key={item.id} className={styles.reviewCard}>
              <div
                className={styles.screenshotWrap}
                onClick={() => setPreviewReview(item)}
                title="Click to view full screen"
              >
                <img
                  src={item.image_url}
                  alt={item.caption || item.customer_name || 'WhatsApp Review'}
                  className={styles.screenshotImg}
                  loading="lazy"
                />
                <div className={styles.zoomOverlay}>
                  <FontAwesomeIcon icon={faEye} />
                </div>
              </div>

              <div className={styles.cardBody}>
                {item.product_name ? (
                  <span className={styles.productBadge}>{item.product_name}</span>
                ) : (
                  <span className={`${styles.productBadge} ${styles.generalBadge}`}>
                    All Products
                  </span>
                )}

                {item.customer_name && (
                  <h4 className={styles.cardCustomer}>{item.customer_name}</h4>
                )}

                {item.caption && <p className={styles.cardCaption}>{item.caption}</p>}

                <span className={styles.cardDate}>
                  {new Date(item.created_at).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={`${styles.toggleActiveBtn} ${item.is_active ? styles.activeStatus : styles.inactiveStatus}`}
                    onClick={() => handleToggleActive(item.id, item.is_active)}
                  >
                    {item.is_active ? 'Visible' : 'Hidden'}
                  </button>

                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(item.id)}
                    title="Delete screenshot"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {previewReview && (
        <div className={styles.modalOverlay} onClick={() => setPreviewReview(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setPreviewReview(null)}
            >
              ✕
            </button>
            <img
              src={previewReview.image_url}
              alt="Full screenshot"
              className={styles.lightboxImg}
            />
            {previewReview.caption && (
              <p className={styles.lightboxCaption}>{previewReview.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
