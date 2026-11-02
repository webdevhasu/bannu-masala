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
  faBoxes,
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

function salePriceFor(originalPrice, percent) {
  if (!originalPrice) return 0;
  if (!percent) return originalPrice;
  const value = Math.round((originalPrice * (100 - percent)) / 100);
  return Math.max(1, Math.min(originalPrice - 1, value));
}

function firstVariantFor(product) {
  if (!product) return '';
  return Object.entries(product.variants).find(([, price]) => Number(price) > 0)?.[0] || '';
}

function derivePercent(deal) {
  if (Number(deal.discount_percent) > 0) return Number(deal.discount_percent);
  const first = (deal.items || [])[0];
  if (first && Number(first.original_price) > Number(first.sale_price) && Number(first.original_price) > 0) {
    return Math.round(
      ((Number(first.original_price) - Number(first.sale_price)) / Number(first.original_price)) * 100
    );
  }
  return '';
}

const EMPTY_FORM = {
  title: '',
  image: '',
  price_mode: 'percent',   // 'percent' | 'custom'
  discount_percent: '',
  items: [{ product_id: '', variant: '', custom_price: '' }],
  start_at: '',
  end_at: '',
  is_active: true,
  free_delivery: false,
};

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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

  const priceMode = formData.price_mode || 'percent';
  const discountPercent = Number(formData.discount_percent) || 0;

  // For each item compute the effective sale price based on mode
  function effectiveSalePrice(originalPrice, item) {
    if (!originalPrice) return 0;
    if (priceMode === 'custom') {
      const cp = Number(item.custom_price);
      return cp > 0 ? cp : originalPrice;
    }
    return salePriceFor(originalPrice, discountPercent);
  }

  const previewItems = formData.items
    .map((item) => {
      const product = products.find((p) => String(p.id) === String(item.product_id));
      const originalPrice = product ? Number(product.variants[item.variant]) || 0 : 0;
      const salePrice = effectiveSalePrice(originalPrice, item);
      return {
        ...item,
        product,
        originalPrice,
        salePrice,
      };
    })
    .filter((item) => item.originalPrice > 0);

  const totalOriginal = previewItems.reduce((sum, item) => sum + item.originalPrice, 0);
  const totalSale = previewItems.reduce((sum, item) => sum + item.salePrice, 0);

  const handleOpenModal = (deal = null) => {
    setFormError('');

    if (deal) {
      const dealItems =
        deal.items?.length > 0
          ? deal.items.map((item) => ({
              product_id: String(item.product_id),
              variant: item.variant || '',
              custom_price: item.custom_price ? String(item.custom_price) : '',
            }))
          : [
              {
                product_id: deal.product_id ? String(deal.product_id) : '',
                variant: deal.variant || '',
                custom_price: '',
              },
            ];

      const derivedPercent = derivePercent(deal);
      const hasCutomPrices = deal.items?.some((i) => Number(i.custom_price) > 0);

      setEditingId(deal.id);
      setFormData({
        title: deal.title || '',
        image: deal.image || '',
        price_mode: hasCutomPrices ? 'custom' : 'percent',
        discount_percent: String(derivedPercent || ''),
        items: dealItems,
        start_at: toDateTimeLocal(deal.start_at),
        end_at: toDateTimeLocal(deal.end_at),
        is_active: deal.is_active !== false,
        free_delivery: deal.free_delivery === true,
      });
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
    }
    setIsModalOpen(true);
  };

  const updateItem = (index, patch) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const handleProductChange = (index, productId) => {
    const product = products.find((p) => String(p.id) === String(productId));
    updateItem(index, { product_id: productId, variant: firstVariantFor(product) });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', variant: '' }],
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFormError('');
    setUploadingImage(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const result = await res.json();

      if (!res.ok || result.status !== 201 || !result.url) {
        setFormError(result.error || 'Image upload failed. Please try again.');
        return;
      }

      setFormData((prev) => ({ ...prev, image: result.url }));
    } catch (err) {
      setFormError('Image upload failed. Please try again.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    const validItems = formData.items.filter((item) => item.product_id && item.variant);
    if (validItems.length === 0) {
      setFormError('Please select at least one product and variant.');
      return;
    }

    if (formData.items.some((item) => !item.product_id || !item.variant)) {
      setFormError('Please select a variant for every product, or remove the empty row.');
      return;
    }

    if (priceMode === 'percent' && (discountPercent <= 0 || discountPercent >= 100)) {
      setFormError('Discount must be between 1% and 99%.');
      return;
    }

    if (priceMode === 'custom') {
      const missingCustom = formData.items.some(
        (item) => item.product_id && item.variant && !(Number(item.custom_price) > 0)
      );
      if (missingCustom) {
        setFormError('Please enter a custom price (> 0) for every product in Custom Price mode.');
        return;
      }
    }

    if (formData.start_at && formData.end_at && new Date(formData.end_at) <= new Date(formData.start_at)) {
      setFormError('End date must be after the start date.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        image: formData.image || null,
        discount_percent: priceMode === 'percent' ? discountPercent : null,
        items: validItems.map((item) => {
          const product = products.find((p) => String(p.id) === String(item.product_id));
          const originalPrice = product ? Number(product.variants[item.variant]) || 0 : 0;
          const salePrice =
            priceMode === 'custom'
              ? Number(item.custom_price)
              : salePriceFor(originalPrice, discountPercent);
          return {
            product_id: Number(item.product_id),
            variant: item.variant,
            custom_price: priceMode === 'custom' ? Number(item.custom_price) : null,
            sale_price: salePrice,
          };
        }),
        start_at: formData.start_at || null,
        end_at: formData.end_at || null,
        is_active: formData.is_active,
        free_delivery: formData.free_delivery,
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
        Ek hi deal mein multiple products add karein. Har product par wohi discount % apply hoga
        aur discount product cards, deals page aur checkout mein automatically show hoga.
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Deal / Products</th>
              <th>Discount</th>
              <th>Pricing</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => {
              const status = scheduleStatus(d);
              const items =
                d.items?.length > 0
                  ? d.items
                  : d.product_id
                    ? [
                        {
                          id: `legacy-${d.id}`,
                          product_name: d.product_name || d.title,
                          product_image: d.product_image || d.image,
                          variant: d.variant,
                          original_price: d.current_original_price,
                          sale_price: d.price,
                        },
                      ]
                    : [];

              const originalTotal = items.reduce(
                (sum, item) => sum + (Number(item.original_price) || 0),
                0
              );
              const saleTotal = items.reduce(
                (sum, item) => sum + (Number(item.sale_price) || 0),
                0
              );
              const percent = derivePercent(d) || 0;

              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div className={styles.bold}>{d.title}</div>
                      {items.map((item) => (
                        <div
                          key={item.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                        >
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '40px',
                                height: '40px',
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
                            <div style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                              {item.product_name}
                            </div>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                color: '#800000',
                                background: '#fdf2f2',
                                padding: '2px 8px',
                                borderRadius: '999px',
                              }}
                            >
                              {item.variant || '—'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: '#b91c1c',
                        background: '#fee2e2',
                        padding: '4px 10px',
                        borderRadius: '999px',
                      }}
                    >
                      {percent}% OFF
                    </span>
                    <div className={styles.subtext} style={{ marginTop: '6px' }}>
                      {items.length} {items.length === 1 ? 'product' : 'products'}
                    </div>
                  </td>
                  <td>
                    <div className={styles.bold}>Rs {saleTotal.toLocaleString()}</div>
                    {originalTotal > saleTotal && (
                      <div className={styles.subtext}>
                        <span style={{ textDecoration: 'line-through' }}>
                          Rs {originalTotal.toLocaleString()}
                        </span>
                        <span style={{ color: '#15803d', fontWeight: 700, marginLeft: '6px' }}>
                          {percent}% off
                        </span>
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
                    {d.free_delivery && (
                      <div
                        style={{
                          marginTop: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#15803d',
                          background: '#dcfce7',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          display: 'inline-block',
                        }}
                      >
                        Free Delivery
                      </div>
                    )}
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
          <div className={styles.modalContent} style={{ maxWidth: '760px' }}>
            <h2 className={styles.modalTitle}>{editingId ? 'Edit Deal' : 'Add New Deal'}</h2>

            <form onSubmit={handleSave}>
              <div className={styles.formRow}>
                <div className={styles.fullWidth}>
                  <label className={styles.label}>Deal Title (optional)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Leave blank to auto-use product names"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className={styles.label}>Deal Image (optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Deal preview"
                      style={{
                        width: '104px',
                        height: '104px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '104px',
                        height: '104px',
                        borderRadius: '12px',
                        border: '1px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        background: '#f8fafc',
                      }}
                    >
                      <FontAwesomeIcon icon={faImage} size="2x" />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className={styles.btnSecondary} style={{ cursor: 'pointer' }}>
                      {uploadingImage
                        ? 'Uploading...'
                        : formData.image
                          ? 'Change Image'
                          : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {formData.image && (
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Remove Image
                      </button>
                    )}

                    <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      Leave empty to use the first product image.
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className={styles.label}>
                  <FontAwesomeIcon icon={faBoxes} style={{ marginRight: '6px' }} />
                  Products in this deal
                </label>

                {formData.items.map((item, index) => {
                  const product = products.find((p) => String(p.id) === String(item.product_id));
                  const variants = product
                    ? Object.entries(product.variants).filter(([, price]) => Number(price) > 0)
                    : [];
                  const originalPrice = product
                    ? Number(product.variants[item.variant]) || 0
                    : 0;
                  const previewSale = effectiveSalePrice(originalPrice, item);

                  return (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '10px',
                        background: '#fafafa',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: priceMode === 'custom' ? '1fr 1fr 120px auto' : '1fr 1fr auto',
                          gap: '12px',
                          alignItems: 'end',
                        }}
                      >
                        <div>
                          <label className={styles.label}>Product</label>
                          <select
                            required
                            className={styles.input}
                            value={item.product_id}
                            onChange={(e) => handleProductChange(index, e.target.value)}
                          >
                            <option value="">Select a product</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={styles.label}>Variant</label>
                          <select
                            required
                            className={styles.input}
                            value={item.variant}
                            onChange={(e) =>
                              updateItem(index, { variant: e.target.value })
                            }
                            disabled={!product}
                          >
                            <option value="">Select variant</option>
                            {variants.map(([label, price]) => (
                              <option key={label} value={label}>
                                {label} — Rs {price}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Custom price field — only in custom mode */}
                        {priceMode === 'custom' && (
                          <div>
                            <label className={styles.label}>Deal Price (Rs)</label>
                            <input
                              type="number"
                              min="1"
                              className={styles.input}
                              value={item.custom_price}
                              onChange={(e) => updateItem(index, { custom_price: e.target.value })}
                              placeholder="e.g. 450"
                              disabled={!product || !item.variant}
                            />
                          </div>
                        )}

                        <button
                          type="button"
                          className={styles.btnDanger}
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                          style={{ height: '40px', marginBottom: '1px' }}
                        >
                          <FontAwesomeIcon icon={faTrash} /> Remove
                        </button>
                      </div>

                      {originalPrice > 0 && (
                        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#475569' }}>
                          Original: Rs {originalPrice.toLocaleString()} →{' '}
                          <strong style={{ color: '#15803d' }}>
                            Rs {previewSale.toLocaleString()}
                          </strong>{' '}
                          {previewSale < originalPrice && (
                            <span style={{ color: '#b91c1c' }}>
                              ({Math.round(((originalPrice - previewSale) / originalPrice) * 100)}% off)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={addItem}
                  style={{ marginTop: '4px' }}
                >
                  <FontAwesomeIcon icon={faPlus} /> Add Another Product
                </button>
              </div>

              {/* ── Pricing Mode Toggle ── */}
              <div style={{ marginBottom: '16px' }}>
                <label className={styles.label}>Discount Type</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[
                    { key: 'percent', label: '% Percentage Discount' },
                    { key: 'custom',  label: '₨ Custom Price'        },
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData((p) => ({ ...p, price_mode: key, discount_percent: '' }))}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '10px',
                        border: priceMode === key ? '2px solid #7c1a1a' : '1.5px solid #e2e8f0',
                        background: priceMode === key ? '#fdf2f2' : '#fff',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: priceMode === key ? '#7c1a1a' : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                  {priceMode === 'percent'
                    ? 'Enter a % and system will auto-calculate deal price for each product.'
                    : 'Enter the exact deal price for each product above. System will auto-calculate % off.'}
                </p>
              </div>

              <div className={styles.formRow}>
                {priceMode === 'percent' && (
                  <div>
                    <label className={styles.label}>Discount Percentage (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      className={styles.input}
                      value={formData.discount_percent}
                      onChange={(e) =>
                        setFormData({ ...formData, discount_percent: e.target.value })
                      }
                      placeholder="e.g. 20"
                    />
                  </div>
                )}
                <div>
                  <label className={styles.label}>Price Preview</label>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      fontSize: '0.85rem',
                    }}
                  >
                    {totalOriginal > 0 ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#64748b' }}>
                          Rs {totalOriginal.toLocaleString()}
                        </span>{' '}
                        <strong style={{ color: '#15803d' }}>
                          Rs {totalSale.toLocaleString()}
                        </strong>{' '}
                        <span style={{ color: '#166534' }}>
                          (save Rs {(totalOriginal - totalSale).toLocaleString()})
                        </span>
                      </>
                    ) : (
                      <span style={{ color: '#64748b' }}>Select products to preview</span>
                    )}
                  </div>
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

              <div className={styles.formGroup} style={{ marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.free_delivery}
                    onChange={(e) =>
                      setFormData({ ...formData, free_delivery: e.target.checked })
                    }
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 600, color: '#334155' }}>
                    Free delivery on this deal
                  </span>
                </label>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '4px 0 0 26px' }}>
                  Customers ordering this deal will not be charged shipping.
                </p>
              </div>

              {totalOriginal > 0 && discountPercent > 0 && (
                <p style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600, marginTop: '8px' }}>
                  Customer saves Rs {(totalOriginal - totalSale).toLocaleString()} on this combo.
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
