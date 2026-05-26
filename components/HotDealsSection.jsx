'use client';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './HotDealsSection.module.css';

export default function HotDealsSection({ deals }) {
  const { addToCart } = useCart();
  const router = useRouter();

  if (!deals || deals.length === 0) return null;

  const handleGrabDeal = (deal) => {
    const dealProduct = {
      id: `deal-${deal.id}`,
      name: deal.title,
      image: deal.image,
      variants: {
        'Hot Deal': deal.price
      }
    };
    // Add to cart without opening sidebar
    addToCart(dealProduct, 'Hot Deal', 1, false);
    // Go to checkout
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
          <p className={styles.subtitle}>Limited time offers crafted just for you.</p>
        </div>

        <div className={styles.sliderContainer}>
          <div className={styles.slider}>
            {deals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={styles.card}
              >
                <div className={styles.imageContainer}>
                  {deal.image && <img src={deal.image} alt={deal.title} className={styles.image} />}
                  <div className={styles.badge}>Save Big</div>
                </div>
                
                <div className={styles.content}>
                  <h3 className={styles.cardTitle}>{deal.title}</h3>
                  {deal.description && <p className={styles.description}>{deal.description}</p>}
                  
                  <div className={styles.priceRow}>
                    {deal.original_price > 0 && (
                      <span className={styles.originalPrice}>Rs {deal.original_price}</span>
                    )}
                    <span className={styles.price}>Rs {deal.price}</span>
                  </div>

                  <button onClick={() => handleGrabDeal(deal)} className={styles.btn}>
                    Grab Deal <FontAwesomeIcon icon={faArrowRight} style={{marginLeft: '8px'}} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
