'use client';
import { useCart } from '@/components/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

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
  const { items: cartItems, selectedKeys, subtotal: cartSubtotal, clearSelectedCart } = useCart();
  
  const [buyNowItem, setBuyNowItem] = useState(null);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [shippingConfig, setShippingConfig] = useState({ flat_rate: 200, free_threshold: 0 });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [storeWhatsapp, setStoreWhatsapp] = useState('923099907713');

  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', landmark: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        if (data?.shipping) {
          setShippingConfig({
            flat_rate: Number(data.shipping.flat_rate) || 0,
            free_threshold: Number(data.shipping.free_threshold) || 0,
          });
        }

        const methods = [...(data?.payment?.methods || [])].filter(Boolean);
        if (
          data?.payment?.cod_enabled &&
          !methods.some((method) => /cash/i.test(method))
        ) {
          methods.unshift('Cash on Delivery');
        }
        setPaymentMethods(methods);
        setPaymentMethod((current) => current || methods[0] || '');

        if (data?.store?.whatsapp) {
          setStoreWhatsapp(data.store.whatsapp);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const productId = searchParams.get('productId');
    const variant = searchParams.get('variant');
    const qty = Math.max(1, parseInt(searchParams.get('qty') || '1', 10) || 1);

    if (productId && variant) {
      setIsBuyNow(true);
      setLoadingProduct(true);
      fetch(`/api/products/${productId}`)
        .then(res => res.json())
        .then(product => {
          if (product && !product.error) {
            const deal = (product.deals || []).find((d) => d.variant === variant);
            const price = deal?.sale_price || (product.variants ? (parseInt(product.variants[variant], 10) || 0) : 0);
            if (!price) return;

            setBuyNowItem({
              id: product.id,
              name: product.name,
              variant,
              qty,
              price,
              originalPrice: deal?.original_price || null,
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
  const flatRate = Number(shippingConfig.flat_rate) || 0;
  const freeThreshold = Number(shippingConfig.free_threshold) || 0;
  const shipping = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : flatRate;
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
      ...(form.landmark ? [`Landmark: ${form.landmark}`] : []),
      ...(paymentMethod ? [`Payment Method: ${paymentMethod}`] : []),
      ``,
      `*Order Details:*`,
      ...activeItems.map(i => `• ${i.name} (${i.variant}) × ${i.qty} = Rs ${(i.price * i.qty).toLocaleString()}`),
      ``,
      `Subtotal: Rs ${subtotal.toLocaleString()}`,
      `Shipping: Rs ${shipping}`,
      `*Total: Rs ${total.toLocaleString()}*`,
    ];
    return lines.join('\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    if (activeItems.length === 0) {
      setSubmitError('Your order is empty. Please add a product before checking out.');
      return;
    }

    setSubmitting(true);

    try {
      // Save order to database
      const orderData = {
        name: form.name,
        phone: form.phone,
        city: form.city,
        address: form.address,
        landmark: form.landmark,
        payment_method: paymentMethod,
        items: activeItems.map(i => ({
          id: i.id,
          variant: i.variant,
          qty: i.qty
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.error || 'Failed to place order');

      const confirmationMessage = buildMessage();
      setOrderResult({
        ...result,
        payment_method: result.payment_method || paymentMethod,
        message: confirmationMessage,
      });
      if (!isBuyNow) clearSelectedCart();
      setSubmitting(false);

    } catch (error) {
      console.error(error);
      setSubmitError(error?.message || 'There was an error processing your order. Please try again.');
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
        <p className={styles.heroSub}>Just a few details to complete your order.</p>
      </div>

      <div className="container">
        <div className={styles.grid}>
          {/* Form or Success State */}
          <div className={`${styles.formCard} ${orderResult ? styles.formCardWide : ''}`}>
            {orderResult ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ color: 'var(--maroon)', marginBottom: '8px' }}>Order Placed Successfully!</h2>
                <p style={{ color: '#475569', marginBottom: '20px' }}>
                  Thank you, {form.name.split(' ')[0] || 'friend'}! Your order{' '}
                  <strong>#{orderResult.id}</strong> has been received. We will contact you shortly
                  to confirm delivery.
                </p>

                <div className={styles.confirmDetails}>
                  <div>
                    <span>Order Total</span>
                    <strong>Rs {Number(orderResult.total).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Payment Method</span>
                    <strong>{orderResult.payment_method || 'To be confirmed'}</strong>
                  </div>
                  <div>
                    <span>Delivering To</span>
                    <strong>{form.city}</strong>
                  </div>
                </div>

                <div className={styles.confirmActions}>
                  <Link
                    href={`/track?order=BM-${orderResult.id}&phone=${encodeURIComponent(form.phone)}`}
                    className={styles.confirmWa}
                    style={{ background: 'var(--maroon)' }}
                  >
                    Track Your Order Live
                  </Link>
                  <a
                    href={`https://wa.me/${storeWhatsapp}?text=${encodeURIComponent(orderResult.message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.confirmSecondary}
                  >
                    Send Order on WhatsApp
                  </a>
                  <Link href="/products" className={styles.confirmSecondary}>
                    Continue Shopping
                  </Link>
                </div>
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
                  <div className={styles.field}>
                    <label className={styles.label}>Landmark (optional)</label>
                    <input
                      className={styles.input}
                      name="landmark"
                      value={form.landmark}
                      onChange={handleChange}
                      placeholder="Nearby mosque, school, or shop"
                    />
                    <p className={styles.hint}>Helps the rider find your address faster.</p>
                  </div>

                  {paymentMethods.length > 0 && (
                    <div className={styles.field}>
                      <label className={styles.label}>Payment Method *</label>
                      <div className={styles.paymentOptions}>
                        {paymentMethods.map((method) => (
                          <label
                            key={method}
                            className={`${styles.paymentOption} ${
                              paymentMethod === method ? styles.paymentActive : ''
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method}
                              checked={paymentMethod === method}
                              onChange={() => setPaymentMethod(method)}
                            />
                            <span>{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethods.length === 0 && (
                    <p className={styles.note}>
                      Payment method will be confirmed when we call to confirm your order.
                    </p>
                  )}

                  {submitError && <p className={styles.submitError}>{submitError}</p>}

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
          {!orderResult && (
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
                        {item.originalPrice > item.price && (
                          <p className={styles.itemMeta} style={{ color: '#15803d', fontWeight: 600 }}>
                            Deal price applied — was Rs {Number(item.originalPrice).toLocaleString()}
                          </p>
                        )}
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
                    <span>
                      {shipping === 0 ? 'Free' : `Rs ${shipping}`}
                    </span>
                  </div>

                  {freeThreshold > 0 && subtotal < freeThreshold && (
                    <p className={styles.itemMeta} style={{ marginBottom: '8px' }}>
                      Add Rs {(freeThreshold - subtotal).toLocaleString()} more for free delivery.
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
          )}
        </div>
      </div>
    </div>
  );
}
