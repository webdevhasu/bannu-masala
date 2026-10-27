import ProductSkeleton from '@/components/ProductSkeleton';
import skeletonStyles from '@/components/ProductSkeleton.module.css';

export default function DealsLoading() {
  return (
    <div style={{ minHeight: '80vh', paddingBottom: '80px', background: 'var(--bg-primary, #fffdf8)' }}>
      {/* Deals Hero Skeleton */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7B1C1C 0%, #5A1313 100%)',
          padding: '60px 0 45px',
          textAlign: 'center',
          marginBottom: '36px',
        }}
      >
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className={skeletonStyles.skeleton} style={{ width: '130px', height: '16px', borderRadius: '20px', marginBottom: '14px', background: 'rgba(255, 255, 255, 0.2)' }} />
          <div className={skeletonStyles.skeleton} style={{ width: '340px', maxWidth: '85%', height: '40px', marginBottom: '12px', background: 'rgba(255, 255, 255, 0.25)' }} />
          <div className={skeletonStyles.skeleton} style={{ width: '420px', maxWidth: '90%', height: '18px', background: 'rgba(255, 255, 255, 0.18)' }} />
        </div>
      </div>

      <div className="container">
        {/* Deal Cards Grid Skeleton */}
        <ProductSkeleton count={6} />
      </div>
    </div>
  );
}
