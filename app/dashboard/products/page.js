'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faPlus, faEdit, faTrash, faImage } from '@fortawesome/free-solid-svg-icons';
import styles from '../orders/page.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', image: '',
    price_250g: '', price_500g: '', price_1kg: ''
  });
  
  const [fileToUpload, setFileToUpload] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Bust Next.js aggressive cache to force new data
      const res = await fetch('/api/products?t=' + Date.now());
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    setFileToUpload(null);
    setImagePreview(null);
    
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description,
        image: product.image || '',
        price_250g: product.price_250g,
        price_500g: product.price_500g,
        price_1kg: product.price_1kg,
      });
      if (product.image) setImagePreview(product.image);
    } else {
      setEditingId(null);
      setFormData({
        name: '', slug: '', description: '', image: '',
        price_250g: '', price_500g: '', price_1kg: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      // Create a local blob URL for preview
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingId && !fileToUpload && !formData.image) {
      alert("Please upload a product image.");
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = formData.image;

      // Upload file if selected
      if (fileToUpload) {
        const uploadData = new FormData();
        uploadData.append('file', fileToUpload);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        
        const uploadResult = await uploadRes.json();
        if (uploadResult.status === 201) {
          finalImageUrl = uploadResult.url;
        } else {
          alert('Image upload failed.');
          setSaving(false);
          return;
        }
      }

      const payload = {
        ...formData,
        image: finalImageUrl,
        price_250g: parseInt(formData.price_250g),
        price_500g: parseInt(formData.price_500g),
        price_1kg: parseInt(formData.price_1kg),
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
    
    // Optimistic UI
    setProducts(prev => prev.filter(p => p.id !== id));
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const result = await res.json();
      
      if (!res.ok) {
        alert('Backend failed: ' + (result.error || 'Unknown error'));
        fetchProducts(); // Rollback
      } else {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    } catch (err) {
      alert('Network error');
      fetchProducts(); // Rollback
    }
  };

  if (loading) return <div>Loading products...</div>;

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

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name & Slug</th>
              <th>Prices (250g / 500g / 1kg)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  {p.image ? (
                    <img src={p.image} alt={p.name} style={{width:'50px', height:'50px', objectFit:'contain', borderRadius:'8px', background:'#f8fafc', border:'1px solid #e2e8f0'}} />
                  ) : (
                    <div style={{width:'50px', height:'50px', background:'#f8fafc', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <FontAwesomeIcon icon={faImage} color="#cbd5e1"/>
                    </div>
                  )}
                </td>
                <td>
                  <div className={styles.bold}>{p.name}</div>
                  <div className={styles.subtext}>{p.slug}</div>
                </td>
                <td>Rs {p.price_250g} / Rs {p.price_500g} / Rs {p.price_1kg}</td>
                <td className={styles.actionsCell}>
                  <button className={styles.btnEdit} onClick={() => handleOpenModal(p)}>
                    <FontAwesomeIcon icon={faEdit} style={{display:'inline', marginRight:'4px'}}/> Edit
                  </button>
                  <button className={styles.btnDanger} onClick={() => handleDeleteClick(p.id)}>
                    <FontAwesomeIcon icon={faTrash} style={{display:'inline', marginRight:'4px'}}/> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
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

      {/* Success Toast */}
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

              {/* Product Image Upload feature */}
              <div className={styles.formGroup}>
                <label className={styles.label}>Product Image</label>
                <div style={{
                  display:'flex', gap:'20px', alignItems:'center', marginTop:'12px',
                  padding: '16px', border: '2px dashed #e2e8f0', borderRadius: '12px',
                  background: '#f8fafc'
                }}>
                  {imagePreview ? (
                    <div style={{width:'100px', height:'100px', borderRadius:'10px', overflow:'hidden', background:'#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flexShrink:0}}>
                      <img src={imagePreview} alt="Preview" style={{width:'100%', height:'100%', objectFit:'contain'}} />
                    </div>
                  ) : (
                    <div style={{width:'100px', height:'100px', borderRadius:'10px', border:'2px dashed #cbd5e1', display:'flex', alignItems:'center', justifyContent:'center', background:'#fff', color: '#94a3b8'}}>
                      <FontAwesomeIcon icon={faImage} size="2x" />
                    </div>
                  )}
                  <div style={{flexGrow: 1}}>
                    <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '8px'}}>Upload a high-quality product image (PNG/JPG)</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      required={!editingId && !formData.image} 
                      className={styles.input}
                      style={{padding: '8px'}}
                    />
                  </div>
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
