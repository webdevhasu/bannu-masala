'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import styles from './page.module.css';

export default function ProductActions({ product }) {
  const router = useRouter();
  const { addToCart, setSidebarOpen } = useCart();
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState('250g');

  const variants = [
    { label: '250g', price: product.price_250g },
    { label: '500g', price: product.price_500g },
    { label: '1kg', price: product.price_1kg },
  ];

  const currentVariant = variants.find(v => v.label === variant);

  const handleAddToCart = () => {
    addToCart(product, variant, qty);
  };

  const handleBuyNow = () => {
    // Direct checkout without affecting the global cart
    router.push(`/checkout?productId=${product.id}&variant=${variant}&qty=${qty}`);
  };

  return (
    <div className={styles.actionsBox}>
      <div className={styles.priceDisplay}>
        <span className={styles.priceLabel}>Price:</span>
        <span className={styles.priceValue}>Rs {currentVariant.price.toLocaleString()}</span>
      </div>

      <div className={styles.selectorGroup}>
        <label>Select Weight</label>
        <div className={styles.variants}>
          {variants.map(v => (
            <button
              key={v.label}
              className={`${styles.variantBtn} ${variant === v.label ? styles.activeVariant : ''}`}
              onClick={() => setVariant(v.label)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.selectorGroup}>
        <label>Quantity</label>
        <div className={styles.qtyControl}>
          <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
          <span>{qty}</span>
          <button onClick={() => setQty(qty + 1)}>+</button>
        </div>
      </div>

      <div className={styles.btnGroup}>
        <button className={styles.addToCartBtn} onClick={handleAddToCart}>
          Add to Cart
        </button>
        <button className={styles.buyNowBtn} onClick={handleBuyNow}>
          Buy Now — Rs {(currentVariant.price * qty).toLocaleString()}
        </button>
      </div>
    </div>
  );
}
