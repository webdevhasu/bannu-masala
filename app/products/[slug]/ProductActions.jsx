'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import styles from './page.module.css';

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function formatDealEnd(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export default function ProductActions({ product, storeWhatsapp }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const variants = product.variants
    ? Object.entries(product.variants)
        .map(([label, price]) => ({
          label,
          price: parseInt(price, 10) || 0,
        }))
        .filter((variant) => variant.price > 0)
    : [];

  const initialVariant = (() => {
    if (variants.some((v) => v.label === '250g')) return '250g';
    return variants[0]?.label || '250g';
  })();

  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState(initialVariant);

  const deals = product.deals || [];
  const selectedVariant = variants.find((v) => v.label === variant) || variants[0] || null;
  const selectedDeal = selectedVariant
    ? deals.find((deal) => deal.variant === selectedVariant.label)
    : null;
  const currentPrice = selectedDeal?.sale_price ?? selectedVariant?.price ?? 0;
  const originalPrice = selectedDeal?.original_price;
  const dealEnd = formatDealEnd(selectedDeal?.end_at);

  const stock = product.stock === null || product.stock === undefined ? null : Number(product.stock);
  const outOfStock = stock !== null && stock <= 0;
  const maxQty = stock !== null && stock > 0 ? stock : null;

  const handleAddToCart = () => {
    if (!selectedVariant || outOfStock) return;
    const pricedProduct = selectedDeal
      ? {
          ...product,
          variants: { ...product.variants, [selectedVariant.label]: currentPrice },
        }
      : product;
    addToCart(pricedProduct, selectedVariant.label, qty);
  };

  const handleBuyNow = () => {
    if (!selectedVariant || outOfStock) return;
    const params = new URLSearchParams({
      productId: String(product.id),
      variant: selectedVariant.label,
      qty: String(qty),
    });
    router.push(`/checkout?${params.toString()}`);
  };

  const waNumber = storeWhatsapp || '923099907713';
  const siteUrl = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://bannumasala.com';
  const productUrl = `${siteUrl}/products/${product.slug || product.id}`;

  return (
    <div className={styles.actionsBox}>
      <div className={styles.priceDisplay}>
        <span className={styles.priceLabel}>{selectedDeal ? 'Deal Price:' : 'Price:'}</span>
        <span className={styles.priceValue}>Rs {currentPrice.toLocaleString()}</span>
        {originalPrice > currentPrice && (
          <span className={styles.originalPrice}>Rs {originalPrice.toLocaleString()}</span>
        )}
        {selectedDeal && (
          <span className={styles.saveBadge}>Save {selectedDeal.discount_percent}%</span>
        )}
      </div>

      {dealEnd && <p className={styles.dealEnds}>Special price ends {dealEnd}</p>}

      <div className={styles.selectorGroup}>
        <label>Select Weight</label>
        <div className={styles.variants}>
          {variants.map((v) => {
            const hasDeal = deals.some((deal) => deal.variant === v.label);
            return (
              <button
                key={v.label}
                type="button"
                className={`${styles.variantBtn} ${variant === v.label ? styles.activeVariant : ''}`}
                onClick={() => setVariant(v.label)}
              >
                {v.label}
                {hasDeal && <span className={styles.dealDot} aria-label="On sale" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.selectorGroup}>
        <label>Quantity (Units)</label>
        <div className={styles.qtyControl}>
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} disabled={outOfStock}>
            -
          </button>
          <span>{qty}</span>
          <button
            type="button"
            onClick={() => setQty(maxQty ? Math.min(maxQty, qty + 1) : qty + 1)}
            disabled={outOfStock || (maxQty !== null && qty >= maxQty)}
          >
            +
          </button>
        </div>
      </div>

      {outOfStock ? (
        <p className={styles.stockNoteOut}>Out of stock — please check back soon.</p>
      ) : stock !== null && stock <= 10 ? (
        <p className={styles.stockNoteLow}>Only {stock} left in stock — order soon.</p>
      ) : stock !== null ? (
        <p className={styles.stockNote}>{stock} units available</p>
      ) : null}

      <div className={styles.btnGroup}>
        <button
          type="button"
          className={styles.addToCartBtn}
          onClick={handleAddToCart}
          disabled={outOfStock}
        >
          {outOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
        </button>
        <button
          type="button"
          className={styles.buyNowBtn}
          onClick={handleBuyNow}
          disabled={outOfStock}
        >
          {outOfStock ? 'UNAVAILABLE' : `BUY IT NOW — Rs ${(currentPrice * qty).toLocaleString()}`}
        </button>
      </div>

      {/* Direct Order on WhatsApp Button */}
      <a
        href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
          `Assalam-o-Alaikum, mujhe ${product.name} (${selectedVariant?.label || '250g'}) ke baare mein maloomat/order karna hai. Product link: ${productUrl}`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsappOrderBtn}
      >
        <WhatsAppIcon size={20} />
        Order via WhatsApp
      </a>
    </div>
  );
}
