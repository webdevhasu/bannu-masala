import sql from '@/lib/db';

/**
 * Returns overall storewide review statistics:
 * - total_reviews: Total approved customer text reviews ever received
 * - average_rating: Global average rating across all approved reviews
 */
export async function getGlobalReviewStats() {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*)::int AS total_reviews,
        COALESCE(AVG(rating), 0)::numeric AS avg_rating
      FROM reviews
      WHERE is_approved = true
    `;

    const count = parseInt(stats[0]?.total_reviews, 10) || 0;
    const avg = parseFloat(stats[0]?.avg_rating || 0).toFixed(1);

    return {
      total_reviews: count,
      average_rating: avg,
    };
  } catch (error) {
    console.error('Error fetching global review stats:', error);
    return {
      total_reviews: 0,
      average_rating: '0.0',
    };
  }
}
