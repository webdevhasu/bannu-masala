'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faPlus, faEdit, faTrash, faImage, faTimes, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import styles from '../orders/page.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', image: '', gallery: [],
    price_250g: '', price_500g: '', price_1kg: '',
    custom_variants: [], category_id: '', ingredients: '', how_to_use: '',
    storage: '', stock: '', is_active: true, is_featured: false, badge: ''
  });
  
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?t=' + Date.now());
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  const handleOpenModal = (product = null) => {
    setFilesToUpload([]);
    setImagePreviews([]);
    
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        image: product.image || '',
        gallery: Array.isArray(product.gallery) ? product.gallery : [],
        price_250g: product.price_250g,
        price_500g: product.price_500g,
        price_1kg: product.price_1kg,
        custom_variants: product.custom_variants ? (typeof product.custom_variants === 'string' ? JSON.parse(product.custom_variants) : product.custom_variants) : [],
        category_id: product.category_id || '',
        ingredients: product.ingredients || '',
        how_to_use: product.how_to_use || '',
        storage: product.storage || '',
        stock: product.stock ?? '',
        is_active: product.is_active !== false,
        is_featured: product.is_featured === true,
        badge: product.badge || ''
      });
      // Build previews from existing db urls
      const existing = [];
      if (product.image) existing.push(product.image);
      if (product.gallery && Array.isArray(product.gallery)) existing.push(...product.gallery);
      setImagePreviews(existing);
    } else {
      setEditingId(null);
      setFormData({
        name: '', slug: '', description: '', image: '', gallery: [],
        price_250g: '', price_500g: '', price_1kg: '',
        custom_variants: [], category_id: '', ingredients: '', how_to_use: '',
        storage: '', stock: '', is_active: true, is_featured: false, badge: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // We only want up to 5 files total (including existing previews)
    // For simplicity of editing, selecting new files replaces all old images in this demo
    if (files.length > 5) {
      alert("You can only upload a maximum of 5 images.");
      return;
    }
    
    setFilesToUpload(files);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingId && filesToUpload.length === 0 && !formData.image) {
      alert("Please upload at least one product image.");
      return;
    }

    setSaving(true);
    try {
      let mainImageUrl = formData.image;
      let galleryUrls = [...formData.gallery];

      // Upload files if new files were selected
      if (filesToUpload.length > 0) {
        galleryUrls = []; // Clear existing if we are uploading new ones in this simple flow
        const uploadedUrls = [];

        for (const file of filesToUpload) {
          const uploadData = new FormData();
          uploadData.append('file', file);
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: uploadData
          });
          const uploadResult = await uploadRes.json();
          if (uploadResult.status === 201) {
            uploadedUrls.push(uploadResult.url);
          } else {
            console.error('Upload failed for a file');
          }
        }

        if (uploadedUrls.length > 0) {
          mainImageUrl = uploadedUrls[0];
          galleryUrls = uploadedUrls.slice(1);
        }
      }

      const payload = {
        ...formData,
        image: mainImageUrl,
        gallery: galleryUrls,
        price_250g: parseInt(formData.price_250g) || 0,
        price_500g: parseInt(formData.price_500g) || 0,
        price_1kg: parseInt(formData.price_1kg) || 0,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        stock: formData.stock === '' ? 0 : parseInt(formData.stock) || 0,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        ingredients: formData.ingredients,
        how_to_use: formData.how_to_use,
        storage: formData.storage,
        badge: formData.badge,
        custom_variants: formData.custom_variants.filter(v => v.label && v.price).map(v => ({...v, price: parseInt(v.price) || 0}))
      };

      if (editingId) {
        await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    setProducts(prev => prev.filter(p => p.id !== id));
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        fetchProducts(); 
      }
    } catch (err) {
      fetchProducts(); 
    }
  };

  if (loading) return <div style={{padding:'40px'}}>Loading products...</div>;

  const needle = search.trim().toLowerCase();
  const filteredProducts = needle
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          (p.category_name || '').toLowerCase().includes(needle) ||
          p.slug.toLowerCase().includes(needle)
      )
    : products;

  const customCount = (p) => {
    const variants = typeof p.custom_variants === 'string' ? JSON.parse(p.custom_variants) : p.custom_variants;
    return Array.isArray(variants) ? variants.length : 0;
  };

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>
          <FontAwesomeIcon icon={faBox} style={{width:'24px', marginRight:'12px'}} /> 
          Products Manager
        </h1>
        <button className={styles.btnPrimary} onClick={() => handleOpenModal()}>
          <FontAwesomeIcon icon={faPlus} style={{marginRight:'8px'}}/> Add Product
        </button>
      </div>

      <div style={{display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', marginBottom:'18px'}}>
        <input
          type="search"
          placeholder="Search products or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{flex:'1 1 260px', maxWidth:'380px', padding:'10px 14px', borderRadius:'10px', border:'1px solid #e2e8f0', outline:'none'}}
        />
        <span style={{fontSize:'0.85rem', color:'#64748b'}}>
          {filteredProducts.length} of {products.length} products
        </span>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '68px' }}>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Prices</th>
              <th style={{ textAlign: 'center' }}>Stock</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id}>
                {/* Image */}
                <td>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: '52px',
                        height: '52px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '52px', height: '52px', background: '#f1f5f9',
                      borderRadius: '10px', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      border: '1px solid #e2e8f0',
                    }}>
                      <FontAwesomeIcon icon={faImage} style={{ color: '#cbd5e1', fontSize: '1.1rem' }} />
                    </div>
                  )}
                </td>

                {/* Name + badges */}
                <td>
                  <div className={styles.bold}>{p.name}</div>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
                    {p.is_featured && (
                      <span style={{
                        fontSize: '0.68rem', color: '#92400e', background: '#fef3c7',
                        padding: '2px 8px', borderRadius: '20px', fontWeight: 700, border: '1px solid #fde68a'
                      }}>⭐ Featured</span>
                    )}
                    {p.is_active === false && (
                      <span style={{
                        fontSize: '0.68rem', color: '#b91c1c', background: '#fee2e2',
                        padding: '2px 8px', borderRadius: '20px', fontWeight: 700, border: '1px solid #fca5a5'
                      }}>Hidden</span>
                    )}
                    {customCount(p) > 0 && (
                      <span style={{
                        fontSize: '0.68rem', color: '#0369a1', background: '#e0f2fe',
                        padding: '2px 8px', borderRadius: '20px', fontWeight: 700, border: '1px solid #bae6fd'
                      }}>+{customCount(p)} variants</span>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td>
                  {p.category_name ? (
                    <span style={{
                      fontSize: '0.8rem', fontWeight: 600, color: '#475569',
                      background: '#f1f5f9', padding: '4px 10px',
                      borderRadius: '6px', display: 'inline-block',
                    }}>
                      {p.category_name}
                    </span>
                  ) : (
                    <span className={styles.subtext}>—</span>
                  )}
                </td>

                {/* Prices as chips */}
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {p.price_250g && (
                      <span style={{ fontSize: '0.8rem', color: '#374151', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#f3f4f6', color: '#6b7280', padding: '1px 5px', borderRadius: '4px' }}>250g</span>
                        <strong style={{ color: '#0f172a' }}>Rs {Number(p.price_250g).toLocaleString()}</strong>
                      </span>
                    )}
                    {p.price_500g && (
                      <span style={{ fontSize: '0.8rem', color: '#374151', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#f3f4f6', color: '#6b7280', padding: '1px 5px', borderRadius: '4px' }}>500g</span>
                        <strong style={{ color: '#0f172a' }}>Rs {Number(p.price_500g).toLocaleString()}</strong>
                      </span>
                    )}
                    {p.price_1kg && (
                      <span style={{ fontSize: '0.8rem', color: '#374151', display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#f3f4f6', color: '#6b7280', padding: '1px 5px', borderRadius: '4px' }}>1 kg</span>
                        <strong style={{ color: '#0f172a' }}>Rs {Number(p.price_1kg).toLocaleString()}</strong>
                      </span>
                    )}
                  </div>
                </td>

                {/* Stock */}
                <td style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: '0.82rem', fontWeight: 700,
                    color: p.stock === null ? '#475569'
                      : Number(p.stock) <= 0 ? '#b91c1c'
                      : Number(p.stock) < 10 ? '#b45309'
                      : '#047857',
                    background: p.stock === null ? '#f1f5f9'
                      : Number(p.stock) <= 0 ? '#fee2e2'
                      : Number(p.stock) < 10 ? '#fef3c7'
                      : '#d1fae5',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    display: 'inline-block',
                    minWidth: '60px',
                    textAlign: 'center',
                  }}>
                    {p.stock === null ? '∞' : `${Number(p.stock)} pcs`}
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                    <button className={styles.btnEdit} onClick={() => handleOpenModal(p)}>
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </button>
                    <button className={styles.btnDanger} onClick={() => handleDeleteClick(p.id)}>
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
            <p style={{ margin: 0, fontWeight: 600, color: '#475569' }}>No products match your search.</p>
          </div>
        )}
      </div>


      {deleteConfirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{maxWidth: '400px', textAlign: 'center'}}>
            <div style={{fontSize: '3rem', color: '#ef4444', marginBottom: '16px'}}>⚠️</div>
            <h2 className={styles.modalTitle} style={{marginBottom: '12px'}}>Are you sure?</h2>
            <p style={{color: '#64748b', marginBottom: '24px'}}>This action cannot be undone. This product will be permanently removed.</p>
            <div className={styles.modalActions} style={{justifyContent: 'center'}}>
              <button className={styles.btnSecondary} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className={styles.btnPrimary} style={{background: '#ef4444'}} onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', background: '#10b981', color: 'white',
          padding: '12px 24px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideIn 0.3s ease-out'
        }}>
          <FontAwesomeIcon icon={faCircleCheck} /> Product deleted successfully!
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleSave}>
              <div className={styles.formRow}>
                <div>
                  <label className={styles.label}>Product Name</label>
                  <input required className={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className={styles.label}>Slug (URL friendly)</label>
                  <input required className={styles.input} value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.fullWidth}>
                  <label className={styles.label}>Description</label>
                  <textarea required className={styles.textarea} rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div>
                  <label className={styles.label}>Category</label>
                  <select className={styles.input} value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={styles.label}>Stock (units)</label>
                  <input type="number" min="0" className={styles.input} value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div>
                  <label className={styles.label}>Badge (optional)</label>
                  <input className={styles.input} placeholder="e.g. Best Seller" value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} />
                </div>
                <div style={{display:'flex', alignItems:'flex-end', gap:'20px', paddingBottom:'10px'}}>
                  <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', fontWeight:600, color:'#334155', cursor:'pointer'}}>
                    <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} />
                    Featured
                  </label>
                  <label style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem', fontWeight:600, color:'#334155', cursor:'pointer'}}>
                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                    Active (visible in store)
                  </label>
                </div>
              </div>

              <div className={styles.priceGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Price 250g (Rs)</label>
                  <input required type="number" className={styles.input} value={formData.price_250g} onChange={e => setFormData({...formData, price_250g: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Price 500g (Rs)</label>
                  <input required type="number" className={styles.input} value={formData.price_500g} onChange={e => setFormData({...formData, price_500g: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Price 1kg (Rs)</label>
                  <input required type="number" className={styles.input} value={formData.price_1kg} onChange={e => setFormData({...formData, price_1kg: e.target.value})} />
                </div>
              </div>

              <div className={styles.formRow} style={{marginTop: '16px'}}>
                <div>
                  <label className={styles.label}>Ingredients</label>
                  <textarea className={styles.textarea} rows={2} placeholder="e.g. Coriander, cumin, red chilli..." value={formData.ingredients} onChange={e => setFormData({...formData, ingredients: e.target.value})} />
                </div>
                <div>
                  <label className={styles.label}>Storage Instructions</label>
                  <textarea className={styles.textarea} rows={2} placeholder="Store in a cool, dry place..." value={formData.storage} onChange={e => setFormData({...formData, storage: e.target.value})} />
                </div>
              </div>

              <div className={styles.formGroup} style={{marginTop: '16px'}}>
                <label className={styles.label}>How to Use</label>
                <textarea className={styles.textarea} rows={2} placeholder="Usage instructions for customers..." value={formData.how_to_use} onChange={e => setFormData({...formData, how_to_use: e.target.value})} />
              </div>
              
              <div className={styles.formGroup} style={{marginTop: '16px'}}>
                <label className={styles.label} style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  Custom Variants (Fixed Packages)
                  <button type="button" className={styles.btnPrimary} style={{padding: '4px 12px', fontSize: '0.8rem'}} onClick={() => setFormData({...formData, custom_variants: [...formData.custom_variants, {label: '', price: ''}]})}>
                    + Add Variant
                  </button>
                </label>
                <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'8px'}}>
                  {formData.custom_variants && formData.custom_variants.map((v, idx) => (
                    <div key={idx} style={{display:'flex', gap:'8px', alignItems:'center'}}>
                      <input placeholder="Label (e.g. 750g)" className={styles.input} value={v.label} onChange={e => {
                        const newV = [...formData.custom_variants];
                        newV[idx].label = e.target.value;
                        setFormData({...formData, custom_variants: newV});
                      }} />
                      <input placeholder="Price (Rs)" type="number" className={styles.input} value={v.price} onChange={e => {
                        const newV = [...formData.custom_variants];
                        newV[idx].price = e.target.value;
                        setFormData({...formData, custom_variants: newV});
                      }} />
                      <button type="button" style={{color:'#ef4444', padding:'8px'}} onClick={() => {
                        const newV = formData.custom_variants.filter((_, i) => i !== idx);
                        setFormData({...formData, custom_variants: newV});
                      }}>
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ))}
                  {(!formData.custom_variants || formData.custom_variants.length === 0) && <p style={{fontSize: '0.8rem', color: '#64748b', textAlign: 'center'}}>No custom variants added yet.</p>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Product Images (Max 5)</label>
                <div style={{
                  display:'flex', flexDirection: 'column', gap:'12px', marginTop:'12px',
                  padding: '16px', border: '2px dashed #e2e8f0', borderRadius: '12px',
                  background: '#f8fafc'
                }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleFileChange}
                    required={!editingId && !formData.image} 
                    className={styles.input}
                    style={{padding: '8px', background: '#fff'}}
                  />
                  <p style={{fontSize: '0.8rem', color: '#64748b'}}>Selecting new files will replace existing images. First image becomes the main cover.</p>
                  
                  {imagePreviews.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} style={{width:'60px', height:'60px', borderRadius:'8px', overflow:'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: idx === 0 ? '2px solid var(--maroon)' : '1px solid #cbd5e1', position: 'relative'}}>
                          <img src={src} alt="Preview" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                          {idx === 0 && <span style={{position:'absolute', bottom:0, left:0, right:0, background:'var(--maroon)', color:'#fff', fontSize:'0.6rem', textAlign:'center', fontWeight:600}}>MAIN</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={handleCloseModal} disabled={saving}>Cancel</button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
