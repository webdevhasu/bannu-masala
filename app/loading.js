import skeletonStyles from '@/components/ProductSkeleton.module.css';

export default function GlobalLoading() {
  return (
    <div style={{ minHeight: '80vh', padding: '40px 0 80px', background: 'var(--bg-primary, #fffdf8)' }}>
      <div className="container">
        {/* Hero Shimmer */}
        <div
          className={skeletonStyles.skeleton}
          style={{
            width: '100%',
            height: '360px',
            borderRadius: '24px',
            marginBottom: '40px',
          }}
        />

        {/* Section Title Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div className={skeletonStyles.skeleton} style={{ width: '220px', height: '32px', marginBottom: '10px' }} />
          <div className={skeletonStyles.skeleton} style={{ width: '320px', height: '16px' }} />
        </div>

        {/* Category Pills / Cards Skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={skeletonStyles.skeleton}
              style={{ height: '140px', borderRadius: '16px' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
