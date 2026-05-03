'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faMapMarkerAlt, faClock, faMoneyBillWave, faTrash, faSearch, faUndo, faTruck } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingInputs, setTrackingInputs] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?t=' + Date.now());
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id, newStatus, tracking_number = undefined) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, ...(tracking_number && {tracking_number}) } : o));

    try {
      const body = { status: newStatus };
      if (tracking_number !== undefined) body.tracking_number = tracking_number;

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) fetchOrders();
    } catch (err) {
      fetchOrders();
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this order permanently?')) return;
    setOrders(prev => prev.filter(o => o.id !== id));
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Failed to delete order');
        fetchOrders();
      }
    } catch (err) {
      alert('Error deleting order');
      fetchOrders();
    }
  };

  const handleTrackingChange = (id, val) => {
    setTrackingInputs(prev => ({ ...prev, [id]: val }));
  };

  const filteredOrders = orders.filter(o => {
    const matchTab = (o.status || 'pending') === activeTab;
    if (!matchTab) return false;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = o.customer_name?.toLowerCase().includes(q);
      const matchTracking = o.tracking_number?.toLowerCase().includes(q);
      return matchName || matchTracking;
    }
    return true;
  });

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <div className={styles.headerRow} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <h1 className={styles.pageTitle} style={{ margin: 0 }}>
          <FontAwesomeIcon icon={faShoppingCart} style={{width:'24px', marginRight:'12px'}} />
          Customer Orders
        </h1>
        
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <FontAwesomeIcon icon={faSearch} style={{ color: '#94a3b8', marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Search by name or tracking ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '250px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', overflowX: 'auto', marginTop: '16px' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ 
            background: activeTab === 'pending' ? 'var(--maroon)' : '#f1f5f9', 
            color: activeTab === 'pending' ? 'white' : '#475569',
            border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}>
          Pending
        </button>
        <button 
          onClick={() => setActiveTab('shipped')}
          style={{ 
            background: activeTab === 'shipped' ? '#3b82f6' : '#f1f5f9', 
            color: activeTab === 'shipped' ? 'white' : '#475569',
            border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}>
          Shipped
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          style={{ 
            background: activeTab === 'completed' ? '#10b981' : '#f1f5f9', 
            color: activeTab === 'completed' ? 'white' : '#475569',
            border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}>
          Completed
        </button>
        <button 
          onClick={() => setActiveTab('returned')}
          style={{ 
            background: activeTab === 'returned' ? '#f59e0b' : '#f1f5f9', 
            color: activeTab === 'returned' ? 'white' : '#475569',
            border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}>
          Returned
        </button>
      </div>

      <div className={styles.cardsGrid}>
        {filteredOrders.length === 0 ? (
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyIcon}>
              <FontAwesomeIcon icon={faShoppingCart} />
            </div>
            <h3>No {activeTab} orders found</h3>
            <p>Customer orders in the "{activeTab}" stage will appear here.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className={styles.orderCard} style={{ 
              borderTop: activeTab === 'completed' ? '4px solid #10b981' : 
                         activeTab === 'shipped' ? '4px solid #3b82f6' : 
                         activeTab === 'returned' ? '4px solid #f59e0b' : '4px solid var(--maroon)' 
            }}>
              <div className={styles.orderHeader}>
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'4px'}}>
                    <h3 className={styles.orderId} style={{margin:0}}>Order #{order.id}</h3>
                    <span className={`${styles.badge}`} style={{
                      background: activeTab === 'completed' ? '#d1fae5' : 
                                  activeTab === 'shipped' ? '#dbeafe' : 
                                  activeTab === 'returned' ? '#fef3c7' : '#ffe4e6',
                      color: activeTab === 'completed' ? '#059669' : 
                             activeTab === 'shipped' ? '#2563eb' : 
                             activeTab === 'returned' ? '#d97706' : '#e11d48',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {activeTab}
                    </span>
                  </div>
                  <p className={styles.orderDate}>
                    <FontAwesomeIcon icon={faClock} style={{marginRight: '6px'}}/>
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className={styles.orderTotal}>
                  <FontAwesomeIcon icon={faMoneyBillWave} style={{marginRight: '6px', color: '#10b981'}}/>
                  Rs {order.total.toLocaleString()}
                </div>
              </div>

              <div className={styles.customerSection}>
                <div className={styles.infoBlock}>
                  <h4 className={styles.infoLabel}>
                    <FontAwesomeIcon icon={faUser} style={{marginRight: '6px', width:'12px'}}/>
                    Customer Details
                  </h4>
                  <p className={styles.infoText}><strong>{order.customer_name}</strong></p>
                  <p className={styles.infoSubtext}>Phone: {order.phone}</p>
                </div>
                <div className={styles.infoBlock}>
                  <h4 className={styles.infoLabel}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} style={{marginRight: '6px', width:'12px'}}/>
                    Delivery Address
                  </h4>
                  <p className={styles.infoText}><strong>{order.city}</strong></p>
                  <p className={styles.infoSubtext}>{order.address}</p>
                  {order.tracking_number && (
                    <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#3b82f6', fontWeight: 'bold' }}>
                      <FontAwesomeIcon icon={faTruck} style={{marginRight: '6px'}} />
                      Tracking: {order.tracking_number}
                    </p>
                  )}
                </div>
              </div>

              <div className={styles.itemsSection}>
                <h4 className={styles.infoLabel}>Purchased Items</h4>
                <ul className={styles.itemList}>
                  {order.items.map(i => (
                    <li key={i.id} className={styles.itemRow}>
                      <span><span className={styles.itemQty}>{i.quantity}x</span> {i.product_name} <span className={styles.itemVariant}>({i.variant})</span></span>
                      <span className={styles.itemPrice}>Rs {i.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className={styles.orderFooter} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <span className={styles.shippingBadge}>
                  {order.shipping === 0 ? 'Free Shipping Applied' : `Shipping Paid: Rs ${order.shipping}`}
                </span>
                
                {activeTab === 'pending' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Tracking ID (optional)" 
                      value={trackingInputs[order.id] || ''}
                      onChange={(e) => handleTrackingChange(order.id, e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    />
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'shipped', trackingInputs[order.id] || null)}
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Mark as Shipped
                    </button>
                  </div>
                )}
                
                {activeTab === 'shipped' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'returned')}
                      style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      <FontAwesomeIcon icon={faUndo} style={{marginRight:'6px'}} /> Return
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                      style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Mark as Delivered
                    </button>
                  </div>
                )}

                {(activeTab === 'completed' || activeTab === 'returned') && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: activeTab === 'completed' ? '#10b981' : '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      {activeTab === 'completed' ? '✓ Delivered' : '⮌ Returned'}
                    </span>
                    
                    {activeTab === 'completed' && (
                      <button 
                        onClick={() => handleUpdateStatus(order.id, 'returned')}
                        style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        <FontAwesomeIcon icon={faUndo} style={{marginRight:'6px'}} /> Return
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteOrder(order.id)}
                      title="Delete Order"
                      style={{ 
                        background: 'none', 
                        border: '1px solid #ef4444', 
                        color: '#ef4444', 
                        padding: '6px 10px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '600'
                      }}>
                      <FontAwesomeIcon icon={faTrash} style={{width:'12px'}} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
