'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUser, faMapMarkerAlt, faClock, faMoneyBillWave, faTrash } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('pending');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Bust Next.js cache natively for fresh data
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

  const handleUpdateStatus = async (id, newStatus) => {
    // Optimistic UI update for instant feedback
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) fetchOrders(); // Rollback if backend fails
    } catch (err) {
      fetchOrders(); // Rollback if backend fails
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this order permanently?')) return;

    // Optimistic remove
    setOrders(prev => prev.filter(o => o.id !== id));

    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Failed to delete order');
        fetchOrders(); // Rollback
      }
    } catch (err) {
      alert('Error deleting order');
      fetchOrders(); // Rollback
    }
  };

  const filteredOrders = orders.filter(o => (o.status || 'pending') === activeTab);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>
          <FontAwesomeIcon icon={faShoppingCart} style={{width:'24px', marginRight:'12px'}} />
          Customer Orders
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '16px', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ 
            background: activeTab === 'pending' ? 'var(--maroon)' : '#f1f5f9', 
            color: activeTab === 'pending' ? 'white' : '#475569',
            border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}>
          Pending Orders
        </button>
        <button 
          onClick={() => setActiveTab('shipped')}
          style={{ 
            background: activeTab === 'shipped' ? '#3b82f6' : '#f1f5f9', 
            color: activeTab === 'shipped' ? 'white' : '#475569',
            border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}>
          Shipped Orders
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          style={{ 
            background: activeTab === 'completed' ? '#10b981' : '#f1f5f9', 
            color: activeTab === 'completed' ? 'white' : '#475569',
            border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
          }}>
          Completed Orders
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
                         activeTab === 'shipped' ? '4px solid #3b82f6' : '4px solid var(--maroon)' 
            }}>
              <div className={styles.orderHeader}>
                <div>
                  <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'4px'}}>
                    <h3 className={styles.orderId} style={{margin:0}}>Order #{order.id}</h3>
                    <span className={`${styles.badge} ${
                      activeTab === 'completed' ? styles.badgeCompleted : 
                      activeTab === 'shipped' ? styles.badgeShipped : styles.badgePending
                    }`}>
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
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'shipped')}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Mark as Shipped
                  </button>
                )}
                
                {activeTab === 'shipped' && (
                  <button 
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Mark as Delivered
                  </button>
                )}

                {activeTab === 'completed' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      ✓ Delivered
                    </span>
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
