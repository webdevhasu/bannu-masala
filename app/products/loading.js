import ProductSkeleton from '@/components/ProductSkeleton';
import skeletonStyles from '@/components/ProductSkeleton.module.css';

export default function ProductsLoading() {
  return (
    <div style={{ minHeight: '80vh', paddingBottom: '80px', background: 'var(--bg-primary, #fffdf8)' }}>
      {/* Hero Banner Skeleton */}
      <div
        style={{
          background: 'linear-gradient(135deg, #5A1313 0%, #7B1C1C 100%)',
          padding: '60px 0 45px',
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={`${skeletonStyles.skeleton}`} style={{ width: '120px', height: '14px', marginBottom: '14px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.15)' }} />
          <div className={`${skeletonStyles.skeleton}`} style={{ width: '320px', maxWidth: '80%', height: '38px', marginBottom: '12px', background: 'rgba(255, 255, 255, 0.2)' }} />
          <div className={`${skeletonStyles.skeleton}`} style={{ width: '450px', maxWidth: '90%', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />
        </div>
      </div>

      <div className="container">
        {/* Category Pills Skeleton */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '24px' }}>
          {[90, 130, 110, 140, 120, 100].map((width, i) => (
            <div
              key={i}
              className={skeletonStyles.skeleton}
              style={{ width: `${width}px`, height: '36px', borderRadius: '50px', flexShrink: 0 }}
            />
          ))}
        </div>

        {/* Search & Sort Toolbar Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div className={skeletonStyles.skeleton} style={{ width: '280px', height: '42px', borderRadius: '10px' }} />
          <div className={skeletonStyles.skeleton} style={{ width: '160px', height: '42px', borderRadius: '10px' }} />
        </div>

        {/* Product Cards Shimmer Grid */}
        <ProductSkeleton count={8} />
      </div>
    </div>
  );
}
