'use client';
import { useCart } from '@/components/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const WHATSAPP_NUMBER = '923099907713';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: cartItems, selectedKeys, subtotal: cartSubtotal, shipping: cartShipping, total: cartTotal, clearSelectedCart } = useCart();
  
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    const productId = searchParams.get('productId');
    const variant = searchParams.get('variant');
    const qty = parseInt(searchParams.get('qty') || '1');

    if (productId && variant) {
      setIsBuyNow(true);
      setLoadingProduct(true);
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(product => {
          if (product && !product.error) {
            // Map consistent with cart item structure
            const price = product[`price_${variant}`] || 0;
            setBuyNowItem({
              id: product.id,
              name: product.name,
              variant,
              qty,
              price,
              image: product.image,
              key: `buy-now-${product.id}`
            });
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoadingProduct(false));
    }
  }, [searchParams]);

  const activeItems = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : cartItems.filter(i => selectedKeys?.includes(i.key));
  const subtotal = isBuyNow ? (buyNowItem ? buyNowItem.price * buyNowItem.qty : 0) : cartSubtotal;
  const shipping = subtotal >= 3000 ? 0 : (subtotal > 0 ? 250 : 0);
  const total = subtotal + shipping;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || !/^[\d\s\+\-]{10,15}$/.test(form.phone.trim())) e.phone = 'Valid phone number required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(err => ({ ...err, [e.target.name]: '' }));
  };

  const buildMessage = () => {
    const lines = [
      `*New Order from Bannu Masala Website*`,
      ``,
      `*Customer Info:*`,
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `City: ${form.city}`,
      `Address: ${form.address}`,
      ``,
      `*Order Details:*`,
      ...activeItems.map(i => `• ${i.name} (${i.variant}) × ${i.qty} = Rs ${(i.price * i.qty).toLocaleString()}`),
      ``,
      `Subtotal: Rs ${subtotal.toLocaleString()}`,
      `Shipping: ${shipping === 0 ? 'FREE' : `Rs ${shipping}`}`,
      `*Total: Rs ${total.toLocaleString()}*`,
    ];
    return lines.join('\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (activeItems.length === 0) { alert('Your order is empty!'); return; }

    setSubmitting(true);
    
    try {
      // Save order to database
      const orderData = {
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        subtotal,
        shipping,
        total,
        shipping,
        total,
        items: activeItems.map(i => ({
          id: i.id,
          name: i.name,
          variant: i.variant,
          qty: i.qty,
          price: i.price
        }))
      };

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      // Show success state instead of WhatsApp redirect
      if (!isBuyNow) clearSelectedCart();
      setSubmitting(false);
      setOrderPlaced(true);

    } catch (error) {
      console.error(error);
      alert('There was an error processing your order. Please try again.');
      setSubmitting(false);
    }
  };

  if (isBuyNow && loadingProduct) {
    return (
      <div className={styles.wrapper}>
        <div className="container" style={{padding: '100px 0', textAlign: 'center'}}>
          <p>Loading your product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.pageHero}>
        <h1 className={styles.heroTitle}>Checkout</h1>
        <p className={styles.heroSub}>Just a few details and your order is on its way!</p>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {/* Form or Success State */}
          <div className={styles.formCard}>
            {orderPlaced ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ color: 'var(--maroon)', marginBottom: '8px' }}>Order Placed Successfully!</h2>
                <p style={{ color: '#475569', marginBottom: '24px' }}>Thank you for your order. We will contact you shortly to confirm delivery.</p>
                <Link href="/#products" className={styles.submitBtn} style={{ display: 'inline-block', textDecoration: 'none', width: 'auto', padding: '12px 32px' }}>
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <>
                <h2 className={styles.sectionHead}>Delivery Information</h2>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.field}>
                    <label className={styles.label}>Full Name *</label>
                    <input
                      className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Muhammad Ali"
                      autoComplete="name"
                    />
                    {errors.name && <p className={styles.error}>{errors.name}</p>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone Number *</label>
                    <input
                      className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0300 1234567"
                      type="tel"
                      autoComplete="tel"
                    />
                    {errors.phone && <p className={styles.error}>{errors.phone}</p>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>City *</label>
                    <input
                      className={`${styles.input} ${errors.city ? styles.inputError : ''}`}
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Lahore, Karachi, Peshawar..."
                      autoComplete="address-level2"
                    />
                    {errors.city && <p className={styles.error}>{errors.city}</p>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Full Address *</label>
                    <textarea
                      className={`${styles.textarea} ${errors.address ? styles.inputError : ''}`}
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House No, Street, Area..."
                      rows={3}
                      autoComplete="street-address"
                    />
                    {errors.address && <p className={styles.error}>{errors.address}</p>}
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? 'Confirming...' : 'Confirm Order'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className={styles.summary}>
            <h2 className={styles.sectionHead}>Order Summary {isBuyNow && <span style={{fontSize:'0.8rem', color: 'var(--maroon)'}}>(Direct Buy)</span>}</h2>
            {activeItems.length === 0 ? (
              <div className={styles.emptyCart}>
                <p>🛒 {isBuyNow ? 'Product could not be loaded' : 'Your cart is empty'}</p>
                <Link href="/products" className={styles.shopLink}>← Browse Products</Link>
              </div>
            ) : (
              <>
                <div className={styles.items}>
                  {activeItems.map(item => (
                    <div key={item.key} className={styles.item}>
                      <div className={styles.itemImg}>
                        {item.image ? <img src={item.image} alt={item.name} /> : '🌶️'}
                      </div>
                      <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemMeta}>{item.variant} × {item.qty}</p>
                      </div>
                      <p className={styles.itemPrice}>Rs {(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className={styles.totals}>
                  <div className={styles.row}>
                    <span>Subtotal</span>
                    <span>Rs {subtotal.toLocaleString()}</span>
                  </div>
                  <div className={styles.row}>
                    <span>Shipping</span>
                    <span className={shipping === 0 ? styles.freeShipping : ''}>
                      {shipping === 0 ? '🎉 FREE' : `Rs ${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className={styles.shippingNote}>
                      Add Rs {(3000 - subtotal).toLocaleString()} more for free shipping!
                    </p>
                  )}
                  <div className={`${styles.row} ${styles.totalRow}`}>
                    <span>Total</span>
                    <span>Rs {total.toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
