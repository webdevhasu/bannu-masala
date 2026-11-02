import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faClock, faTag, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { getActiveDeals } from '@/lib/deals';
import ComboAddToCart from '@/components/ComboAddToCart';
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

function groupDeals(deals) {
  const groups = [];
  const byId = new Map();

  for (const deal of deals) {
    const key = deal.deal_id ?? deal.id;
    if (!byId.has(key)) {
      const group = {
        id: key,
        title: deal.deal_title,
        description: deal.deal_description,
        image: deal.deal_image,
        discount_percent: deal.discount_percent,
        start_at: deal.start_at,
        end_at: deal.end_at,
        items: [],
      };
      byId.set(key, group);
      groups.push(group);
    }

    const group = byId.get(key);
    group.items.push(deal);
    if (Number(deal.discount_percent) > Number(group.discount_percent || 0)) {
      group.discount_percent = deal.discount_percent;
    }
  }

  return groups;
}

export default async function DealsPage() {
  const deals = await getActiveDeals();
  const dealGroups = groupDeals(deals);

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
                Enjoy exciting discounts and exclusive combo deals on your favorite spice
                collections today.
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
        {dealGroups.length > 0 ? (
          <div className={styles.grid}>
            {dealGroups.map((group) => {
              const items = group.items;
              const first = items[0];
              const isCombo = items.length > 1;
              const soldOut = items.every(
                (item) => item.stock !== null && Number(item.stock) <= 0
              );
              const endDate = formatDate(group.end_at);
              const originalTotal = items.reduce(
                (sum, item) => sum + Number(item.original_price || 0),
                0
              );
              const saleTotal = items.reduce(
                (sum, item) => sum + Number(item.sale_price || 0),
                0
              );
              const discountPercent = Number(group.discount_percent) || 0;
              const dealHref = isCombo ? `/deals/${group.id}` : `/products/${first.product_slug}`;
              const dealImage = group.image || first.product_image;

              return (
                <article key={group.id} className={styles.card}>
                  <Link href={dealHref} className={styles.imageWrap}>
                    {dealImage ? (
                      <img
                        src={dealImage}
                        alt={`${group.title || first.product_name} - Bannu Masala deal`}
                        className={styles.image}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <FontAwesomeIcon icon={faTag} />
                      </div>
                    )}
                    <span className={styles.discountBadge}>{discountPercent}% OFF</span>
                    {isCombo && (
                      <span className={styles.comboBadge}>{items.length} Products Combo</span>
                    )}
                    {soldOut && <span className={styles.soldOut}>Sold Out</span>}
                  </Link>

                  <div className={styles.body}>
                    <h2 className={styles.name}>
                      <Link href={dealHref}>
                        {isCombo
                          ? group.title || `${items.length}-Product Combo`
                          : first.product_name}
                      </Link>
                    </h2>

                    {!isCombo && (
                      <div className={styles.dealRatingRow}>
                        <span className={styles.dealStars}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              style={{
                                color:
                                  first.review_count > 0 &&
                                  s <= Math.round(Number(first.average_rating))
                                    ? '#f59e0b'
                                    : '#cbd5e1',
                              }}
                            >
                              {first.review_count > 0 &&
                              s <= Math.round(Number(first.average_rating))
                                ? '★'
                                : '☆'}
                            </span>
                          ))}
                        </span>
                        {first.review_count > 0 ? (
                          <>
                            <span className={styles.dealRatingScore}>
                              {first.average_rating}
                            </span>
                            <span className={styles.dealRatingCount}>
                              ({first.review_count})
                            </span>
                          </>
                        ) : (
                          <span className={styles.dealRatingCount}>(0)</span>
                        )}
                      </div>
                    )}

                    {isCombo ? (
                      <ul className={styles.comboList}>
                        {items.map((item) => (
                          <li key={item.id} className={styles.comboItem}>
                            <Link href={`/products/${item.product_slug}`}>
                              {item.product_name}
                            </Link>
                            <span className={styles.comboVariant}>{item.variant}</span>
                            <span className={styles.comboPrice}>
                              Rs {Number(item.sale_price).toLocaleString()}
                              <s>Rs {Number(item.original_price).toLocaleString()}</s>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className={styles.variant}>{first.variant} pack</span>
                    )}

                    {endDate && (
                      <p className={styles.endsOn}>
                        <FontAwesomeIcon icon={faClock} /> Ends {endDate}
                      </p>
                    )}

                    <div className={styles.priceRow}>
                      <span className={styles.price}>Rs {saleTotal.toLocaleString()}</span>
                      {originalTotal > saleTotal && (
                        <span className={styles.originalPrice}>
                          Rs {originalTotal.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className={styles.saving}>
                      You save Rs{' '}
                      {(originalTotal - saleTotal).toLocaleString()} ({discountPercent}%)
                    </p>

                    {isCombo ? (
                      soldOut ? (
                        <Link href="/products" className={`${styles.cta} ${styles.ctaDisabled}`}>
                          View Products <FontAwesomeIcon icon={faArrowRight} />
                        </Link>
                      ) : (
                        <ComboAddToCart
                          deal={{
                            id: group.id,
                            title: group.title || `${items.length}-Product Combo`,
                            image: dealImage,
                            items,
                          }}
                          className={styles.cta}
                        >
                          Add Combo to Cart <FontAwesomeIcon icon={faArrowRight} />
                        </ComboAddToCart>
                      )
                    ) : (
                      <Link
                        href={`/products/${first.product_slug}`}
                        className={`${styles.cta} ${soldOut ? styles.ctaDisabled : ''}`}
                        aria-disabled={soldOut}
                      >
                        {soldOut ? 'View Product' : 'Shop This Deal'}
                        <FontAwesomeIcon icon={faArrowRight} />
                      </Link>
                    )}
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
