import Image from 'next/image';
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faUsers, faAward, faCheckCircle, faWhatsapp } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp as faWhatsappBrand } from '@fortawesome/free-brands-svg-icons';

export const metadata = {
  title: 'About Us | The Story of Bannu Masala',
  description: 'Pure, authentic, and handcrafted spices from the heart of Bannu. Meet Hassan Irfan, the man behind Bannu Masala.',
};

export default function AboutPage() {
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
                kitchen — spices that were pure, hand-ground, and full of life.
              </p>
              <p>
                When I moved to the city, I noticed something was missing. The spices in the
                market were pale imitations — full of fillers, artificial colors, and chemicals.
                I could no longer find that <em>real taste</em> from back home, and I knew
                thousands of families felt the same.
              </p>
              <p>
                So I went back to my roots. I began working with trusted farmers and artisans
                in Bannu, sourcing the finest whole spices, sun-drying them, and grinding
                them fresh in small batches — exactly as our elders did. That is how
                <strong> Bannu Masala</strong> was born.
              </p>

              <div className={styles.founderStats}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>100%</span>
                  <span className={styles.statLabel}>Pure & Natural</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>0</span>
                  <span className={styles.statLabel}>Additives or Fillers</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>✦</span>
                  <span className={styles.statLabel}>Bannu Origin</span>
                </div>
              </div>

              <a
                href="https://wa.me/923001234567"
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
              <h3>100% Organic</h3>
              <p>Sourced directly from farmers who avoid harmful pesticides and fertilizers.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FontAwesomeIcon icon={faCheckCircle} /></div>
              <h3>Zero Additives</h3>
              <p>No MSG, no artificial colors, and no anti-caking agents. Just pure spice.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FontAwesomeIcon icon={faAward} /></div>
              <h3>Premium Quality</h3>
              <p>Each batch is carefully selected and checked to ensure the highest standard.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FontAwesomeIcon icon={faUsers} /></div>
              <h3>Community First</h3>
              <p>We take pride in supporting local artisans and spice farmers of our region.</p>
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
