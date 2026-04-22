import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch Aggregations
    const [revenueRes, pendingRes, productsRes] = await Promise.all([
      sql`SELECT COALESCE(SUM(total), 0) as total_revenue FROM orders`,
      sql`SELECT COUNT(*) as pending_count FROM orders WHERE status = 'pending'`,
      sql`SELECT COUNT(*) as product_count FROM products`
    ]);

    // 2. Format Response
    const stats = {
      total_revenue: parseFloat(revenueRes[0].total_revenue),
      pending_orders: parseInt(pendingRes[0].pending_count),
      total_products: parseInt(productsRes[0].product_count),
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
