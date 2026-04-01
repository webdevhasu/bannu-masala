'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartContext';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const router = useRouter();
  const weights = Object.keys(product.variants);
  const [selectedVariant, setSelectedVariant] = useState(weights[0]);
  const { addToCart } = useCart();

  const price = product.variants[selectedVariant];

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, true);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, false);
    router.push('/checkout');
  };

  return (
    <div className={styles.card}>
      {/* Image */}
      <div className={styles.imageWrap}>
        {product.image ? (
          <img src={product.image} alt={`Authentic ${product.name} - Bannu Masala Premium Spices`} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} style={{ background: '#7B1C1C' }}>
            <FontAwesomeIcon icon={faBox} size="3x" color="#fff" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.desc}>{product.description}</p>

        {/* Variant Selector */}
        <div className={styles.variants}>
          {weights.map(w => (
            <button
              key={w}
              className={`${styles.variant} ${selectedVariant === w ? styles.variantActive : ''}`}
              onClick={() => setSelectedVariant(w)}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>Rs {price.toLocaleString()}</span>
          <span className={styles.perUnit}>/ {selectedVariant}</span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cartBtn} onClick={handleAddToCart}>
            + Add to Cart
          </button>
          <button className={styles.buyBtn} onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
