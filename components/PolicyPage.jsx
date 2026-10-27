import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileLines,
  faArrowRight,
  faTruck,
  faRotateLeft,
  faShieldHalved,
  faScaleBalanced,
  faCircleQuestion,
  faPhone,
} from '@fortawesome/free-solid-svg-icons';
import styles from './PolicyPage.module.css';

const POLICY_LINKS = [
  { href: '/shipping-policy', label: 'Shipping Policy', icon: faTruck },
  { href: '/returns-policy', label: 'Returns & Refunds', icon: faRotateLeft },
  { href: '/privacy-policy', label: 'Privacy Policy', icon: faShieldHalved },
  { href: '/terms-and-conditions', label: 'Terms & Conditions', icon: faScaleBalanced },
  { href: '/faqs', label: 'FAQs', icon: faCircleQuestion },
];

function renderFormattedText(str) {
  if (!str) return '';
  const parts = str.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderPolicyContent(text) {
  if (!text) return null;

  const blocks = text.split(/\n\s*\n/);

  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={idx} className={styles.sectionSubheading}>
          {trimmed.replace(/^####\s*/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className={styles.sectionHeading}>
          {trimmed.replace(/^###\s*/, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className={styles.sectionMainHeading}>
          {trimmed.replace(/^##\s*/, '')}
        </h2>
      );
    }

    const lines = trimmed.split('\n');
    const isBulletList = lines.length > 0 && lines.every((line) => line.trim().startsWith('•') || line.trim().startsWith('-'));
    if (isBulletList) {
      return (
        <ul key={idx} className={styles.bulletList}>
          {lines.map((line, lIdx) => {
            const cleanLine = line.trim().replace(/^[•\-]\s*/, '');
            return (
              <li key={lIdx} className={styles.bulletItem}>
                <span className={styles.bulletDot} />
                <span>{renderFormattedText(cleanLine)}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    const isNumberedList = lines.length > 0 && lines.every((line) => /^\d+[\.\)]\s/.test(line.trim()));
    if (isNumberedList) {
      return (
        <ol key={idx} className={styles.numberedList}>
          {lines.map((line, lIdx) => {
            const match = line.trim().match(/^(\d+)[\.\)]\s*(.*)$/);
            return (
              <li key={lIdx} className={styles.numberedItem}>
                <span className={styles.stepNumber}>{match ? match[1] : lIdx + 1}</span>
                <span>{renderFormattedText(match ? match[2] : line)}</span>
              </li>
            );
          })}
        </ol>
      );
    }

    return (
      <p key={idx} className={styles.paragraph}>
        {renderFormattedText(trimmed)}
      </p>
    );
  });
}

export default function PolicyPage({ title, description, content, activeHref }) {
  const hasContent = Boolean(content && content.trim());

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>Bannu Masala • Customer Care</span>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.subtitle}>{description}</p>}
        </div>
      </section>

      <div className="container">
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Customer Policies</h2>
            <nav className={styles.nav}>
              {POLICY_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${activeHref === link.href ? styles.navActive : ''}`}
                >
                  <FontAwesomeIcon icon={link.icon} className={styles.navIcon} />
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            <div className={styles.helpBox}>
              <div className={styles.helpHeader}>
                <span className={styles.helpIconWrap}>
                  <FontAwesomeIcon icon={faPhone} />
                </span>
                <div>
                  <h3 className={styles.helpTitle}>Have a Question?</h3>
                  <p className={styles.helpSub}>We are here to assist you daily.</p>
                </div>
              </div>
              <p className={styles.helpDesc}>
                Contact our team on WhatsApp or phone for immediate order assistance.
              </p>
              <Link href="/contact" className={styles.helpLink}>
                Contact Us <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          </aside>

          <article className={styles.content}>
            {hasContent ? (
              <div className={styles.policyBody}>{renderPolicyContent(content)}</div>
            ) : (
              <div className={styles.placeholder}>
                <FontAwesomeIcon icon={faFileLines} className={styles.placeholderIcon} />
                <h2>Policy Under Final Review</h2>
                <p>
                  Our {title.toLowerCase()} is currently being updated. Please contact our support team
                  directly on WhatsApp and we will gladly answer any questions.
                </p>
                <Link href="/contact" className={styles.placeholderBtn}>
                  Contact Support <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
