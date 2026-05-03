'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import styles from './page.module.css';

export default function ProductActions({ product }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [qty, setQty] = useState(1);
  const initialVariant = (() => {
    const labels = Object.keys(product?.variants || {});
    if (labels.includes('250g')) return '250g';
    return labels[0] || '250g';
  })();
  const [variant, setVariant] = useState(initialVariant);

  // Variants from product object (Standard + Admin Custom)
  const variants = product.variants
    ? Object.entries(product.variants).map(([label, price]) => ({
        label,
        price: parseInt(price, 10) || 0,
      }))
    : [];

  const selectedVariant = variants.find((v) => v.label === variant) || variants[0] || null;
  const currentPrice = selectedVariant?.price || 0;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart(product, selectedVariant.label, qty);
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    const params = new URLSearchParams({
      productId: String(product.id),
      variant: selectedVariant.label,
      qty: String(qty),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className={styles.actionsBox}>
      <div className={styles.priceDisplay}>
        <span className={styles.priceLabel}>Price:</span>
        <span className={styles.priceValue}>Rs {currentPrice.toLocaleString()}</span>
      </div>

      <div className={styles.selectorGroup}>
        <label>Select Weight</label>
        <div className={styles.variants}>
          {variants.map((v) => (
            <button
              key={v.label}
              type="button"
              className={`${styles.variantBtn} ${variant === v.label ? styles.activeVariant : ''}`}
              onClick={() => setVariant(v.label)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.selectorGroup}>
        <label>Quantity (Units)</label>
        <div className={styles.qtyControl}>
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))}>
            -
          </button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty(qty + 1)}>
            +
          </button>
        </div>
      </div>

      <div className={styles.btnGroup}>
        <button type="button" className={styles.addToCartBtn} onClick={handleAddToCart}>
          Add to Cart
        </button>
        <button type="button" className={styles.buyNowBtn} onClick={handleBuyNow}>
          Buy Now - Rs {(currentPrice * qty).toLocaleString()}
        </button>
      </div>
    </div>
  );
}
