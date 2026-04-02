import Image from 'next/image';
import styles from './page.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeaf, faUsers, faAward, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

export const metadata = {
  title: 'About Us | The Story of Bannu Masala',
  description: 'Pure, authentic, and handcrafted spices from the heart of Bannu. Meet our founder and learn about our commitment to quality.',
};

export default function AboutPage() {
  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Our Story</h1>
          <p className={styles.subtitle}>Handcrafting the finest spice blends since generations.</p>
        </div>
      </section>

      {/* Founder Section */}
      <section className={styles.founderSection}>
        <div className={styles.container}>
          <div className={styles.founderGrid}>
            <div className={styles.founderImageWrapper}>
              <div className={styles.imageFrame}>
                {/* Placeholder for Founder Image */}
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800" 
                  alt="Founder of Bannu Masala" 
                  className={styles.founderImg}
                />
              </div>
              <div className={styles.founderLabel}>
                <h3>Haji Aziz Ullah</h3>
                <p>Founder & Master Blender</p>
              </div>
            </div>
            
            <div className={styles.founderText}>
              <h2 className={styles.sectionTitle}>A Vision for Purity</h2>
              <p>
                Bannu Masala was born in the rugged, aromatic heart of Bannu, KPK. 
                Our founder, <strong>Haji Aziz Ullah</strong>, started with a simple belief: 
                <em> "Spices are the soul of the kitchen, and they should be as pure as nature intended."</em>
              </p>
              <p>
                Frustrated by the chemical-laden, mass-produced powders in the market, he began 
                hand-selecting premium whole spices, sun-drying them, and grinding them in 
                small batches using traditional techniques.
              </p>
              <p>
                What started as a small local venture has now grown into a symbol of trust 
                for thousands of families across Pakistan. Every packet of Bannu Masala 
                carries with it the authentic taste of tradition, free from any 
                preservatives, fillers, or artificial colors.
              </p>
              <div className={styles.signature}> Aziz Ullah </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <h2 className={styles.valuesTitle}>Why Choose Bannu Masala?</h2>
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
              <h3>Export Quality</h3>
              <p>Each batch undergoes rigorous quality checks to meet international standards.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FontAwesomeIcon icon={faUsers} /></div>
              <h3>Community First</h3>
              <p>We take pride in supporting local artisans and spice farmers in our region.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className={styles.missionSection}>
        <div className={styles.container}>
          <div className={styles.missionContent}>
            <h2>Our Mission</h2>
            <p>
              To bring the authentic, unfiltered flavors of traditional Pashtun and Pakistani 
              cuisine to every household, while reviving ancient handcrafted spice-making 
              traditions that have been lost in the age of industrialization.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
