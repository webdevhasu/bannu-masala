'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faSearch,
  faTruck,
  faArrowUpRightFromSquare,
  faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import { STATUS_FLOW, STATUS_LABELS, formatDate, formatMoney } from '@/lib/orders';
import styles from './track.module.css';

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default function TrackClient({ initialOrder = '', initialPhone = '' }) {
  const [orderQuery, setOrderQuery] = useState(initialOrder);
  const [phoneQuery, setPhoneQuery] = useState(initialPhone);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrder = async (orderRef, phoneNum) => {
    const o = String(orderRef || '').trim();
    const p = String(phoneNum || '').trim();
    if (!o || !p) {
      setError('Please provide both Order Number and Mobile Number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `/api/orders/track?order=${encodeURIComponent(o)}&phone=${encodeURIComponent(p)}`
      );
      const data = await res.json();

      if (res.ok && data.ok && data.order) {
        setOrder(data.order);
      } else {
        setOrder(null);
        setError(data.error || 'No matching order found. Please verify details.');
      }
    } catch {
      setOrder(null);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder && initialPhone) {
      fetchOrder(initialOrder, initialPhone);
    }
  }, [initialOrder, initialPhone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderQuery, phoneQuery);
  };

  const currentStatusIndex = order ? STATUS_FLOW.indexOf(order.status) : -1;

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <span className={styles.badge}>Live Status</span>
        <h1 className={styles.title}>Track Your Order</h1>
        <p className={styles.subtitle}>
          Apna order number aur mobile number darj karke live delivery status dekhein.
        </p>
      </div>

      <div className={styles.searchCard}>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="orderRef">Order Reference</label>
              <input
                id="orderRef"
                type="text"
                placeholder="e.g. BM-187 ya 187"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phoneNum">Mobile Number</label>
              <input
                id="phoneNum"
                type="tel"
                placeholder="03XXXXXXXXX"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                className={styles.inputField}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.trackBtn}>
            <FontAwesomeIcon icon={faSearch} style={{ marginRight: '8px' }} />
            {loading ? 'Searching Order...' : 'Track My Order'}
          </button>
        </form>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {order && (
        <div className={styles.orderCard}>
          {/* Header */}
          <div className={styles.orderHeader}>
            <div>
              <div className={styles.orderRefLabel}>Order Reference</div>
              <div className={styles.orderRefNumber}>{order.orderNumber}</div>
            </div>
            <div className={styles.statusTag}>
              {STATUS_LABELS[order.status] || order.status}
            </div>
          </div>

          {/* Timeline for standard status flow */}
          {order.status !== 'cancelled' && order.status !== 'returned' && (
            <div className={styles.timelineBox}>
              <div className={styles.timelineRow}>
                {STATUS_FLOW.map((status, index) => {
                  const isPassed = index <= currentStatusIndex;
                  return (
                    <div key={status} style={{ display: 'contents' }}>
                      <div className={styles.stepItem}>
                        <div
                          className={`${styles.stepCircle} ${
                            isPassed ? styles.stepCircleActive : ''
                          }`}
                        >
                          {isPassed ? <FontAwesomeIcon icon={faCheck} /> : index + 1}
                        </div>
                        <span
                          className={`${styles.stepLabel} ${
                            isPassed ? styles.stepLabelActive : ''
                          }`}
                        >
                          {STATUS_LABELS[status]}
                        </span>
                      </div>
                      {index < STATUS_FLOW.length - 1 && (
                        <div
                          className={`${styles.stepLine} ${
                            index < currentStatusIndex ? styles.stepLineActive : ''
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Warning boxes for Cancelled / Returned */}
          {order.status === 'cancelled' && (
            <div className={`${styles.specialStatusBox} ${styles.cancelledBox}`}>
              ⚠️ Yeh order cancel ho chuka hai. Agar aapko koi maloomat chahiye to WhatsApp support se rabta karein.
            </div>
          )}

          {order.status === 'returned' && (
            <div className={`${styles.specialStatusBox} ${styles.returnedBox}`}>
              ⮌ Yeh order return process mein hai. Hamari team jald aap se rabta karegi.
            </div>
          )}

          {/* Courier Shipment live tracking */}
          {order.courierName && order.trackingNumber && (
            <div className={styles.shipmentCard}>
              <div>
                <div className={styles.shipmentInfoTitle}>
                  <FontAwesomeIcon icon={faTruck} style={{ marginRight: '6px' }} />
                  Shipment Dispatched
                </div>
                <div className={styles.shipmentInfoText}>
                  Courier: <strong>{order.courierName}</strong> &bull; Tracking ID:{' '}
                  <strong>{order.trackingNumber}</strong>
                </div>
              </div>

              {order.liveTrackingUrl && (
                <a
                  href={order.liveTrackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.liveTrackBtn}
                >
                  Live Courier Tracking
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: '0.75rem' }} />
                </a>
              )}
            </div>
          )}

          {/* Items */}
          <div className={styles.itemsBox}>
            <div className={styles.sectionHeader}>
              <FontAwesomeIcon icon={faBoxOpen} style={{ marginRight: '8px' }} />
              Ordered Items ({order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 0})
            </div>

            {order.items?.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.name} className={styles.itemImg} />
                ) : (
                  <div
                    className={styles.itemImg}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      fontSize: '0.8rem',
                    }}
                  >
                    Pack
                  </div>
                )}
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>
                    {item.slug ? (
                      <Link href={`/products/${item.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </div>
                  <div className={styles.itemMeta}>
                    Variant: <strong>{item.variant || 'Standard'}</strong> &bull; Qty: {item.quantity || 1}
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  {formatMoney(item.price * (item.quantity || 1))}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Delivering To</span>
              <strong style={{ color: '#1e293b' }}>
                {order.customerName} ({order.city})
              </strong>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery Address</span>
              <span style={{ textAlign: 'right', maxWidth: '65%' }}>
                {order.address} {order.landmark ? `(Near ${order.landmark})` : ''}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>Placed On</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Delivery Fee</span>
              <span>
                {Number(order.shipping) === 0 ? 'FREE' : formatMoney(order.shipping)}
              </span>
            </div>
            <div className={styles.summaryTotalRow}>
              <span>Total Payable</span>
              <span>
                {formatMoney(order.total)}{' '}
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                  ({order.paymentMethod})
                </span>
              </span>
            </div>
          </div>

          {/* Footer actions */}
          <div className={styles.footerActions}>
            <a
              href={`https://wa.me/923099907713?text=${encodeURIComponent(
                `Assalam-o-Alaikum, mujhe Order #${order.orderNumber} ke baare mein maloomat chahiye.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappHelpBtn}
            >
              <WhatsAppIcon size={18} />
              Need Help? WhatsApp Us
            </a>

            <Link href="/products" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Shop More Spices
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
