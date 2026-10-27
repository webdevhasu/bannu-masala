'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faShoppingCart,
  faChartLine,
  faLightbulb,
  faArrowRight,
  faTruck,
  faStar,
  faTag,
  faGear,
} from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

export default function DashboardOverview() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
        ]);

        const products = await prodRes.json();
        const orders = await orderRes.json();

        const revenue = orders
          .filter((o) => ['pending', 'confirmed', 'dispatched', 'delivered', 'shipped', 'completed'].includes(o.status || 'pending'))
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        const newOrdersCount = orders.filter((o) => (o.status || 'pending') === 'pending').length;

        setStats({
          products: Array.isArray(products) ? products.length : 0,
          orders: newOrdersCount,
          revenue,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard Overview</h1>
        <p className={styles.pageSub}>
          Khushamdeed! Yahan se aap apne Bannu Masala online store ki tamam activities aur orders control kar sakte hain.
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#fef3c7', color: '#d97706' }}>
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <div>
            <p className={styles.statLabel}>New Orders</p>
            <h3 className={styles.statValue}>{stats.orders}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#ecfdf5', color: '#059669' }}>
            <FontAwesomeIcon icon={faChartLine} />
          </div>
          <div>
            <p className={styles.statLabel}>Total Sales</p>
            <h3 className={styles.statValue}>Rs {stats.revenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#eff6ff', color: '#2563eb' }}>
            <FontAwesomeIcon icon={faBox} />
          </div>
          <div>
            <p className={styles.statLabel}>Active Spices</p>
            <h3 className={styles.statValue}>{stats.products}</h3>
          </div>
        </div>
      </div>

      {/* Owner Helping Guide & Cheat Sheet */}
      <div className={styles.guideSection}>
        <div className={styles.guideHeader}>
          <div>
            <h2 className={styles.guideTitle}>
              <FontAwesomeIcon icon={faLightbulb} style={{ color: '#eab308' }} />
              Store Owner Quick Guide & Workflow (Aap Ki Rahnumai)
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
              Website chalane ke ahem tareeqe aur daily routine steps:
            </p>
          </div>
          <span className={styles.guideBadge}>Daily Cheatsheet</span>
        </div>

        <div className={styles.guideGrid}>
          {/* Card 1: Orders */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardTop}>
              <div className={styles.guideStepNumber}>1</div>
              <h3 className={styles.guideCardTitle}>Order Confirmation & Processing</h3>
            </div>
            <p className={styles.guideCardText}>
              Website par jab naya order aaye to <strong>&apos;Orders&apos;</strong> section me jayein:
            </p>
            <ul className={styles.guideTipsList}>
              <li>Pehle <strong>&apos;Call&apos;</strong> ya WhatsApp ke zariye customer se delivery address confirm karein.</li>
              <li>Status <strong>&apos;Confirmed&apos;</strong> karein taake packing shuru ho sake.</li>
              <li><strong>&apos;Print Slip&apos;</strong> dabayein aur parcel ke upar chipka dein.</li>
            </ul>
            <Link href="/dashboard/orders" className={styles.quickLinkBtn}>
              Go to Orders <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.75rem' }} />
            </Link>
          </div>

          {/* Card 2: Courier & Tracking */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardTop}>
              <div className={styles.guideStepNumber} style={{ background: '#0284c7' }}>2</div>
              <h3 className={styles.guideCardTitle}>Courier Dispatch & Live Tracking</h3>
            </div>
            <p className={styles.guideCardText}>
              Jab parcel TCS, Leopards, Trax ya PostEx ko handover karein:
            </p>
            <ul className={styles.guideTipsList}>
              <li>Status me <strong>&apos;Dispatched&apos;</strong> ya <strong>&apos;Add Courier&apos;</strong> click karein.</li>
              <li>Courier service select karein aur tracking consignment number likhein.</li>
              <li><strong>&apos;Send WhatsApp Update&apos;</strong> click karein; customer ko live tracking link chala jayega.</li>
            </ul>
            <Link href="/dashboard/orders" className={styles.quickLinkBtn}>
              Manage Dispatches <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.75rem' }} />
            </Link>
          </div>

          {/* Card 3: Delivered & Reviews */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardTop}>
              <div className={styles.guideStepNumber} style={{ background: '#16a34a' }}>3</div>
              <h3 className={styles.guideCardTitle}>Delivered & Customer Reviews</h3>
            </div>
            <p className={styles.guideCardText}>
              Jab customer ko parcel deliver ho jaye aur payment mil jaye:
            </p>
            <ul className={styles.guideTipsList}>
              <li>Status ko <strong>&apos;Delivered&apos;</strong> select karein.</li>
              <li><strong>&apos;Send WhatsApp Update&apos;</strong> dabayein; customer ko shukriya ka message aur product review dene ka direct link jayega.</li>
              <li>Customer ke reviews ko <strong>&apos;Reviews&apos;</strong> tab me ja kar approve karein.</li>
            </ul>
            <Link href="/dashboard/reviews" className={styles.quickLinkBtn}>
              Moderate Reviews <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.75rem' }} />
            </Link>
          </div>

          {/* Card 4: Products & Pricing */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardTop}>
              <div className={styles.guideStepNumber} style={{ background: '#9333ea' }}>4</div>
              <h3 className={styles.guideCardTitle}>Products, Weights & Pricing</h3>
            </div>
            <p className={styles.guideCardText}>
              Naye masalay shamil karne ya prices badalne ke liye:
            </p>
            <ul className={styles.guideTipsList}>
              <li><strong>&apos;Products&apos;</strong> tab me jayein, 250g, 500g aur 1kg ki prices update karein.</li>
              <li>Agar stock khatam ho to units zero ya low stock set karein.</li>
              <li>Best seller ya special badge lagayein jo homepage par highlight hoga.</li>
            </ul>
            <Link href="/dashboard/products" className={styles.quickLinkBtn}>
              Edit Products <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.75rem' }} />
            </Link>
          </div>

          {/* Card 5: Deals & Discounts */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardTop}>
              <div className={styles.guideStepNumber} style={{ background: '#d97706' }}>5</div>
              <h3 className={styles.guideCardTitle}>Sales & Special Deals</h3>
            </div>
            <p className={styles.guideCardText}>
              Eid, Ramazan ya weekend deals schedule karne ke liye:
            </p>
            <ul className={styles.guideTipsList}>
              <li><strong>&apos;Hot Deals&apos;</strong> tab me ja kar kisi bhi product/variant par discount set karein.</li>
              <li>End date schedule karein; deal khatam hote hi original price automatically wapas aa jayegi.</li>
            </ul>
            <Link href="/dashboard/deals" className={styles.quickLinkBtn}>
              Schedule Deals <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.75rem' }} />
            </Link>
          </div>

          {/* Card 6: Settings & Policies */}
          <div className={styles.guideCard}>
            <div className={styles.guideCardTop}>
              <div className={styles.guideStepNumber} style={{ background: '#475569' }}>6</div>
              <h3 className={styles.guideCardTitle}>Store Settings & Announcements</h3>
            </div>
            <p className={styles.guideCardText}>
              Helpline number ya shipping charges update karne ke liye:
            </p>
            <ul className={styles.guideTipsList}>
              <li><strong>&apos;Settings&apos;</strong> me ja kar official WhatsApp number badlein.</li>
              <li>Shipping delivery charges (flat rate) aur free delivery threshold set karein.</li>
              <li>Website ke top announcement bar ke messages edit ya add karein.</li>
            </ul>
            <Link href="/dashboard/settings" className={styles.quickLinkBtn}>
              Open Settings <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: '0.75rem' }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
