import Image from 'next/image';
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faUsers, faAward, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us | The Story of Bannu Masala',
  description: 'Handcrafted spices from the heart of Bannu. Meet Hassan Irfan, the founder of Bannu Masala.',
};

export default async function AboutPage() {
  const settings = await getAllSettings();
  const whatsapp = settings.store?.whatsapp || '923099907713';

  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroTag}>Our Story</p>
          <h1 className={styles.title}>Passion for Purity,<br />Born in Bannu</h1>
          <p className={styles.subtitle}>Handcrafting the finest spice blends with love and tradition.</p>
        </div>
      </section>

      {/* Founder Section */}
      <section className={styles.founderSection}>
        <div className={styles.container}>
          <div className={styles.founderGrid}>
            <div className={styles.founderImageWrapper}>
              <div className={styles.imageFrame}>
                <Image
                  src="/hassanirfan.jpeg"
                  alt="Hassan Irfan - Founder of Bannu Masala"
                  fill
                  className={styles.founderImg}
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 45vw"
                  priority
                />
              </div>
              <div className={styles.founderLabel}>
                <h3>Hassan Irfan</h3>
                <p>Founder & Brand Manager</p>
              </div>
            </div>

            <div className={styles.founderText}>
              <span className={styles.eyebrow}>Meet the Founder</span>
              <h2 className={styles.sectionTitle}>A Mission Rooted in Authenticity</h2>
              <p>
                My name is <strong>Hassan Irfan</strong>, and I am the founder of Bannu Masala.
                Growing up in Bannu, KPK, I was surrounded by the intoxicating aromas of our
                 kitchen — spices that were freshly ground and full of life.
              </p>
              <p>
                When I moved to the city, I noticed something was missing. The spices in the
                market did not carry the same aroma or depth of flavour I remembered from home.
                I could no longer find that <em>real taste</em> from back home, and I knew
                other families felt the same.
              </p>
              <p>
                So I went back to my roots. I began working with trusted farmers and artisans
                in Bannu, sourcing the finest whole spices, sun-drying them, and grinding
                them fresh in small batches — exactly as our elders did. That is how
                <strong> Bannu Masala</strong> was born.
              </p>

              <div className={styles.founderStats}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>Bannu</span>
                  <span className={styles.statLabel}>Our Home</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>Small</span>
                  <span className={styles.statLabel}>Batch Blends</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>Online</span>
                  <span className={styles.statLabel}>Ordering</span>
                </div>
              </div>

              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contactBtn}
              >
                Chat with Hassan on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2 className={styles.valuesTitle}>Why Choose Bannu Masala?</h2>
          <p className={styles.valuesSubtitle}>We do not just sell spices. We deliver the taste of trust.</p>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FontAwesomeIcon icon={faLeaf} /></div>
              <h3>Whole Spices</h3>
              <p>Sourced from trusted farmers in our region and ground fresh in small batches.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FontAwesomeIcon icon={faCheckCircle} /></div>
              <h3>Packed with Care</h3>
              <p>Every order is checked and packed carefully before it is dispatched.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FontAwesomeIcon icon={faAward} /></div>
              <h3>Made for Everyday Cooking</h3>
              <p>Blends prepared for the dishes you cook at home every day.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FontAwesomeIcon icon={faUsers} /></div>
              <h3>Easy Ordering</h3>
              <p>Shop online in a few taps, or send your order directly on WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionContent}>
            <span className={styles.missionTag}>Our Promise</span>
            <h2>Taste the Difference of Real Spices</h2>
            <p>
              To bring the authentic, unfiltered flavors of traditional Pashtun and Pakistani
              cuisine to every household — reviving the ancient handcrafted spice-making
              traditions that have been lost in the age of industrialization.
            </p>
            <div className={styles.signatureWrap}>
              <span className={styles.signature}>Hassan Irfan</span>
              <span className={styles.signatureTitle}>Founder, Bannu Masala</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
