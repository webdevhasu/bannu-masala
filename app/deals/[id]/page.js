import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faClock,
  faFire,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { getActiveDealById } from '@/lib/deals';
import ComboAddToCart from '@/components/ComboAddToCart';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const deal = await getActiveDealById(id);

  if (!deal) return { title: 'Deal Not Found | Bannu Masala' };

  return {
    title: `${deal.title} | Bannu Masala`,
    description: deal.description,
  };
}

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function DealDetailsPage({ params }) {
  const { id } = await params;
  const deal = await getActiveDealById(id);

  if (!deal) notFound();

  const items = deal.items;
  const first = items[0];
  const isCombo = items.length > 1;
  const image = deal.image || first.product_image;
  const endDate = formatDate(deal.end_at);
  const soldOut = items.every((item) => item.stock !== null && Number(item.stock) <= 0);

  const originalTotal = items.reduce(
    (sum, item) => sum + Number(item.original_price || 0),
    0
  );
  const saleTotal = items.reduce((sum, item) => sum + Number(item.sale_price || 0), 0);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <Link href="/deals" className={styles.back}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to Deals
          </Link>
          <span className={styles.eyebrow}>
            <FontAwesomeIcon icon={faFire} />{' '}
            {isCombo ? `${items.length}-Product Combo Deal` : 'Special Offer'}
          </span>
          <h1 className={styles.title}>{deal.title}</h1>
          {deal.description && <p className={styles.subtitle}>{deal.description}</p>}
          <div className={styles.heroMeta}>
            <span className={styles.discountBadge}>{deal.discount_percent}% OFF</span>
            {deal.free_delivery && (
              <span className={styles.freeDeliveryBadge}>Free Delivery</span>
            )}
            {endDate && (
              <span className={styles.ends}>
                <FontAwesomeIcon icon={faClock} /> Ends {endDate}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.media}>
            {image ? (
              <img src={image} alt={deal.title} />
            ) : (
              <div className={styles.mediaPlaceholder}>
                <FontAwesomeIcon icon={faTag} />
              </div>
            )}
          </div>

          <div className={styles.summary}>
            <span className={styles.summaryLabel}>Deal Price</span>
            <div className={styles.priceRow}>
              <span className={styles.price}>Rs {saleTotal.toLocaleString()}</span>
              {originalTotal > saleTotal && (
                <span className={styles.originalPrice}>
                  Rs {originalTotal.toLocaleString()}
                </span>
              )}
            </div>
            <p className={styles.saving}>
              You save Rs {(originalTotal - saleTotal).toLocaleString()} (
              {deal.discount_percent}%)
            </p>

            <h2 className={styles.itemsTitle}>
              {isCombo ? `Included in this combo` : 'Product in this deal'}
            </h2>

            <div className={styles.items}>
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/products/${item.product_slug}`}
                  className={styles.item}
                >
                  <div className={styles.itemImg}>
                    {item.product_image ? (
                      <img src={item.product_image} alt={item.product_name} />
                    ) : (
                      <FontAwesomeIcon icon={faTag} />
                    )}
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.product_name}</span>
                    <span className={styles.itemMeta}>{item.variant} pack</span>
                  </div>
                  <div className={styles.itemPrice}>
                    <span>Rs {Number(item.sale_price).toLocaleString()}</span>
                    <s>Rs {Number(item.original_price).toLocaleString()}</s>
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.actions}>
              {soldOut ? (
                <Link href="/products" className={`${styles.cta} ${styles.ctaDisabled}`}>
                  View All Products <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              ) : (
                <ComboAddToCart deal={deal} className={styles.cta}>
                  {isCombo ? 'Add Combo to Cart' : 'Add Deal to Cart'}
                  <FontAwesomeIcon icon={faArrowRight} />
                </ComboAddToCart>
              )}

              <Link href={`/products/${first.product_slug}`} className={styles.secondaryCta}>
                View {isCombo ? 'First' : ''} Product
              </Link>
            </div>

            <p className={styles.note}>
              {deal.free_delivery ? 'Free delivery included with this deal. ' : ''}
              Discounted prices apply automatically to every product included in this deal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
