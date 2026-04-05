'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faStar, faCartPlus, faBolt } from '@fortawesome/free-solid-svg-icons';
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
    router.push(`/checkout?productId=${product.id}&variant=${selectedVariant}&qty=1`);
  };

  const isSpecial = product.id % 4 === 0;

  return (
    <div className={styles.card}>
      {isSpecial && <div className={styles.ribbon}>Chef's Choice</div>}
      
      {/* Image Container with Framing */}
      <Link href={`/products/${product.slug}`} className={styles.imageWrap}>
        {product.image ? (
          <img 
            src={product.image} 
            alt={`Authentic ${product.name} - Bannu Masala Premium Spices`} 
            className={styles.image} 
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <FontAwesomeIcon icon={faBox} />
          </div>
        )}
      </Link>

      {/* Info Body */}
      <div className={styles.body}>
        <div className={styles.headerRow}>
          <Link href={`/products/${product.slug}`}>
            <h3 className={styles.name}>{product.name}</h3>
          </Link>
          <div className={styles.rating}>
            <FontAwesomeIcon icon={faStar} />
            <span>{product.average_rating || 0}</span>
          </div>
        </div>
        
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

        {/* Price Section */}
        <div className={styles.priceSection}>
          <span className={styles.priceLabel}>Best Value</span>
          <div className={styles.priceRow}>
            <span className={styles.price}>Rs {price.toLocaleString()}</span>
            <span className={styles.perUnit}>/ {selectedVariant}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.cartBtn} onClick={handleAddToCart} title="Add to Cart">
             <FontAwesomeIcon icon={faCartPlus} style={{marginRight: '8px'}} />
             Add
          </button>
          <button className={styles.buyBtn} onClick={handleBuyNow}>
            <FontAwesomeIcon icon={faBolt} style={{marginRight: '8px'}} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
