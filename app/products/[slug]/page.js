import sql from '@/lib/db';
import { notFound } from 'next/navigation';
import ProductGallery from './ProductGallery';
import ProductActions from './ProductActions';
import ReviewsSection from './ReviewsSection';
import styles from './page.module.css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar } from '@fortawesome/free-solid-svg-icons';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const productRes = await sql`SELECT name, description, image FROM products WHERE slug = ${slug} LIMIT 1`;
  if (!productRes.length) return { title: 'Product Not Found' };
  
  return {
    title: `${productRes[0].name} - Bannu Masala`,
    description: productRes[0].description,
    openGraph: {
      images: [productRes[0].image],
    }
  };
}

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;

  // Fetch Product
  const products = await sql`SELECT * FROM products WHERE slug = ${slug} LIMIT 1`;
  if (products.length === 0) {
    notFound();
  }
  const productData = products[0];
  const product = {
    ...productData,
    variants: {
      "250g": productData.price_250g,
      "500g": productData.price_500g,
      "1kg": productData.price_1kg,
    }
  };

  // Fetch Reviews Average
  const reviewStats = await sql`
    SELECT COUNT(*) as count, AVG(rating) as average 
    FROM reviews WHERE product_id = ${product.id}
  `;
  const reviewCount = parseInt(reviewStats[0].count);
  const averageRating = parseFloat(reviewStats[0].average || 0).toFixed(1);

  // Combine images
  const allImages = [product.image];
  if (product.gallery && Array.isArray(product.gallery)) {
    allImages.push(...product.gallery);
  }

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": allImages,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Bannu Masala"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "PKR",
      "lowPrice": product.price_250g,
      "highPrice": product.price_1kg,
      "offerCount": Object.keys(product.variants).length,
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": reviewCount > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": averageRating,
      "reviewCount": reviewCount
    } : undefined
  };

  return (
    <div className={styles.pageWrapper}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className={styles.container}>
        {/* Breadcrumb */}
        <Link href="/#products" className={styles.backLink}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Products
        </Link>

        {/* Main Product Section */}
        <div className={styles.mainGrid}>
          {/* Left: Gallery */}
          <div className={styles.galleryColumn}>
            <ProductGallery images={allImages} altText={product.name} />
          </div>

          {/* Right: Details & Actions */}
          <div className={styles.detailsColumn}>
            <div className={styles.badges}>
              <span className={styles.badge}>100% Pure</span>
              <span className={styles.badgeTop}>Top Seller</span>
            </div>
            
            <h1 className={styles.productName}>{product.name}</h1>
            
            <div className={styles.reviewSummary}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <FontAwesomeIcon 
                    key={star} 
                    icon={faStar} 
                    color={star <= Math.round(averageRating) ? '#fbbf24' : '#e2e8f0'} 
                  />
                ))}
              </div>
              <span className={styles.ratingText}>{averageRating} ({reviewCount} reviews)</span>
            </div>

            <p className={styles.description}>{product.description}</p>
            
            <ProductActions product={product} />

            <div className={styles.perks}>
              <div className={styles.perk}>🚚 Free Shipping on Rs 3000+</div>
              <div className={styles.perk}>🛡️ Preservative Free</div>
              <div className={styles.perk}>👨‍🍳 Authentic Pashtun Recipe</div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className={styles.reviewsWrapper}>
          <ReviewsSection productId={product.id} />
        </div>
      </div>
    </div>
  );
}
