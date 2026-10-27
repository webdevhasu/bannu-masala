import skeletonStyles from '@/components/ProductSkeleton.module.css';

export default function DashboardLoading() {
  return (
    <div style={{ padding: '8px 0 60px' }}>
      {/* Header Row Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className={skeletonStyles.skeleton} style={{ width: '220px', height: '28px', marginBottom: '8px', borderRadius: '8px' }} />
          <div className={skeletonStyles.skeleton} style={{ width: '320px', height: '16px', borderRadius: '6px' }} />
        </div>
        <div className={skeletonStyles.skeleton} style={{ width: '130px', height: '40px', borderRadius: '10px' }} />
      </div>

      {/* Metrics Row Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className={skeletonStyles.skeleton} style={{ width: '90px', height: '14px' }} />
              <div className={skeletonStyles.skeleton} style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
            </div>
            <div className={skeletonStyles.skeleton} style={{ width: '110px', height: '28px' }} />
            <div className={skeletonStyles.skeleton} style={{ width: '70px', height: '12px' }} />
          </div>
        ))}
      </div>

      {/* Filter / Search Bar Skeleton */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className={skeletonStyles.skeleton} style={{ width: '280px', height: '42px', borderRadius: '10px' }} />
        <div className={skeletonStyles.skeleton} style={{ width: '140px', height: '42px', borderRadius: '10px' }} />
      </div>

      {/* Table Shimmer Skeleton */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <div className={skeletonStyles.skeleton} style={{ width: '100%', height: '18px' }} />
        </div>
        {[1, 2, 3, 4, 5, 6].map((row) => (
          <div
            key={row}
            style={{
              padding: '18px 20px',
              borderBottom: '1px solid #f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            <div className={skeletonStyles.skeleton} style={{ width: '120px', height: '16px' }} />
            <div className={skeletonStyles.skeleton} style={{ width: '180px', height: '16px' }} />
            <div className={skeletonStyles.skeleton} style={{ width: '90px', height: '16px' }} />
            <div className={skeletonStyles.skeleton} style={{ width: '70px', height: '24px', borderRadius: '50px' }} />
            <div className={skeletonStyles.skeleton} style={{ width: '80px', height: '32px', borderRadius: '8px' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
