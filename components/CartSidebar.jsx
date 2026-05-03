'use client';
import { useCart } from './CartContext';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faBox } from '@fortawesome/free-solid-svg-icons';
import styles from './CartSidebar.module.css';

export default function CartSidebar() {
  const { items, selectedKeys, toggleSelection, removeFromCart, updateQty, subtotal, shipping, total, itemCount, sidebarOpen, setSidebarOpen } = useCart();

  const freeShippingTarget = 3000;
  const progress = Math.min((subtotal / freeShippingTarget) * 100, 100);
  const remaining = freeShippingTarget - subtotal;

  return (
    <>
      <div
        className={`${styles.overlay} ${sidebarOpen ? styles.overlayVisible : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your Cart ({itemCount})</h2>
          <button className={styles.closeBtn} onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        {/* Free Shipping Progress */}
        {subtotal > 0 && (
          <div className={styles.shippingProgress}>
            <p className={styles.shippingText}>
              {shipping === 0
                ? '🎉 You have FREE SHIPPING!'
                : `Rs ${remaining.toLocaleString()} more for FREE Shipping`}
            </p>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <FontAwesomeIcon icon={faShoppingCart} size="3x" color="#ccc" />
              <p>Your cart is empty</p>
              <button className={styles.shopBtn} onClick={() => setSidebarOpen(false)}>Start Shopping</button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.key} className={`${styles.item} ${!selectedKeys.includes(item.key) ? styles.itemUnselected : ''}`}>
                <div className={styles.checkboxWrapper}>
                  <input 
                    type="checkbox" 
                    checked={selectedKeys.includes(item.key)} 
                    onChange={() => toggleSelection(item.key)} 
                    className={styles.checkbox}
                  />
                </div>
                <div className={styles.itemImage} style={{ background: '#7B1C1C' }}>
                  {item.image && <img src={item.image} alt={item.name} />}
                  {!item.image && <FontAwesomeIcon icon={faBox} size="2x" color="#fff" />}
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemVariant}>{item.variant}</p>
                  <p className={styles.itemPrice}>Rs {(item.price * item.qty).toLocaleString()}</p>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.qtyControl}>
                    <button onClick={() => updateQty(item.key, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.key, item.qty + 1)}>+</button>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.key)}>🗑</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>Rs {subtotal.toLocaleString()}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? 'green' : 'inherit' }}>
                  {shipping === 0 ? 'FREE' : `Rs ${shipping}`}
                </span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>Rs {total.toLocaleString()}</span>
              </div>
            </div>
            <Link 
              href={selectedKeys.length === 0 ? '#' : '/checkout'} 
              onClick={(e) => {
                if (selectedKeys.length === 0) {
                  e.preventDefault();
                  alert('Please select at least one item to checkout.');
                } else {
                  setSidebarOpen(false);
                }
              }}
            >
              <button className={styles.checkoutBtn} disabled={selectedKeys.length === 0}>
                {selectedKeys.length === 0 ? 'Select items to Checkout' : 'Proceed to Checkout →'}
              </button>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
