import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faClock, faTag, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getActiveDeals } from '@/lib/deals';
import styles from './deals.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sales & Deals | Bannu Masala',
  description:
    'Save on authentic handcrafted Bannu Masala spice blends. Limited-time offers on premium spices while stocks last.',
};

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function DealsPage() {
  const deals = await getActiveDeals();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroBanner}>
            <div className={styles.heroText}>
              <span className={styles.eyebrow}>
                <FontAwesomeIcon icon={faFire} /> Special Deals &amp; Discounts
              </span>
              <h1 className={styles.title}>Special Deals &amp; Discounts</h1>
              <p className={styles.subtitle}>
                Enjoy exciting discounts and exclusive deals on your favorite spice collections today.
              </p>
            </div>
            <div className={styles.heroImgWrap}>
              <div className={styles.dealSpotlight} />
              <img
                src="/dealimg.png"
                alt="Special Deals & Discounts - Bannu Masala"
                className={styles.dealHeroImg}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {deals.length > 0 ? (
          <div className={styles.grid}>
            {deals.map((deal) => {
              const soldOut = deal.stock !== null && Number(deal.stock) <= 0;
              const endDate = formatDate(deal.end_at);

              return (
                <article key={deal.id} className={styles.card}>
                  <Link href={`/products/${deal.product_slug}`} className={styles.imageWrap}>
                    {deal.product_image ? (
                      <img
                        src={deal.product_image}
                        alt={`${deal.product_name} - Bannu Masala deal`}
                        className={styles.image}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <FontAwesomeIcon icon={faTag} />
                      </div>
                    )}
                    <span className={styles.discountBadge}>
                      {deal.discount_percent}% OFF
                    </span>
                    {soldOut && <span className={styles.soldOut}>Sold Out</span>}
                  </Link>

                  <div className={styles.body}>
                    <h2 className={styles.name}>
                      <Link href={`/products/${deal.product_slug}`}>{deal.product_name}</Link>
                    </h2>

                    <div className={styles.dealRatingRow}>
                      <span className={styles.dealStars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            style={{
                              color:
                                deal.review_count > 0 && s <= Math.round(Number(deal.average_rating))
                                  ? '#f59e0b'
                                  : '#cbd5e1',
                            }}
                          >
                            {deal.review_count > 0 && s <= Math.round(Number(deal.average_rating)) ? '★' : '☆'}
                          </span>
                        ))}
                      </span>
                      {deal.review_count > 0 ? (
                        <>
                          <span className={styles.dealRatingScore}>{deal.average_rating}</span>
                          <span className={styles.dealRatingCount}>({deal.review_count})</span>
                        </>
                      ) : (
                        <span className={styles.dealRatingCount}>(0)</span>
                      )}
                    </div>

                    <span className={styles.variant}>{deal.variant} pack</span>

                    {endDate && (
                      <p className={styles.endsOn}>
                        <FontAwesomeIcon icon={faClock} /> Ends {endDate}
                      </p>
                    )}

                    <div className={styles.priceRow}>
                      <span className={styles.price}>
                        Rs {Number(deal.sale_price).toLocaleString()}
                      </span>
                      <span className={styles.originalPrice}>
                        Rs {Number(deal.original_price).toLocaleString()}
                      </span>
                    </div>

                    <p className={styles.saving}>
                      You save Rs{' '}
                      {Number(deal.original_price - deal.sale_price).toLocaleString()} (
                      {deal.discount_percent}%)
                    </p>

                    <Link
                      href={`/products/${deal.product_slug}`}
                      className={`${styles.cta} ${soldOut ? styles.ctaDisabled : ''}`}
                      aria-disabled={soldOut}
                    >
                      {soldOut ? 'View Product' : 'Shop This Deal'}
                      <FontAwesomeIcon icon={faArrowRight} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <FontAwesomeIcon icon={faTag} className={styles.emptyIcon} />
            <h2>No active deals right now</h2>
            <p>Our next offer is just around the corner. Browse the full collection in the meantime.</p>
            <Link href="/products" className={styles.emptyBtn}>
              Shop All Products <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
