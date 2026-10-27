'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './page.module.css';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  website: '',
};

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((current) => ({ ...current, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Please enter your name';
    if (!form.email.trim() && !form.phone.trim()) {
      next.email = 'Please provide an email or phone number';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Please enter a valid email address';
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      next.message = 'Please write a message of at least 10 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setServerError(data?.error || 'Could not send your message. Please try again.');
        return;
      }

      setForm(EMPTY);
      setSent(true);
    } catch {
      setServerError('Could not send your message. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.successBox}>
        <FontAwesomeIcon icon={faCircleCheck} className={styles.successIcon} />
        <h3>Message sent</h3>
        <p>Thank you for contacting Bannu Masala. Our team will get back to you soon.</p>
        <button type="button" className={styles.secondaryBtn} onClick={() => setSent(false)}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-name">Full Name *</label>
          <input
            id="contact-name"
            name="name"
            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            autoComplete="name"
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-phone">Phone / WhatsApp</label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            className={styles.input}
            value={form.phone}
            onChange={handleChange}
            placeholder="0300 1234567"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
          />
          {errors.email && <p className={styles.error}>{errors.email}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="contact-subject">Subject</label>
          <input
            id="contact-subject"
            name="subject"
            className={styles.input}
            value={form.subject}
            onChange={handleChange}
            placeholder="Order, product question, bulk enquiry..."
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contact-message">Message *</label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
          value={form.message}
          onChange={handleChange}
          placeholder="How can we help you?"
        />
        {errors.message && <p className={styles.error}>{errors.message}</p>}
      </div>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

      {serverError && <p className={styles.serverError}>{serverError}</p>}

      <button type="submit" className={styles.submitBtn} disabled={submitting}>
        <FontAwesomeIcon icon={faPaperPlane} />
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
