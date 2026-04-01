'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faShoppingCart, faChartLine } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders')
        ]);
        
        const products = await prodRes.json();
        const orders = await orderRes.json();
        
        const revenue = orders.reduce((sum, o) => sum + o.total, 0);
        
        setStats({
          products: products.length || 0,
          orders: orders.length || 0,
          revenue
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#fef3c7', color: '#d97706' }}>
            <FontAwesomeIcon icon={faShoppingCart} size="lg" />
          </div>
          <div>
            <p className={styles.statLabel}>Total Orders</p>
            <h3 className={styles.statValue}>{stats.orders}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <FontAwesomeIcon icon={faChartLine} size="lg" />
          </div>
          <div>
            <p className={styles.statLabel}>Total Revenue</p>
            <h3 className={styles.statValue}>Rs {stats.revenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <FontAwesomeIcon icon={faBox} size="lg" />
          </div>
          <div>
            <p className={styles.statLabel}>Total Products</p>
            <h3 className={styles.statValue}>{stats.products}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
