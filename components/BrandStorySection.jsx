import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import styles from './BrandStorySection.module.css';

export default function BrandStorySection() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.imageWrap}>
          <div className={styles.imageFrame}>
            <Image
              src="/hassanirfan.jpeg"
              alt="Hassan Irfan, founder of Bannu Masala"
              fill
              sizes="(max-width: 900px) 100vw, 45vw"
              className={styles.image}
            />
          </div>
          <div className={styles.imageBadge}>
            <span>From</span>
            <strong>Bannu</strong>
            <span>KPK, Pakistan</span>
          </div>
        </div>

        <div className={styles.content}>
          <span className={styles.eyebrow}>Our Story</span>
          <h2 className={styles.title}>From the Heart of Bannu to Your Kitchen</h2>
          <p className={styles.text}>
            Bannu Masala began with a simple goal: bring back the real taste of spices ground fresh
            at home. What started in a family kitchen in Bannu, KPK, is now shared with households
            beyond Bannu.
          </p>
          <p className={styles.text}>
            Every blend is prepared in small batches using whole spices, then packed with care so it
            reaches you ready for everyday cooking.
          </p>
          <Link href="/about" className={styles.cta}>
            Learn More <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>
      </div>
    </section>
  );
}
