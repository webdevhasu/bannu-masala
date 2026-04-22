import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className="sk" style={{ width: 170, height: 18, borderRadius: 999, marginBottom: 24 }} />

        <div className={styles.mainGrid}>
          {/* Gallery skeleton */}
          <div>
            <div className="sk" style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 16 }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <div className="sk" style={{ width: 80, height: 80, borderRadius: 12 }} />
              <div className="sk" style={{ width: 80, height: 80, borderRadius: 12 }} />
              <div className="sk" style={{ width: 80, height: 80, borderRadius: 12 }} />
            </div>
          </div>

          {/* Details skeleton */}
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div className="sk" style={{ width: 90, height: 20, borderRadius: 999 }} />
              <div className="sk" style={{ width: 90, height: 20, borderRadius: 999 }} />
            </div>

            <div className="sk" style={{ width: '80%', height: 44, borderRadius: 12, marginBottom: 14 }} />
            <div className="sk" style={{ width: 220, height: 18, borderRadius: 10, marginBottom: 22 }} />

            <div className="sk" style={{ width: '100%', height: 84, borderRadius: 12, marginBottom: 18 }} />
            <div className="sk" style={{ width: '100%', height: 210, borderRadius: 16, marginBottom: 22 }} />

            <div className="sk" style={{ width: '100%', height: 70, borderRadius: 14 }} />
          </div>
        </div>

        <div className={styles.reviewsWrapper}>
          <div className="sk" style={{ width: 240, height: 28, borderRadius: 12, margin: '0 auto 24px' }} />
          <div className="sk" style={{ width: '100%', height: 140, borderRadius: 16 }} />
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .sk {
              background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 45%, #e2e8f0 100%);
              background-size: 200% 100%;
              animation: skShimmer 1.2s ease-in-out infinite;
            }
            @keyframes skShimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `,
        }}
      />
    </div>
  );
}

