'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faCartPlus, faBolt } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartContext';
import styles from './ProductCard.module.css';

function StarRating({ rating, count }) {
  const hasReviews = Number(count) > 0;
  const ratingNum = hasReviews ? Number(rating) : 5.0;
  const filled = Math.round(ratingNum);

  return (
    <div className={styles.starRow}>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={s <= filled ? styles.starFilled : styles.starEmpty}>
            ★
          </span>
        ))}
      </div>
      <span className={styles.ratingScore}>{ratingNum.toFixed(1)}</span>
      <span className={styles.reviewCount}>
        {hasReviews ? `(${count})` : '(Verified)'}
      </span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const router = useRouter();
  const weights = Object.keys(product.variants);
  const [selectedVariant, setSelectedVariant] = useState(weights[0]);
  const { addToCart } = useCart();

  const activeDeal = (product.deals || []).find((deal) => deal.variant === selectedVariant);
  const price = activeDeal?.sale_price ?? product.variants[selectedVariant];
  const originalPrice = activeDeal?.original_price;
  const outOfStock = product.stock !== null && product.stock !== undefined && Number(product.stock) <= 0;

  const ribbon = activeDeal
    ? `Save ${activeDeal.discount_percent}%`
    : product.badge || (product.is_featured ? 'Best Seller' : null);

  const handleAddToCart = () => {
    if (outOfStock) return;
    const pricedProduct = activeDeal
      ? { ...product, variants: { ...product.variants, [selectedVariant]: price } }
      : product;
    addToCart(pricedProduct, selectedVariant);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    const params = new URLSearchParams({
      productId: String(product.id),
      variant: selectedVariant,
      qty: '1',
    });
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className={styles.card}>
      {ribbon && <div className={styles.ribbon}>{ribbon}</div>}

      <Link href={`/products/${product.slug}`} className={styles.imageWrap}>
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.name} - Bannu Masala`}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <FontAwesomeIcon icon={faBox} />
          </div>
        )}
      </Link>

      <div className={styles.body}>
        <div className={styles.nameBlock}>
          <Link href={`/products/${product.slug}`}>
            <h3 className={styles.name}>{product.name}</h3>
          </Link>
          <StarRating rating={product.average_rating} count={product.review_count} />
        </div>

        {product.category_name && <p className={styles.category}>{product.category_name}</p>}
        <p className={styles.desc}>{product.description}</p>

        <div className={styles.variants}>
          {weights.map((weight) => {
            const variantDeal = (product.deals || []).find((deal) => deal.variant === weight);
            return (
              <button
                key={weight}
                className={`${styles.variant} ${selectedVariant === weight ? styles.variantActive : ''}`}
                onClick={() => setSelectedVariant(weight)}
              >
                {weight}
                {variantDeal && <span className={styles.variantSaleDot} aria-label="On sale" />}
              </button>
            );
          })}
        </div>

        <div className={styles.priceSection}>
          <span className={styles.priceLabel}>{activeDeal ? 'Deal Price' : 'Best Value'}</span>
          <div className={styles.priceRow}>
            <span className={styles.price}>Rs {Number(price).toLocaleString()}</span>
            {originalPrice && (
              <span className={styles.oldPrice}>Rs {Number(originalPrice).toLocaleString()}</span>
            )}
            <span className={styles.perUnit}>/ {selectedVariant}</span>
          </div>
        </div>

        {outOfStock && <p className={styles.outOfStock}>Out of stock</p>}

        <div className={styles.actions}>
          <button
            className={styles.cartBtn}
            onClick={handleAddToCart}
            title="Add to Cart"
            disabled={outOfStock}
          >
            <FontAwesomeIcon icon={faCartPlus} style={{ marginRight: '8px' }} />
            Add
          </button>
          <button className={styles.buyBtn} onClick={handleBuyNow} disabled={outOfStock}>
            <FontAwesomeIcon icon={faBolt} style={{ marginRight: '8px' }} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
