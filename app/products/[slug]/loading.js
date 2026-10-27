import skeletonStyles from '@/components/ProductSkeleton.module.css';

export default function ProductDetailLoading() {
  return (
    <div style={{ minHeight: '85vh', padding: '32px 0 80px', background: 'var(--bg-primary, #fffdf8)' }}>
      <div className="container">
        {/* Breadcrumb Skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
          <div className={skeletonStyles.skeleton} style={{ width: '50px', height: '14px' }} />
          <span style={{ color: '#cbd5e1' }}>/</span>
          <div className={skeletonStyles.skeleton} style={{ width: '70px', height: '14px' }} />
          <span style={{ color: '#cbd5e1' }}>/</span>
          <div className={skeletonStyles.skeleton} style={{ width: '130px', height: '14px' }} />
        </div>

        {/* Product Detail 2-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
            alignItems: 'start',
            marginBottom: '60px',
          }}
        >
          {/* Left Column: Image Gallery Skeleton */}
          <div>
            <div
              className={skeletonStyles.skeleton}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '20px',
                marginBottom: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              }}
            />
            {/* Thumbnail Row */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={skeletonStyles.skeleton}
                  style={{ width: '72px', height: '72px', borderRadius: '12px' }}
                />
              ))}
            </div>
          </div>

          {/* Right Column: Product Info & Actions Skeleton */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category tag */}
            <div className={skeletonStyles.skeleton} style={{ width: '90px', height: '22px', borderRadius: '20px' }} />

            {/* Product Title */}
            <div className={skeletonStyles.skeleton} style={{ width: '85%', height: '34px', borderRadius: '8px' }} />
            <div className={skeletonStyles.skeleton} style={{ width: '50%', height: '34px', borderRadius: '8px' }} />

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className={skeletonStyles.skeleton} style={{ width: '95px', height: '18px' }} />
              <div className={skeletonStyles.skeleton} style={{ width: '75px', height: '18px' }} />
            </div>

            {/* Price Box */}
            <div
              style={{
                background: '#f8fafc',
                padding: '16px 20px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                margin: '8px 0',
              }}
            >
              <div className={skeletonStyles.skeleton} style={{ width: '120px', height: '32px' }} />
              <div className={skeletonStyles.skeleton} style={{ width: '70px', height: '20px' }} />
            </div>

            {/* Short Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0' }}>
              <div className={skeletonStyles.skeleton} style={{ width: '100%', height: '16px' }} />
              <div className={skeletonStyles.skeleton} style={{ width: '92%', height: '16px' }} />
              <div className={skeletonStyles.skeleton} style={{ width: '75%', height: '16px' }} />
            </div>

            {/* Weight Variant Selector Skeleton */}
            <div style={{ marginTop: '10px' }}>
              <div className={skeletonStyles.skeleton} style={{ width: '100px', height: '16px', marginBottom: '10px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className={skeletonStyles.skeleton} style={{ width: '80px', height: '42px', borderRadius: '10px' }} />
                <div className={skeletonStyles.skeleton} style={{ width: '80px', height: '42px', borderRadius: '10px' }} />
                <div className={skeletonStyles.skeleton} style={{ width: '80px', height: '42px', borderRadius: '10px' }} />
              </div>
            </div>

            {/* Quantity + Add to Cart Button Skeleton */}
            <div style={{ display: 'flex', gap: '14px', marginTop: '16px' }}>
              <div className={skeletonStyles.skeleton} style={{ width: '110px', height: '48px', borderRadius: '12px' }} />
              <div className={skeletonStyles.skeleton} style={{ flex: 1, height: '48px', borderRadius: '12px' }} />
            </div>

            {/* Buy on WhatsApp Button Skeleton */}
            <div className={skeletonStyles.skeleton} style={{ width: '100%', height: '46px', borderRadius: '12px', marginTop: '4px' }} />

            {/* Trust Badges Skeleton */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <div className={skeletonStyles.skeleton} style={{ height: '50px', borderRadius: '10px' }} />
              <div className={skeletonStyles.skeleton} style={{ height: '50px', borderRadius: '10px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
