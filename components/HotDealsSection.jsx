'use client';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faArrowRight, faClock } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './HotDealsSection.module.css';

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export default function HotDealsSection({ deals = [] }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleGrabDeal = (deal) => {
    if (!deal.product_id) {
      router.push(deal.link || '/products');
      return;
    }

    const dealProduct = {
      id: deal.product_id,
      name: deal.product_name || deal.title,
      image: deal.product_image || deal.image,
      variants: { [deal.variant]: deal.sale_price },
    };

    addToCart(dealProduct, deal.variant, 1, false);
    router.push('/checkout');
  };

  return (
    <section className={styles.section}>
      <div className={styles.dealContainer}>
        {/* Special Deals & Discounts Banner */}
        <div className={styles.dealBanner}>
          <div className={styles.bannerPattern} />

          <motion.div
            className={styles.bannerText}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className={styles.bannerBadge}>
              <FontAwesomeIcon icon={faFire} /> Special Offers
            </span>
            <h2 className={styles.bannerTitle}>Special Deals &amp; Discounts</h2>
            <p className={styles.bannerSub}>
              Enjoy exciting discounts and exclusive deals on your favorite spice collections today.
            </p>
            <Link href="/deals" className={styles.viewOffersBtn}>
              View Offers <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '8px' }} />
            </Link>
          </motion.div>

          <motion.div
            className={styles.bannerImgWrap}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className={styles.dealSpotlight} />
            <img
              src="/dealimg.png"
              alt="Special Deals & Discounts - Bannu Masala"
              className={styles.dealImg}
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* Active Deals Slider (if deals exist) */}
        {deals && deals.length > 0 && (
          <div className={styles.dealsSliderWrap}>
            <div className={styles.sliderHeader}>
              <div className={styles.sliderHeadingWrap}>
                <span className={styles.fireDot}>🔥</span>
                <h3 className={styles.sliderHeading}>Active Special Deals</h3>
              </div>
              <Link href="/deals" className={styles.viewAllLink}>
                View All Deals <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>

            <div className={styles.sliderContainer}>
              <div className={styles.slider}>
                {deals.map((deal, index) => {
                  const title = deal.product_name || deal.title;
                  const image = deal.product_image || deal.image;
                  const endDate = formatDate(deal.end_at);

                  return (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                      className={styles.card}
                    >
                      <Link
                        href={deal.product_id ? `/products/${deal.product_slug}` : deal.link || '/products'}
                        className={styles.imageContainer}
                      >
                        {image && <img src={image} alt={title} className={styles.image} />}
                        <div className={styles.badge}>{deal.discount_percent}% OFF</div>
                      </Link>

                      <div className={styles.content}>
                        <h4 className={styles.cardTitle}>{title}</h4>
                        {deal.variant && <p className={styles.variant}>{deal.variant} pack</p>}
                        {endDate && (
                          <p className={styles.endsOn}>
                            <FontAwesomeIcon icon={faClock} /> Offer ends {endDate}
                          </p>
                        )}

                        <div className={styles.priceRow}>
                          <span className={styles.price}>Rs {Number(deal.sale_price).toLocaleString()}</span>
                          {deal.original_price > 0 && (
                            <span className={styles.originalPrice}>
                              Rs {Number(deal.original_price).toLocaleString()}
                            </span>
                          )}
                        </div>

                        <button onClick={() => handleGrabDeal(deal)} className={styles.btn}>
                          Grab Deal <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: '8px' }} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
