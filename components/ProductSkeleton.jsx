import styles from './ProductSkeleton.module.css';

export default function ProductSkeleton({ count = 8 }) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.card}>
          {/* Image skeleton */}
          <div className={styles.imageWrap}>
            <div className={`${styles.skeleton} ${styles.image}`} />
          </div>

          {/* Content skeleton */}
          <div className={styles.content}>
            <div className={`${styles.skeleton} ${styles.tag}`} />
            <div className={`${styles.skeleton} ${styles.title}`} />
            <div className={`${styles.skeleton} ${styles.titleShort}`} />
            
            <div className={styles.ratingRow}>
              <div className={`${styles.skeleton} ${styles.stars}`} />
              <div className={`${styles.skeleton} ${styles.reviewCount}`} />
            </div>

            <div className={styles.variantRow}>
              <div className={`${styles.skeleton} ${styles.chip}`} />
              <div className={`${styles.skeleton} ${styles.chip}`} />
              <div className={`${styles.skeleton} ${styles.chip}`} />
            </div>

            <div className={styles.bottomRow}>
              <div className={`${styles.skeleton} ${styles.price}`} />
              <div className={`${styles.skeleton} ${styles.btn}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
