'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faPlus, faEdit, faTrash, faImage, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import styles from '../orders/page.module.css';

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', image: '', link: '', price: '', original_price: '', is_active: true
  });
  
  const [fileToUpload, setFileToUpload] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleOpenModal = (deal = null) => {
    setFileToUpload(null);
    setImagePreview('');
    
    if (deal) {
      setEditingId(deal.id);
      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        image: deal.image || '',
        link: deal.link || '',
        price: deal.price || '',
        original_price: deal.original_price || '',
        is_active: deal.is_active
      });
      if (deal.image) {
        setImagePreview(deal.image);
      }
    } else {
      setEditingId(null);
      setFormData({
        title: '', description: '', image: '', link: '', price: '', original_price: '', is_active: true
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
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingId && !fileToUpload && !formData.image) {
      alert("Please upload an image for the deal.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.image;

      if (fileToUpload) {
        const uploadData = new FormData();
        uploadData.append('file', fileToUpload);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadData
        });
        const uploadResult = await uploadRes.json();
        if (uploadResult.status === 201) {
          imageUrl = uploadResult.url;
        } else {
          alert('Upload failed');
          setSaving(false);
          return;
        }
      }

      const payload = {
        ...formData,
        image: imageUrl,
        price: parseInt(formData.price) || 0,
        original_price: parseInt(formData.original_price) || 0,
      };

      if (editingId) {
        await fetch(`/api/deals/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/deals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchDeals();
    } catch (err) {
      alert('Error saving deal');
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
    setDeals(prev => prev.filter(d => d.id !== id));
    
    try {
      const res = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } else {
        fetchDeals(); 
      }
    } catch (err) {
      fetchDeals(); 
    }
  };

  if (loading) return <div style={{padding:'40px'}}>Loading deals...</div>;

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>
          <FontAwesomeIcon icon={faFire} style={{width:'24px', marginRight:'12px'}} /> 
          Hot Deals Manager
        </h1>
        <button className={styles.btnPrimary} onClick={() => handleOpenModal()}>
          <FontAwesomeIcon icon={faPlus} style={{marginRight:'8px'}}/> Add Deal
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Pricing</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(d => (
              <tr key={d.id}>
                <td>
                  {d.image ? (
                    <img src={d.image} alt={d.title} style={{width:'80px', height:'50px', objectFit:'cover', borderRadius:'8px', background:'#f8fafc', border:'1px solid #e2e8f0'}} />
                  ) : (
                    <div style={{width:'80px', height:'50px', background:'#f8fafc', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <FontAwesomeIcon icon={faImage} color="#cbd5e1"/>
                    </div>
                  )}
                </td>
                <td>
                  <div className={styles.bold}>{d.title}</div>
                  <div className={styles.subtext}>{d.link || 'No link'}</div>
                </td>
                <td>
                  Rs {d.price} 
                  {d.original_price > 0 && <span style={{textDecoration:'line-through', color:'#94a3b8', marginLeft:'8px'}}>Rs {d.original_price}</span>}
                </td>
                <td>
                  <span style={{
                    fontSize:'0.85rem', padding:'4px 8px', borderRadius:'12px',
                    color: d.is_active ? '#15803d' : '#94a3b8',
                    background: d.is_active ? '#dcfce7' : '#f1f5f9'
                  }}>
                    {d.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className={styles.actionsCell}>
                  <button className={styles.btnEdit} onClick={() => handleOpenModal(d)}>
                    <FontAwesomeIcon icon={faEdit} style={{display:'inline', marginRight:'4px'}}/> Edit
                  </button>
                  <button className={styles.btnDanger} onClick={() => handleDeleteClick(d.id)}>
                    <FontAwesomeIcon icon={faTrash} style={{display:'inline', marginRight:'4px'}}/> Delete
                  </button>
                </td>
              </tr>
            ))}
            {deals.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#64748b'}}>No hot deals found. Add your first deal!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirmId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{maxWidth: '400px', textAlign: 'center'}}>
            <div style={{fontSize: '3rem', color: '#ef4444', marginBottom: '16px'}}>⚠️</div>
            <h2 className={styles.modalTitle} style={{marginBottom: '12px'}}>Are you sure?</h2>
            <p style={{color: '#64748b', marginBottom: '24px'}}>This action cannot be undone. This deal will be removed from the homepage.</p>
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
                  <label className={styles.label}>Deal Title</label>
                  <input required className={styles.input} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Ramadan Special Discount" />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.fullWidth}>
                  <label className={styles.label}>Description (Optional)</label>
                  <textarea className={styles.textarea} rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief details about the deal..." />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.fullWidth}>
                  <label className={styles.label}>Link (URL)</label>
                  <input className={styles.input} value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="e.g. /products/mix-masala" />
                </div>
              </div>

              <div className={styles.priceGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Discounted Price (Rs)</label>
                  <input required type="number" className={styles.input} value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Original Price (Rs) - Optional</label>
                  <input type="number" className={styles.input} value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} />
                </div>
              </div>

              <div className={styles.formGroup} style={{marginTop: '16px'}}>
                <label style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer'}}>
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} style={{width:'18px', height:'18px'}} />
                  <span style={{fontWeight:600, color:'#334155'}}>Active on Homepage</span>
                </label>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Deal Banner/Image</label>
                <div style={{
                  display:'flex', flexDirection: 'column', gap:'12px', marginTop:'12px',
                  padding: '16px', border: '2px dashed #e2e8f0', borderRadius: '12px',
                  background: '#f8fafc'
                }}>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    required={!editingId && !formData.image} 
                    className={styles.input}
                    style={{padding: '8px', background: '#fff'}}
                  />
                  
                  {imagePreview && (
                    <div style={{width:'160px', height:'100px', borderRadius:'8px', overflow:'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #cbd5e1'}}>
                      <img src={imagePreview} alt="Preview" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={handleCloseModal} disabled={saving}>Cancel</button>
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
