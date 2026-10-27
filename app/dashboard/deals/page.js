'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFire,
  faPlus,
  faEdit,
  faTrash,
  faImage,
  faCircleCheck,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../orders/page.module.css';

function toDateTimeLocal(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function scheduleStatus(deal) {
  if (!deal.is_active) return { label: 'Inactive', color: '#64748b', background: '#f1f5f9' };
  const now = new Date();
  if (deal.start_at && new Date(deal.start_at) > now) {
    return { label: 'Scheduled', color: '#92400e', background: '#fef3c7' };
  }
  if (deal.end_at && new Date(deal.end_at) < now) {
    return { label: 'Expired', color: '#b91c1c', background: '#fee2e2' };
  }
  return { label: 'Live', color: '#15803d', background: '#dcfce7' };
}

const EMPTY_FORM = {
  product_id: '',
  variant: '',
  price: '',
  start_at: '',
  end_at: '',
  is_active: true,
};

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deals?t=' + Date.now());
      const data = await res.json();
      setDeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?t=' + Date.now());
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchProducts();
  }, []);

  const selectedProduct = products.find((p) => String(p.id) === String(formData.product_id));
  const selectedVariants = selectedProduct
    ? Object.entries(selectedProduct.variants).filter(([, price]) => Number(price) > 0)
    : [];
  const originalPrice = selectedProduct
    ? Number(selectedProduct.variants[formData.variant]) || 0
    : 0;

  const handleOpenModal = (deal = null) => {
    setFormError('');

    if (deal) {
      setEditingId(deal.id);
      setFormData({
        product_id: deal.product_id || '',
        variant: deal.variant || '',
        price: deal.price || '',
        start_at: toDateTimeLocal(deal.start_at),
        end_at: toDateTimeLocal(deal.end_at),
        is_active: deal.is_active !== false,
      });
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const handleProductChange = (productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    const firstVariant = product
      ? Object.entries(product.variants).find(([, price]) => Number(price) > 0)?.[0] || ''
      : '';

    setFormData((prev) => ({
      ...prev,
      product_id: productId,
      variant: firstVariant,
      price: '',
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.product_id || !formData.variant) {
      setFormError('Please select a product and variant.');
      return;
    }

    if (formData.start_at && formData.end_at && new Date(formData.end_at) <= new Date(formData.start_at)) {
      setFormError('End date must be after the start date.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        product_id: Number(formData.product_id),
        variant: formData.variant,
        price: parseInt(formData.price, 10) || 0,
        start_at: formData.start_at || null,
        end_at: formData.end_at || null,
        is_active: formData.is_active,
      };

      const res = await fetch(editingId ? `/api/deals/${editingId}` : '/api/deals', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || 'Failed to save deal.');
        return;
      }

      setIsModalOpen(false);
      fetchDeals();
    } catch (err) {
      setFormError('Something went wrong while saving the deal.');
    } finally {
      setSaving(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const confirmDelete = async () => {
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setDeals((prev) => prev.filter((d) => d.id !== id));

    try {
      const res = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        fetchDeals();
      }
    } catch {
      fetchDeals();
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading deals...</div>;

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>
          <FontAwesomeIcon icon={faFire} style={{ width: '24px', marginRight: '12px' }} />
          Hot Deals Manager
        </h1>
        <button className={styles.btnPrimary} onClick={() => handleOpenModal()}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} /> Add Deal
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          color: '#92400e',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '0.85rem',
          marginBottom: '20px',
        }}
      >
        <FontAwesomeIcon icon={faTag} />
        Deals are linked to real products. Discounted prices apply automatically on product cards and
        in checkout.
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Variant</th>
              <th>Pricing</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => {
              const status = scheduleStatus(d);
              const image = d.product_image || d.image;
              const name = d.product_name || d.title;

              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          style={{
                            width: '48px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <FontAwesomeIcon icon={faImage} color="#cbd5e1" />
                        </div>
                      )}
                      <div>
                        <div className={styles.bold}>{name}</div>
                        <div className={styles.subtext}>{d.product_slug || 'Unlinked deal'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#800000',
                        background: '#fdf2f2',
                        padding: '4px 10px',
                        borderRadius: '999px',
                      }}
                    >
                      {d.variant || '—'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.bold}>Rs {d.price}</div>
                    {d.current_original_price > 0 && (
                      <div className={styles.subtext}>
                        <span style={{ textDecoration: 'line-through' }}>Rs {d.current_original_price}</span>
                        {d.current_original_price > d.price && (
                          <span style={{ color: '#15803d', fontWeight: 700, marginLeft: '6px' }}>
                            {Math.round(((d.current_original_price - d.price) / d.current_original_price) * 100)}% off
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#475569' }}>
                    <div>From: {d.start_at ? new Date(d.start_at).toLocaleDateString() : 'Now'}</div>
                    <div>To: {d.end_at ? new Date(d.end_at).toLocaleDateString() : 'No end date'}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        color: status.color,
                        background: status.background,
                      }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button className={styles.btnEdit} onClick={() => handleOpenModal(d)}>
                      <FontAwesomeIcon icon={faEdit} style={{ display: 'inline', marginRight: '4px' }} /> Edit
                    </button>
                    <button className={styles.btnDanger} onClick={() => setDeleteConfirmId(d.id)}>
                      <FontAwesomeIcon icon={faTrash} style={{ display: 'inline', marginRight: '4px' }} /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {deals.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No hot deals yet. Add your first product deal!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '16px' }}>⚠️</div>
            <h2 className={styles.modalTitle} style={{ marginBottom: '12px' }}>Are you sure?</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              This action cannot be undone. The deal will be removed from the storefront immediately.
            </p>
            <div className={styles.modalActions} style={{ justifyContent: 'center' }}>
              <button className={styles.btnSecondary} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className={styles.btnPrimary} style={{ background: '#ef4444' }} onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <FontAwesomeIcon icon={faCircleCheck} /> Deal deleted successfully!
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>{editingId ? 'Edit Deal' : 'Add New Deal'}</h2>

            <form onSubmit={handleSave}>
              <div className={styles.formRow}>
                <div className={styles.fullWidth}>
                  <label className={styles.label}>Product</label>
                  <select
                    required
                    className={styles.input}
                    value={formData.product_id}
                    onChange={(e) => handleProductChange(e.target.value)}
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div>
                  <label className={styles.label}>Variant</label>
                  <select
                    required
                    className={styles.input}
                    value={formData.variant}
                    onChange={(e) => setFormData({ ...formData, variant: e.target.value, price: '' })}
                    disabled={!selectedProduct}
                  >
                    <option value="">Select variant</option>
                    {selectedVariants.map(([label, price]) => (
                      <option key={label} value={label}>
                        {label} — Rs {price}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={styles.label}>
                    Sale Price (Rs){originalPrice > 0 ? ` — was Rs ${originalPrice}` : ''}
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max={originalPrice > 0 ? originalPrice - 1 : undefined}
                    className={styles.input}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    disabled={!formData.variant}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div>
                  <label className={styles.label}>Starts (optional)</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className={styles.label}>Ends (optional)</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={formData.end_at}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 600, color: '#334155' }}>Deal is active</span>
                </label>
              </div>

              {originalPrice > 0 && formData.price && Number(formData.price) < originalPrice && (
                <p style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600, marginTop: '8px' }}>
                  Customer saves Rs {originalPrice - Number(formData.price)} (
                  {Math.round(((originalPrice - Number(formData.price)) / originalPrice) * 100)}% off)
                </p>
              )}

              {formError && (
                <p style={{ fontSize: '0.85rem', color: '#b91c1c', background: '#fee2e2', padding: '10px 14px', borderRadius: '8px', marginTop: '12px' }}>
                  {formError}
                </p>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsModalOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
