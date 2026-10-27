import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen,
  faUtensils,
  faCartShopping,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons';
import styles from './WhyChooseSection.module.css';

export default function WhyChooseSection() {
  const benefits = [
    {
      icon: faBoxOpen,
      title: 'Packed with Care',
      text: 'Every order is checked and packed carefully before it is dispatched.',
    },
    {
      icon: faUtensils,
      title: 'Made for Everyday Cooking',
      text: 'Blends created for the dishes you cook at home every day.',
    },
    {
      icon: faCartShopping,
      title: 'Easy Online Ordering',
      text: 'Order in a few taps, or send your order directly on WhatsApp.',
    },
    {
      icon: faReceipt,
      title: 'Clear Prices & Delivery',
      text: 'Shipping charges and your total are shown before you confirm.',
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className="section-title">Why Choose Bannu Masala?</h2>
        <p className="section-subtitle">Aapka bharosa, hamari pehchan.</p>
        <div className="gold-line" />

        <div className={styles.grid}>
          {benefits.map((benefit) => (
            <article key={benefit.title} className={styles.card}>
              <span className={styles.icon}>
                <FontAwesomeIcon icon={benefit.icon} />
              </span>
              <h3 className={styles.title}>{benefit.title}</h3>
              <p className={styles.text}>{benefit.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
