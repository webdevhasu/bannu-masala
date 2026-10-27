import { getAllSettings } from '@/lib/settings';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCommentDots,
  faPhone,
  faEnvelope,
  faLocationDot,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import ContactForm from './ContactForm';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Contact Us | Bannu Masala',
  description:
    'Get in touch with Bannu Masala for orders, product questions, bulk enquiries, or delivery support.',
};

export default async function ContactPage() {
  const settings = await getAllSettings();
  const store = settings.store || {};
  const whatsapp = store.whatsapp || '923099907713';
  const whatsappMessage = encodeURIComponent(
    'Assalam o Alaikum! I would like to ask about Bannu Masala products.'
  );

  const contactItems = [
    {
      icon: faCommentDots,
      label: 'WhatsApp',
      value: store.phone || `+${whatsapp}`,
      href: `https://wa.me/${whatsapp}?text=${whatsappMessage}`,
      external: true,
    },
    {
      icon: faPhone,
      label: 'Phone',
      value: store.phone,
      href: store.phone ? `tel:${store.phone.replace(/\s+/g, '')}` : null,
    },
    {
      icon: faEnvelope,
      label: 'Email',
      value: store.email,
      href: store.email ? `mailto:${store.email}` : null,
    },
    {
      icon: faLocationDot,
      label: 'Address',
      value: store.address,
      href: null,
    },
    {
      icon: faClock,
      label: 'Support Hours',
      value: store.hours,
      href: null,
    },
  ].filter((item) => item.value);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <span className={styles.eyebrow}>We are here to help</span>
          <h1 className={styles.title}>Contact Us</h1>
          <p className={styles.subtitle}>
            Questions about a product, an order, or bulk pricing? Send us a message and our team will
            get back to you.
          </p>
        </div>
      </section>

      <div className="container">
        <div className={styles.grid}>
          <div className={styles.infoColumn}>
            <h2 className={styles.sectionTitle}>Get in Touch</h2>
            <p className={styles.sectionText}>
              Reach us directly on WhatsApp for the fastest response, or use the contact form.
            </p>

            <div className={styles.infoList}>
              {contactItems.map((item) => {
                const content = (
                  <>
                    <span className={styles.infoIcon}>
                      <FontAwesomeIcon icon={item.icon} />
                    </span>
                    <span>
                      <span className={styles.infoLabel}>{item.label}</span>
                      <span className={styles.infoValue}>{item.value}</span>
                    </span>
                  </>
                );

                return item.href ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className={styles.infoCard}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={item.label} className={styles.infoCard}>
                    {content}
                  </div>
                );
              })}
            </div>

            <a
              href={`https://wa.me/${whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <FontAwesomeIcon icon={faCommentDots} />
              Chat on WhatsApp
            </a>
          </div>

          <div className={styles.formColumn}>
            <h2 className={styles.sectionTitle}>Send a Message</h2>
            <p className={styles.sectionText}>
              Fill in the form below. Fields marked * are required.
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
