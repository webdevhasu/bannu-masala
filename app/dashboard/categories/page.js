'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLayerGroup,
  faPlus,
  faEdit,
  faTrash,
  faImage,
  faCircleCheck,
  faEye,
  faEyeSlash,
  faTimes,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../orders/page.module.css';
import catStyles from './page.module.css';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  image: '',
  sort_order: 0,
  is_active: true,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);

  const [fileToUpload, setFileToUpload] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories?t=' + Date.now());
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleOpenModal = (category = null) => {
    setFormError('');
    setFileToUpload(null);
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image: category.image || '',
        sort_order: category.sort_order || 0,
        is_active: category.is_active !== false,
      });
      setImagePreview(category.image || '');
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setImagePreview('');
    }
    setIsModalOpen(true);
  };

  const handleFile = (file) => {
    if (!file) return;
    setFileToUpload(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      let imageUrl = formData.image;
      if (fileToUpload) {
        const uploadData = new FormData();
        uploadData.append('file', fileToUpload);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: uploadData });
        const uploadResult = await uploadRes.json();
        if (uploadResult.status === 201) {
          imageUrl = uploadResult.url;
        } else {
          setFormError('Image upload failed. Please try again.');
          return;
        }
      }
      const payload = { ...formData, image: imageUrl, sort_order: parseInt(formData.sort_order, 10) || 0 };
      const res = await fetch(editingId ? `/api/categories/${editingId}` : '/api/categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) { setFormError(result.error || 'Failed to save.'); return; }
      setIsModalOpen(false);
      fetchCategories();
      showToast(editingId ? 'Category updated!' : 'Category created!');
    } catch {
      setFormError('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) showToast('Category deleted.');
      else fetchCategories();
    } catch { fetchCategories(); }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        <FontAwesomeIcon icon={faLayerGroup} style={{ fontSize: '2rem', marginBottom: '12px', display: 'block' }} />
        Loading categories...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>
            <FontAwesomeIcon icon={faLayerGroup} style={{ width: '22px', marginRight: '10px', color: 'var(--maroon, #7c1a1a)' }} />
            Categories
          </h1>
          <p className={styles.pageSub}>Manage product categories shown on the storefront.</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => handleOpenModal()}>
          <FontAwesomeIcon icon={faPlus} />
          Add Category
        </button>
      </div>

      {/* Stats Bar */}
      <div className={catStyles.statsBar}>
        <div className={catStyles.statChip}>
          <span className={catStyles.statNum}>{categories.length}</span>
          <span className={catStyles.statLabel}>Total</span>
        </div>
        <div className={catStyles.statChip}>
          <span className={catStyles.statNum} style={{ color: '#047857' }}>
            {categories.filter((c) => c.is_active).length}
          </span>
          <span className={catStyles.statLabel}>Active</span>
        </div>
        <div className={catStyles.statChip}>
          <span className={catStyles.statNum} style={{ color: '#94a3b8' }}>
            {categories.filter((c) => !c.is_active).length}
          </span>
          <span className={catStyles.statLabel}>Hidden</span>
        </div>
        <div className={catStyles.statChip}>
          <span className={catStyles.statNum} style={{ color: '#0369a1' }}>
            {categories.reduce((s, c) => s + (c.product_count || 0), 0)}
          </span>
          <span className={catStyles.statLabel}>Total Products</span>
        </div>
      </div>

      {/* Category Cards Grid */}
      {categories.length === 0 ? (
        <div className={catStyles.emptyState}>
          <div className={catStyles.emptyIcon}>🗂️</div>
          <h3>No categories yet</h3>
          <p>Create your first category to organize your products.</p>
          <button className={styles.btnPrimary} onClick={() => handleOpenModal()}>
            <FontAwesomeIcon icon={faPlus} /> Add First Category
          </button>
        </div>
      ) : (
        <div className={catStyles.catGrid}>
          {categories.map((cat) => (
            <div key={cat.id} className={`${catStyles.catCard} ${!cat.is_active ? catStyles.catCardHidden : ''}`}>
              {/* Image — own image OR first product image as fallback */}
              <div className={catStyles.catImageWrap}>
                {cat.image || cat.first_product_image ? (
                  <>
                    <img
                      src={cat.image || cat.first_product_image}
                      alt={cat.name}
                      className={catStyles.catImage}
                    />
                    {!cat.image && cat.first_product_image && (
                      <span className={catStyles.autoBadge} title="Auto-picked from first product">Auto</span>
                    )}
                  </>
                ) : (
                  <div className={catStyles.catImagePlaceholder}>
                    <FontAwesomeIcon icon={faImage} />
                  </div>
                )}
                {/* Status badge */}
                <span className={`${catStyles.catStatusBadge} ${cat.is_active ? catStyles.badgeActive : catStyles.badgeHidden}`}>
                  <FontAwesomeIcon icon={cat.is_active ? faEye : faEyeSlash} style={{ fontSize: '0.6rem' }} />
                  {cat.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>

              {/* Info */}
              <div className={catStyles.catBody}>
                <div className={catStyles.catName}>{cat.name}</div>
                {cat.description && (
                  <div className={catStyles.catDesc}>{cat.description}</div>
                )}
                <div className={catStyles.catMeta}>
                  <span className={catStyles.metaChip}>
                    📦 {cat.product_count || 0} products
                  </span>
                  <span className={catStyles.metaChip}>
                    # Order: {cat.sort_order}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className={catStyles.catActions}>
                <button className={styles.btnEdit} onClick={() => handleOpenModal(cat)}>
                  <FontAwesomeIcon icon={faEdit} /> Edit
                </button>
                <button className={styles.btnDanger} onClick={() => setDeleteConfirmId(cat.id)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🗑️</div>
            <h2 className={styles.modalTitle}>Delete Category?</h2>
            <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>
              This cannot be undone. Products in this category will become uncategorized.
            </p>
            <div className={styles.modalActions} style={{ justifyContent: 'center' }}>
              <button className={styles.btnSecondary} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className={styles.btnPrimary} style={{ background: '#ef4444', boxShadow: 'none' }} onClick={confirmDelete}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: '#10b981', color: 'white',
          padding: '13px 22px', borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
          zIndex: 3000, display: 'flex', alignItems: 'center', gap: '8px',
          fontWeight: 600, fontSize: '0.9rem',
          animation: 'slideIn 0.3s ease-out',
        }}>
          <FontAwesomeIcon icon={faCircleCheck} /> {toast}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={catStyles.modalLarge}>
            {/* Modal Header */}
            <div className={catStyles.modalHeader}>
              <div>
                <h2 className={catStyles.modalHeading}>
                  {editingId ? '✏️ Edit Category' : '➕ Add New Category'}
                </h2>
                <p className={catStyles.modalSub}>
                  {editingId ? 'Update category details and image.' : 'Create a new product category for the storefront.'}
                </p>
              </div>
              <button className={catStyles.closeBtn} onClick={() => setIsModalOpen(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className={catStyles.modalBody}>
                {/* Left: Image Upload */}
                <div className={catStyles.imageSection}>
                  <label className={catStyles.fieldLabel}>Category Image</label>
                  <div
                    className={`${catStyles.dropZone} ${dragOver ? catStyles.dropZoneActive : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('cat-img-input').click()}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className={catStyles.dropZonePreview} />
                    ) : (
                      <div className={catStyles.dropZonePlaceholder}>
                        <FontAwesomeIcon icon={faImage} style={{ fontSize: '2rem', color: '#cbd5e1', marginBottom: '8px' }} />
                        <p>Click or drag image here</p>
                        <span>PNG, JPG, WEBP — Max 5MB</span>
                      </div>
                    )}
                    {imagePreview && (
                      <div className={catStyles.dropZoneOverlay}>
                        <span>Change Image</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="cat-img-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); setFileToUpload(null); setFormData(f => ({ ...f, image: '' })); }}
                      style={{ marginTop: '8px', fontSize: '0.78rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Remove image
                    </button>
                  )}
                </div>

                {/* Right: Fields */}
                <div className={catStyles.fieldsSection}>
                  <div className={catStyles.fieldGroup}>
                    <label className={catStyles.fieldLabel}>Category Name <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      required
                      className={catStyles.fieldInput}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Biryani Masala"
                    />
                  </div>

                  <div className={catStyles.fieldGroup}>
                    <label className={catStyles.fieldLabel}>Slug <span style={{ color: '#94a3b8', fontWeight: 400 }}>(auto-generated)</span></label>
                    <input
                      className={catStyles.fieldInput}
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="biryani-masala"
                    />
                  </div>

                  <div className={catStyles.fieldGroup}>
                    <label className={catStyles.fieldLabel}>Description</label>
                    <textarea
                      className={catStyles.fieldTextarea}
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Short description shown on the category card..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div className={catStyles.fieldGroup}>
                      <label className={catStyles.fieldLabel}>Display Order</label>
                      <input
                        type="number"
                        min="0"
                        className={catStyles.fieldInput}
                        value={formData.sort_order}
                        onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                      />
                      <p className={catStyles.fieldHint}>Lower number = shown first</p>
                    </div>

                    <div className={catStyles.fieldGroup}>
                      <label className={catStyles.fieldLabel}>Visibility</label>
                      <div
                        className={`${catStyles.toggleWrap} ${formData.is_active ? catStyles.toggleOn : catStyles.toggleOff}`}
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                      >
                        <div className={catStyles.toggleThumb} />
                        <span>{formData.is_active ? 'Visible on store' : 'Hidden from store'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div style={{
                  margin: '0 24px 16px',
                  padding: '10px 14px',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}>
                  ⚠️ {formError}
                </div>
              )}

              {/* Modal Footer */}
              <div className={catStyles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsModalOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
