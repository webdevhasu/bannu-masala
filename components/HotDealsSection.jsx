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

export default function HotDealsSection({ deals }) {
  const { addToCart } = useCart();
  const router = useRouter();

  if (!deals || deals.length === 0) return null;

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
      <div className="container">
        <div className={styles.header}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={styles.titleWrapper}
          >
            <FontAwesomeIcon icon={faFire} className={styles.fireIcon} />
            <h2 className={styles.title}>Hot Deals</h2>
          </motion.div>
          <div className={styles.headerBottom}>
            <p className={styles.subtitle}>Limited time offers crafted just for you.</p>
            <Link href="/deals" className={styles.viewAll}>
              View All Deals <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
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
                    <h3 className={styles.cardTitle}>{title}</h3>
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
    </section>
  );
}
