'use client';

import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faUser,
  faLocationDot,
  faClock,
  faTrash,
  faSearch,
  faTruck,
  faPrint,
  faPhone,
  faArrowUpRightFromSquare,
  faBoxOpen,
  faTimes,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import {
  ORDER_STATUSES,
  STATUS_LABELS,
  formatDate,
  formatMoney,
  getCourierTrackingUrl,
  normalizeStatus,
  whatsappUpdateUrl,
} from '@/lib/orders';
import styles from './page.module.css';

function WhatsAppIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

const COURIER_PRESETS = ['TCS', 'Leopards', 'Trax', 'PostEx', 'M&P', 'CallCourier', 'Other'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState(null);

  // Dispatch modal state
  const [dispatchModalOrder, setDispatchModalOrder] = useState(null);
  const [modalCourier, setModalCourier] = useState('TCS');
  const [modalCustomCourier, setModalCustomCourier] = useState('');
  const [modalTracking, setModalTracking] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Printing state
  const [printingOrder, setPrintingOrder] = useState(null);
  const [showTips, setShowTips] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?t=' + Date.now());
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(() => {});
  }, []);

  const handleUpdateStatus = async (id, newStatus, courierName = undefined, trackingNumber = undefined) => {
    setUpdatingId(id);
    const prevOrders = [...orders];

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        return {
          ...o,
          status: newStatus,
          ...(courierName !== undefined ? { courier_name: courierName } : {}),
          ...(trackingNumber !== undefined ? { tracking_number: trackingNumber } : {}),
        };
      })
    );

    try {
      const body = { status: newStatus };
      if (courierName !== undefined) body.courier_name = courierName;
      if (trackingNumber !== undefined) body.tracking_number = trackingNumber;

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setOrders(prevOrders);
        alert('Failed to update order status');
      }
    } catch {
      setOrders(prevOrders);
      alert('Network error while updating order');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDispatchModal = (order) => {
    setDispatchModalOrder(order);
    const existingCourier = order.courier_name || 'TCS';
    if (COURIER_PRESETS.includes(existingCourier)) {
      setModalCourier(existingCourier);
      setModalCustomCourier('');
    } else {
      setModalCourier('Other');
      setModalCustomCourier(existingCourier);
    }
    setModalTracking(order.tracking_number || '');
  };

  const handleConfirmDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;
    const finalCourier = modalCourier === 'Other' ? modalCustomCourier.trim() : modalCourier;
    const finalTracking = modalTracking.trim();

    await handleUpdateStatus(
      dispatchModalOrder.id,
      'dispatched',
      finalCourier || null,
      finalTracking || null
    );
    setDispatchModalOrder(null);
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to permanently delete order #' + id + '?')) return;
    setOrders((prev) => prev.filter((o) => o.id !== id));
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        alert('Failed to delete order');
        fetchOrders();
      }
    } catch {
      alert('Error deleting order');
      fetchOrders();
    }
  };

  const handlePrintSlip = (order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
      setPrintingOrder(null);
    }, 150);
  };

  // Status Counts
  const counts = useMemo(() => {
    const map = { all: orders.length };
    ORDER_STATUSES.forEach((s) => {
      map[s] = 0;
    });
    orders.forEach((o) => {
      const norm = normalizeStatus(o.status);
      if (map[norm] !== undefined) map[norm] += 1;
    });
    return map;
  }, [orders]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const digits = q.replace(/\D/g, '');

    return orders.filter((o) => {
      const norm = normalizeStatus(o.status);
      if (activeTab !== 'all' && norm !== activeTab) return false;

      if (!q) return true;

      const matchId = String(o.id).includes(digits) || `bm-${o.id}`.includes(q);
      const matchName = o.customer_name?.toLowerCase().includes(q);
      const matchPhone = digits && String(o.phone || '').replace(/\D/g, '').includes(digits);
      const matchCity = o.city?.toLowerCase().includes(q);
      const matchTracking = o.tracking_number?.toLowerCase().includes(q);
      const matchCourier = o.courier_name?.toLowerCase().includes(q);

      return matchId || matchName || matchPhone || matchCity || matchTracking || matchCourier;
    });
  }, [orders, activeTab, searchQuery]);

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>
            <FontAwesomeIcon icon={faShoppingCart} style={{ width: '22px', marginRight: '10px', color: 'var(--maroon)' }} />
            Orders
          </h1>
          <p className={styles.pageSub}>
            Real-time orders, shipment dispatch, packing slips, and 1-click WhatsApp updates.
          </p>
        </div>

        {/* Search Bar */}
        <div className={styles.searchWrap}>
          <FontAwesomeIcon icon={faSearch} style={{ color: '#94a3b8', fontSize: '0.85rem' }} />
          <input
            type="search"
            placeholder="Search order #, customer, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Owner Helping Tips Banner */}
      <div
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span>
            <span>
              <strong>Store Owner Tip:</strong> Customer ko order confirmation, parcel dispatch (live courier tracking ke sath) aur delivery ke baad review link 1-click WhatsApp update se bhej sakte hain.
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowTips(!showTips)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '6px',
              color: 'var(--maroon)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {showTips ? '▲ Hide Workflow Steps' : '▼ View 4-Step Order Guide'}
          </button>
        </div>

        {showTips && (
          <div
            style={{
              marginTop: '14px',
              paddingTop: '14px',
              borderTop: '1px solid #e2e8f0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginBottom: '4px' }}>
                1. Order Confirm Karein
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                New order aate hi <strong>&apos;Call&apos;</strong> ya <strong>&apos;WhatsApp&apos;</strong> se address verify karein aur status <strong>&apos;Confirmed&apos;</strong> kar dein.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginBottom: '4px' }}>
                2. Pack & Print Slip
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                Masalay pack karein aur <strong>&apos;Print&apos;</strong> button daba kar packing receipt parcel par chipka dein.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginBottom: '4px' }}>
                3. Dispatch & Live Tracking
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                Courier (TCS/Leopards) ko handover karke <strong>&apos;Add Courier&apos;</strong> dabayein aur <strong>&apos;Send WhatsApp Update&apos;</strong> karein.
              </p>
            </div>

            <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginBottom: '4px' }}>
                4. Delivered & Auto Review
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                Deliver hone par status <strong>&apos;Delivered&apos;</strong> karein aur WhatsApp bhejein; customer ko product par 5-star review dene ka link chala jayega.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className={styles.tabsBar}>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
        >
          All
          <span className={styles.tabBadge}>{counts.all || 0}</span>
        </button>

        {ORDER_STATUSES.map((status) => {
          const isActive = activeTab === status;
          return (
            <button
              key={status}
              type="button"
              onClick={() => setActiveTab(status)}
              className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
            >
              {STATUS_LABELS[status]}
              <span className={styles.tabBadge}>{counts[status] || 0}</span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading orders...
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length === 0 && (
        <div className={styles.emptyStateContainer}>
          <FontAwesomeIcon icon={faShoppingCart} className={styles.emptyIcon} />
          <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>No orders found</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            {orders.length === 0
              ? 'No customer orders have been placed yet.'
              : 'No orders match this filter or search.'}
          </p>
        </div>
      )}

      <div className={styles.cardsGrid}>
        {filteredOrders.map((order) => {
          const normStatus = normalizeStatus(order.status);
          const liveTrackingUrl = getCourierTrackingUrl(order.courier_name, order.tracking_number);
          const whatsappUrl = whatsappUpdateUrl(order, normStatus, settings);
          const statusBadgeClass = styles[`status_${normStatus}`] || styles.status_pending;

          return (
            <div key={order.id} className={styles.orderCard}>
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.orderIdGroup}>
                    <h3 className={styles.orderId}>#BM-{order.id}</h3>
                  </div>
                  <div className={styles.orderDate}>
                    <FontAwesomeIcon icon={faClock} style={{ width: '11px', height: '11px' }} />
                    {formatDate(order.created_at)}
                  </div>
                </div>

                <div className={styles.priceGroup}>
                  <div className={styles.orderTotal}>{formatMoney(order.total)}</div>
                  <span className={`${styles.statusBadge} ${statusBadgeClass}`}>
                    <span className={styles.statusDot} />
                    {STATUS_LABELS[normStatus] || normStatus}
                  </span>
                </div>
              </div>

              {/* Customer & Address Details */}
              <div className={styles.customerSection}>
                <div className={styles.infoBlock}>
                  <div className={styles.blockLabel}>
                    <FontAwesomeIcon icon={faUser} style={{ width: '10px' }} />
                    Customer Details
                  </div>
                  <span className={styles.customerName}>{order.customer_name}</span>
                  <a href={`tel:${order.phone}`} className={styles.customerPhone}>
                    {order.phone}
                  </a>
                  <span className={styles.paymentTag}>
                    ● {order.payment_method || 'Cash on Delivery'}
                  </span>
                </div>

                <div className={styles.infoBlock}>
                  <div className={styles.blockLabel}>
                    <FontAwesomeIcon icon={faLocationDot} style={{ width: '10px' }} />
                    Delivery Destination
                  </div>
                  <span className={styles.cityName}>{order.city}</span>
                  <p className={styles.addressText}>{order.address}</p>
                  {order.landmark && (
                    <span className={styles.landmarkBadge}>Near {order.landmark}</span>
                  )}
                </div>
              </div>

              {/* Courier Shipment Box if Available */}
              {order.courier_name && order.tracking_number && (
                <div className={styles.shipmentStrip}>
                  <div>
                    <span className={styles.courierTag}>{order.courier_name}</span>
                    <span className={styles.trackingCode}>{order.tracking_number}</span>
                  </div>
                  {liveTrackingUrl && (
                    <a
                      href={liveTrackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.liveTrackLink}
                    >
                      Live Tracking
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: '0.7rem' }} />
                    </a>
                  )}
                </div>
              )}

              {/* Purchased Items */}
              <div className={styles.itemsSection}>
                <div className={styles.itemsHeader}>
                  <span>
                    <FontAwesomeIcon icon={faBoxOpen} style={{ marginRight: '6px' }} />
                    Ordered Items
                  </span>
                  <span>({order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0})</span>
                </div>

                <ul className={styles.itemsList}>
                  {order.items?.map((item, idx) => (
                    <li key={item.id || idx} className={styles.itemRow}>
                      <div className={styles.itemMain}>
                        <span className={styles.qtyBadge}>{item.quantity || 1}×</span>
                        <span className={styles.itemName}>
                          {item.product_name || item.name}
                          <span className={styles.itemVariant}>({item.variant || 'Standard'})</span>
                        </span>
                      </div>
                      <span className={styles.itemPrice}>
                        {formatMoney(item.price * (item.quantity || 1))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Actions Toolbar */}
              <div className={styles.cardActions}>
                {/* Status select + Edit Courier */}
                <div className={styles.statusRow}>
                  <div className={styles.statusSelectWrap}>
                    <span className={styles.statusLabel}>Status:</span>
                    <select
                      value={normStatus}
                      disabled={updatingId === order.id}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'dispatched') {
                          openDispatchModal(order);
                        } else {
                          handleUpdateStatus(order.id, val);
                        }
                      }}
                      className={styles.statusSelect}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => openDispatchModal(order)}
                    className={styles.btnCourier}
                  >
                    <FontAwesomeIcon icon={faTruck} style={{ fontSize: '0.8rem' }} />
                    {order.tracking_number ? 'Edit Courier' : 'Add Courier'}
                  </button>
                </div>

                {/* Primary Action Buttons */}
                <div className={styles.buttonsRow}>
                  {/* WhatsApp Customer Update Button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnWhatsApp}
                  >
                    <WhatsAppIcon size={16} />
                    Send WhatsApp Update
                  </a>

                  {/* Print Slip Button */}
                  <button
                    type="button"
                    onClick={() => handlePrintSlip(order)}
                    className={styles.btnGhost}
                    title="Print Packing Slip"
                  >
                    <FontAwesomeIcon icon={faPrint} />
                    Print
                  </button>

                  {/* Call Customer Button */}
                  <a
                    href={`tel:${String(order.phone).replace(/\s+/g, '')}`}
                    className={styles.btnGhost}
                    title="Call Customer"
                  >
                    <FontAwesomeIcon icon={faPhone} />
                    Call
                  </a>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(order.id)}
                    className={styles.btnDelete}
                    title="Delete Order"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch & Courier Modal */}
      {dispatchModalOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: '1.15rem', fontWeight: 800 }}>
                <FontAwesomeIcon icon={faTruck} style={{ marginRight: '8px', color: 'var(--maroon)' }} />
                Dispatch Order #BM-{dispatchModalOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                  Courier Service:
                </label>
                <select
                  value={modalCourier}
                  onChange={(e) => setModalCourier(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                    background: '#ffffff',
                  }}
                >
                  {COURIER_PRESETS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {modalCourier === 'Other' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                    Enter Courier Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swyft, Rider, etc."
                    value={modalCustomCourier}
                    onChange={(e) => setModalCustomCourier(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      color: '#0f172a',
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
                  Tracking ID / Consignment Number:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 772819281"
                  value={modalTracking}
                  onChange={(e) => setModalTracking(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    color: '#0f172a',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: '#475569',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === dispatchModalOrder.id}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--maroon)',
                    color: 'white',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  <FontAwesomeIcon icon={faCheck} style={{ marginRight: '6px' }} />
                  Save & Mark Dispatched
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Packing Slip Dialog for Thermal / A4 */}
      {printingOrder && (
        <div id="printable-order-slip" style={{ display: 'none' }}>
          <div
            style={{
              padding: '24px',
              fontFamily: 'sans-serif',
              maxWidth: '480px',
              margin: '0 auto',
              color: '#000000',
            }}
          >
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '12px' }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '1.4rem', textTransform: 'uppercase' }}>
                Bannu Masala
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Authentic Flavors from Bannu, KPK</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.85rem' }}>
                Helpline: {settings?.store?.phone || '+92 309 9907713'}
              </p>
            </div>

            <div style={{ padding: '12px 0', borderBottom: '1px solid #ccc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <strong>Order #: BM-{printingOrder.id}</strong>
                <span>{formatDate(printingOrder.created_at)}</span>
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.9rem' }}>
                <strong>Customer:</strong> {printingOrder.customer_name}
                <br />
                <strong>Phone:</strong> {printingOrder.phone}
                <br />
                <strong>City:</strong> {printingOrder.city}
                <br />
                <strong>Address:</strong> {printingOrder.address}{' '}
                {printingOrder.landmark ? `(Near: ${printingOrder.landmark})` : ''}
              </div>
            </div>

            {printingOrder.courier_name && printingOrder.tracking_number && (
              <div style={{ padding: '8px 0', borderBottom: '1px solid #ccc', fontSize: '0.85rem' }}>
                <strong>Courier:</strong> {printingOrder.courier_name} &bull;{' '}
                <strong>Tracking ID:</strong> {printingOrder.tracking_number}
              </div>
            )}

            <div style={{ padding: '12px 0', borderBottom: '2px dashed #000' }}>
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem', marginBottom: '8px' }}>
                PACKED ITEMS:
              </div>
              {printingOrder.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    marginBottom: '4px',
                  }}
                >
                  <span>
                    {item.quantity}x {item.product_name || item.name} ({item.variant || 'Standard'})
                  </span>
                  <span>{formatMoney(item.price * item.quantity)}</span>
                </div>
              ))}

              <div
                style={{
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid #eee',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{formatMoney(printingOrder.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Charges:</span>
                  <span>
                    {Number(printingOrder.shipping) === 0 ? 'FREE' : formatMoney(printingOrder.shipping)}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                paddingTop: '12px',
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
              }}
            >
              COLLECT CASH: {formatMoney(printingOrder.total)}
              <div style={{ fontSize: '0.8rem', fontWeight: 'normal', marginTop: '4px' }}>
                ({printingOrder.payment_method || 'Cash on Delivery'})
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '16px', color: '#666' }}>
              Thank you for choosing Bannu Masala!
            </div>
          </div>
        </div>
      )}

      {/* Print CSS to isolate slip during print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-order-slip,
          #printable-order-slip * {
            visibility: visible !important;
            display: block !important;
          }
          #printable-order-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
