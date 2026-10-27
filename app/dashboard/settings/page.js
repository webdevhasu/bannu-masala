'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faBullhorn,
  faCircleCheck,
  faCircleExclamation,
  faCog,
  faFileLines,
  faFloppyDisk,
  faHouse,
  faImage,
  faMoneyBillWave,
  faPlus,
  faStore,
  faTrash,
  faTruck,
  faArrowUpRightFromSquare,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';
import { DEFAULT_SETTINGS } from '@/lib/defaultSettings.mjs';
import styles from './page.module.css';

const TABS = [
  { id: 'announcements', label: 'Announcement Bar', icon: faBullhorn },
  { id: 'hero', label: 'Hero Banner', icon: faImage },
  { id: 'store', label: 'Store Details', icon: faStore },
  { id: 'shipping', label: 'Shipping', icon: faTruck },
  { id: 'payment', label: 'Payments', icon: faMoneyBillWave },
  { id: 'homepage', label: 'Homepage', icon: faHouse },
  { id: 'policies', label: 'Policies', icon: faFileLines },
];

const POLICY_META = [
  { key: 'shipping', label: 'Shipping Policy', href: '/shipping-policy' },
  { key: 'returns', label: 'Returns & Refund Policy', href: '/returns-policy' },
  { key: 'privacy', label: 'Privacy Policy', href: '/privacy-policy' },
  { key: 'terms', label: 'Terms & Conditions', href: '/terms-and-conditions' },
  { key: 'faq', label: 'Frequently Asked Questions (FAQs)', href: '/faqs' },
];

function newAnnouncement() {
  return {
    id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: '',
    enabled: true,
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [tab, setTab] = useState('announcements');
  const [savingKey, setSavingKey] = useState('');
  const [uploadingField, setUploadingField] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) throw new Error(data.error);
        setSettings(data);
      })
      .catch((error) => setToast({ message: error.message, type: 'error' }));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const update = (key, patch) => {
    setSettings((current) => ({
      ...current,
      [key]: { ...current[key], ...patch },
    }));
  };

  const save = async (key) => {
    setSavingKey(key);
    try {
      let value = settings[key];

      if (key === 'payment') {
        value = {
          ...value,
          methods: (value.methods || []).map((method) => method.trim()).filter(Boolean),
        };
      }

      if (key === 'announcements') {
        value = {
          ...value,
          items: (value.items || []).filter((item) => item.text.trim() || item.enabled),
        };
      }

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || 'Failed to save settings');

      setSettings(data.settings);
      setToast({ message: 'Settings saved successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setSavingKey('');
    }
  };

  const handleHeroUpload = async (event, field) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file (PNG, JPG, WEBP).', type: 'error' });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setToast({ message: 'Image must be smaller than 8 MB.', type: 'error' });
      return;
    }

    setUploadingField(field);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.url) {
        throw new Error(data?.error || 'Image upload failed');
      }
      update('hero', { [field]: data.url });
      setToast({ message: 'Image uploaded. Click "Save changes" to publish.', type: 'success' });
    } catch (error) {
      setToast({ message: error.message, type: 'error' });
    } finally {
      setUploadingField('');
    }
  };

  const loadPolicyTemplate = (key) => {
    const defaultText = DEFAULT_SETTINGS.policies?.[key] || '';
    update('policies', { [key]: defaultText });
    setToast({ message: `Template loaded! Click "Save changes" to save.`, type: 'success' });
  };

  if (!settings) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading settings...</p>
      </div>
    );
  }

  const updateAnnouncement = (patch) => update('announcements', patch);
  const announcementItems = settings.announcements?.items || [];

  const updateAnnouncementItem = (index, patch) => {
    updateAnnouncement({
      items: announcementItems.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item
      ),
    });
  };

  const moveAnnouncement = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= announcementItems.length) return;
    const items = [...announcementItems];
    [items[index], items[target]] = [items[target], items[index]];
    updateAnnouncement({ items });
  };

  const removeAnnouncement = (index) => {
    updateAnnouncement({ items: announcementItems.filter((_, itemIndex) => itemIndex !== index) });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>
            <FontAwesomeIcon icon={faCog} style={{ color: '#800000' }} />
            Site Settings
          </h1>
          <p className={styles.pageSub}>
            Manage announcement bar, hero banners, store contact, shipping fees, homepage sections, and customer care policies.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`${styles.tab} ${tab === item.id ? styles.tabActive : ''}`}
            onClick={() => setTab(item.id)}
          >
            <FontAwesomeIcon icon={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className={styles.panel}>
        {/* 1. ANNOUNCEMENTS */}
        {tab === 'announcements' && (
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faBullhorn} style={{ color: '#800000' }} />
                Announcement Bar
              </h2>
              <p className={styles.hint}>
                These messages rotate continuously at the very top of the storefront. Keep them concise and truthful.
              </p>
            </div>

            <div className={styles.inlineRow}>
              <div
                className={styles.toggleRow}
                style={{ marginBottom: 0, padding: '10px 16px', flex: '1 1 300px' }}
                onClick={() => updateAnnouncement({ enabled: !settings.announcements?.enabled })}
              >
                <div className={styles.toggleText}>
                  <span className={styles.toggleTitle}>Enable Announcement Bar</span>
                  <span className={styles.toggleSubtitle}>Show announcement marquee at top of website</span>
                </div>
                <div className={`${styles.switch} ${settings.announcements?.enabled ? styles.switchActive : ''}`}>
                  <div className={styles.switchKnob} />
                </div>
              </div>

              <div className={styles.intervalField}>
                <label htmlFor="rotation">Rotation speed:</label>
                <input
                  id="rotation"
                  type="number"
                  min="2"
                  max="20"
                  value={Math.round((Number(settings.announcements?.interval_ms) || 4000) / 1000)}
                  onChange={(e) => updateAnnouncement({ interval_ms: Math.max(2000, Number(e.target.value) * 1000) })}
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>seconds</span>
              </div>
            </div>

            <div className={styles.announcementList}>
              {announcementItems.map((item, index) => (
                <div key={item.id} className={styles.announcementRow}>
                  <div className={styles.orderButtons}>
                    <button
                      type="button"
                      onClick={() => moveAnnouncement(index, -1)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <FontAwesomeIcon icon={faArrowUp} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveAnnouncement(index, 1)}
                      disabled={index === announcementItems.length - 1}
                      title="Move down"
                    >
                      <FontAwesomeIcon icon={faArrowDown} />
                    </button>
                  </div>

                  <input
                    className={styles.fieldInput}
                    value={item.text}
                    placeholder="e.g. Delivery Across Pakistan • Free shipping on orders over Rs 2,500"
                    onChange={(e) => updateAnnouncementItem(index, { text: e.target.value })}
                  />

                  <div
                    className={`${styles.statusPill} ${item.enabled !== false ? styles.statusPillActive : styles.statusPillInactive}`}
                    onClick={() => updateAnnouncementItem(index, { enabled: item.enabled === false })}
                    title="Click to toggle status"
                  >
                    <span>{item.enabled !== false ? '● Active' : '○ Paused'}</span>
                  </div>

                  <button
                    type="button"
                    className={styles.iconDanger}
                    onClick={() => removeAnnouncement(index)}
                    title="Delete announcement"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={styles.uploadBtn}
              onClick={() => updateAnnouncement({ items: [...announcementItems, newAnnouncement()] })}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Add Message</span>
            </button>

            <SaveBar onSave={() => save('announcements')} saving={savingKey === 'announcements'} />
          </section>
        )}

        {/* 2. HERO BANNER */}
        {tab === 'hero' && (
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faImage} style={{ color: '#800000' }} />
                Homepage Hero Banner
              </h2>
              <p className={styles.hint}>
                The primary banner shown at the top of your homepage. You can configure custom headlines, buttons, and upload custom high-resolution desktop & mobile images.
              </p>
            </div>

            <div
              className={styles.toggleRow}
              onClick={() => update('hero', { enabled: settings.hero?.enabled === false })}
            >
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Display Hero Banner</span>
                <span className={styles.toggleSubtitle}>Turn the main banner on or off</span>
              </div>
              <div className={`${styles.switch} ${settings.hero?.enabled !== false ? styles.switchActive : ''}`}>
                <div className={styles.switchKnob} />
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Small Eyebrow Badge</label>
                <input
                  className={styles.fieldInput}
                  value={settings.hero?.badge || ''}
                  onChange={(e) => update('hero', { badge: e.target.value })}
                  placeholder="e.g. Premium Handcrafted Quality"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Main Headline</label>
                <input
                  className={styles.fieldInput}
                  value={settings.hero?.headline || ''}
                  onChange={(e) => update('hero', { headline: e.target.value })}
                  placeholder="e.g. Har Pakwan Ka Asal Zaiqa"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Gold Highlight Text</label>
                <input
                  className={styles.fieldInput}
                  value={settings.hero?.highlight || ''}
                  onChange={(e) => update('hero', { highlight: e.target.value })}
                  placeholder="e.g. Bannu Masala"
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel}>Subheading Description</label>
                <textarea
                  rows={2}
                  className={styles.fieldTextarea}
                  value={settings.hero?.subheading || ''}
                  onChange={(e) => update('hero', { subheading: e.target.value })}
                  placeholder="Short tagline shown below the headline"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Primary Button Label</label>
                <input
                  className={styles.fieldInput}
                  value={settings.hero?.primary_label || ''}
                  onChange={(e) => update('hero', { primary_label: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Primary Button Link</label>
                <input
                  className={styles.fieldInput}
                  value={settings.hero?.primary_link || ''}
                  onChange={(e) => update('hero', { primary_link: e.target.value })}
                  placeholder="/products"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Secondary Button Label</label>
                <input
                  className={styles.fieldInput}
                  value={settings.hero?.secondary_label || ''}
                  onChange={(e) => update('hero', { secondary_label: e.target.value })}
                  placeholder="Explore Deals"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Secondary Button Link</label>
                <input
                  className={styles.fieldInput}
                  value={settings.hero?.secondary_link || ''}
                  onChange={(e) => update('hero', { secondary_link: e.target.value })}
                  placeholder="/deals"
                />
              </div>
            </div>

            {/* Banner Images */}
            <div className={styles.imageGrid}>
              <div className={styles.imageCard}>
                <label className={styles.fieldLabel}>Desktop Banner Image</label>
                <p className={styles.fieldHint}>Recommended: 1920 × 900 or 16:9 ratio</p>
                <div className={styles.imagePreview}>
                  {settings.hero?.desktop_image ? (
                    <img src={settings.hero.desktop_image} alt="Desktop Hero" />
                  ) : (
                    <div className={styles.imageEmpty}>
                      <FontAwesomeIcon icon={faImage} style={{ fontSize: '1.8rem' }} />
                      <span>Using default brand hero</span>
                    </div>
                  )}
                </div>
                <div className={styles.uploadRow}>
                  <label className={styles.uploadBtn}>
                    <FontAwesomeIcon icon={faImage} />
                    <span>{uploadingField === 'desktop_image' ? 'Uploading...' : 'Choose Desktop Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadingField === 'desktop_image'}
                      onChange={(e) => handleHeroUpload(e, 'desktop_image')}
                    />
                  </label>
                  {settings.hero?.desktop_image && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => update('hero', { desktop_image: '' })}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className={styles.imageCard}>
                <label className={styles.fieldLabel}>Mobile Banner Image (Optional)</label>
                <p className={styles.fieldHint}>Recommended: 900 × 1200 portrait crop</p>
                <div className={styles.imagePreview}>
                  {settings.hero?.mobile_image ? (
                    <img src={settings.hero.mobile_image} alt="Mobile Hero" />
                  ) : (
                    <div className={styles.imageEmpty}>
                      <FontAwesomeIcon icon={faImage} style={{ fontSize: '1.8rem' }} />
                      <span>Fallback to desktop image</span>
                    </div>
                  )}
                </div>
                <div className={styles.uploadRow}>
                  <label className={styles.uploadBtn}>
                    <FontAwesomeIcon icon={faImage} />
                    <span>{uploadingField === 'mobile_image' ? 'Uploading...' : 'Choose Mobile Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploadingField === 'mobile_image'}
                      onChange={(e) => handleHeroUpload(e, 'mobile_image')}
                    />
                  </label>
                  {settings.hero?.mobile_image && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => update('hero', { mobile_image: '' })}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <SaveBar onSave={() => save('hero')} saving={savingKey === 'hero'} />
          </section>
        )}

        {/* 3. STORE DETAILS */}
        {tab === 'store' && (
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faStore} style={{ color: '#800000' }} />
                Store & Contact Information
              </h2>
              <p className={styles.hint}>
                These business details appear on the contact page, order confirmations, footer, and WhatsApp support buttons.
              </p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>WhatsApp Support Number (digits only)</label>
                <input
                  className={styles.fieldInput}
                  placeholder="e.g. 923099907713"
                  value={settings.store?.whatsapp || ''}
                  onChange={(e) => update('store', { whatsapp: e.target.value.replace(/[^\d]/g, '') })}
                />
                <p className={styles.fieldHint}>Format: Country code without + (e.g. 923099907713)</p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Public Phone Number</label>
                <input
                  className={styles.fieldInput}
                  placeholder="e.g. +92 309 9907713"
                  value={settings.store?.phone || ''}
                  onChange={(e) => update('store', { phone: e.target.value })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Support Email Address</label>
                <input
                  type="email"
                  className={styles.fieldInput}
                  placeholder="e.g. info@bannumasala.pk"
                  value={settings.store?.email || ''}
                  onChange={(e) => update('store', { email: e.target.value })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Support Working Hours</label>
                <input
                  className={styles.fieldInput}
                  placeholder="e.g. Mon – Sat: 9:00 AM – 9:00 PM"
                  value={settings.store?.hours || ''}
                  onChange={(e) => update('store', { hours: e.target.value })}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel}>Physical Business Address</label>
                <input
                  className={styles.fieldInput}
                  placeholder="e.g. Bannu, Khyber Pakhtunkhwa, Pakistan"
                  value={settings.store?.address || ''}
                  onChange={(e) => update('store', { address: e.target.value })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Facebook Page URL</label>
                <input
                  className={styles.fieldInput}
                  placeholder="https://www.facebook.com/bannumasala"
                  value={settings.store?.facebook || ''}
                  onChange={(e) => update('store', { facebook: e.target.value })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Instagram Profile URL</label>
                <input
                  className={styles.fieldInput}
                  placeholder="https://www.instagram.com/bannumasala786/"
                  value={settings.store?.instagram || ''}
                  onChange={(e) => update('store', { instagram: e.target.value })}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel}>TikTok Profile URL</label>
                <input
                  className={styles.fieldInput}
                  placeholder="https://www.tiktok.com/@bannumasala786"
                  value={settings.store?.tiktok || ''}
                  onChange={(e) => update('store', { tiktok: e.target.value })}
                />
              </div>
            </div>

            <SaveBar onSave={() => save('store')} saving={savingKey === 'store'} />
          </section>
        )}

        {/* 4. SHIPPING */}
        {tab === 'shipping' && (
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faTruck} style={{ color: '#800000' }} />
                Shipping & Delivery Fees
              </h2>
              <p className={styles.hint}>
                Configure flat rates, free shipping thresholds, and delivery notes displayed at checkout.
              </p>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Standard Flat Shipping Rate (Rs)</label>
                <input
                  type="number"
                  min="0"
                  className={styles.fieldInput}
                  value={settings.shipping?.flat_rate ?? 200}
                  onChange={(e) => update('shipping', { flat_rate: Math.max(0, Number(e.target.value) || 0) })}
                />
                <p className={styles.fieldHint}>Added to orders by default</p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Free Shipping Threshold (Rs)</label>
                <input
                  type="number"
                  min="0"
                  className={styles.fieldInput}
                  value={settings.shipping?.free_threshold ?? 0}
                  onChange={(e) => update('shipping', { free_threshold: Math.max(0, Number(e.target.value) || 0) })}
                />
                <p className={styles.fieldHint}>Set to 0 to disable free shipping</p>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Delivery Coverage Areas</label>
                <input
                  className={styles.fieldInput}
                  placeholder="e.g. Across Pakistan"
                  value={settings.shipping?.areas || ''}
                  onChange={(e) => update('shipping', { areas: e.target.value })}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Estimated Delivery Timeline</label>
                <input
                  className={styles.fieldInput}
                  placeholder="e.g. 2 to 4 working days"
                  value={settings.shipping?.delivery_days || ''}
                  onChange={(e) => update('shipping', { delivery_days: e.target.value })}
                />
              </div>

              <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
                <label className={styles.fieldLabel}>Checkout Shipping Note</label>
                <input
                  className={styles.fieldInput}
                  placeholder="e.g. Courier tracking link will be sent via WhatsApp upon dispatch."
                  value={settings.shipping?.note || ''}
                  onChange={(e) => update('shipping', { note: e.target.value })}
                />
              </div>
            </div>

            <SaveBar onSave={() => save('shipping')} saving={savingKey === 'shipping'} />
          </section>
        )}

        {/* 5. PAYMENT */}
        {tab === 'payment' && (
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faMoneyBillWave} style={{ color: '#800000' }} />
                Payment Options
              </h2>
              <p className={styles.hint}>
                Specify which payment channels you accept. Cash on Delivery is the standard for Pakistan e-commerce.
              </p>
            </div>

            <div
              className={styles.toggleRow}
              onClick={() => update('payment', { cod_enabled: !settings.payment?.cod_enabled })}
            >
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Cash on Delivery (COD)</span>
                <span className={styles.toggleSubtitle}>Allow customers to pay cash when package is delivered</span>
              </div>
              <div className={`${styles.switch} ${settings.payment?.cod_enabled ? styles.switchActive : ''}`}>
                <div className={styles.switchKnob} />
              </div>
            </div>

            <div className={styles.fieldGroup} style={{ marginTop: '16px' }}>
              <label className={styles.fieldLabel}>Accepted Payment Methods (one per line)</label>
              <textarea
                rows={5}
                className={styles.fieldTextarea}
                placeholder="Cash on Delivery (COD)&#10;EasyPaisa / JazzCash (on request)&#10;Bank Transfer"
                value={(settings.payment?.methods || []).join('\n')}
                onChange={(e) => update('payment', { methods: e.target.value.split('\n') })}
              />
              <p className={styles.fieldHint}>These payment names are listed on checkout and customer receipts.</p>
            </div>

            <SaveBar onSave={() => save('payment')} saving={savingKey === 'payment'} />
          </section>
        )}

        {/* 6. HOMEPAGE */}
        {tab === 'homepage' && (
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faHouse} style={{ color: '#800000' }} />
                Homepage Sections
              </h2>
              <p className={styles.hint}>
                Toggle storefront sections on or off without writing any code.
              </p>
            </div>

            <div className={styles.toggleGrid}>
              {[
                ['show_categories', 'Shop by Category Grid', 'Display category thumbnails section'],
                ['show_deals', 'Special Sales & Deals', 'Display active deals banner and carousel'],
                ['show_reviews', 'Customer Reviews Carousel', 'Display customer reviews on homepage'],
                ['show_brand_story', 'Founder & Brand Story', 'Display Hassan Irfan & Bannu roots section'],
              ].map(([field, title, desc]) => (
                <div
                  key={field}
                  className={styles.toggleCard}
                  onClick={() => update('homepage', { [field]: !settings.homepage?.[field] })}
                >
                  <div className={styles.toggleText}>
                    <span className={styles.toggleCardTitle}>{title}</span>
                    <span className={styles.toggleSubtitle}>{desc}</span>
                  </div>
                  <div className={`${styles.switch} ${settings.homepage?.[field] ? styles.switchActive : ''}`}>
                    <div className={styles.switchKnob} />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Maximum Reviews Shown on Homepage</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className={styles.fieldInput}
                  value={settings.homepage?.reviews_limit ?? 6}
                  onChange={(e) =>
                    update('homepage', {
                      reviews_limit: Math.min(12, Math.max(1, Number(e.target.value) || 1)),
                    })
                  }
                />
              </div>
            </div>

            <SaveBar onSave={() => save('homepage')} saving={savingKey === 'homepage'} />
          </section>
        )}

        {/* 7. POLICIES */}
        {tab === 'policies' && (
          <section>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <FontAwesomeIcon icon={faFileLines} style={{ color: '#800000' }} />
                Store Policies & Legal Pages
              </h2>
              <p className={styles.hint}>
                These contents directly power your public Shipping Policy, Returns & Refund, Privacy Policy, Terms & Conditions, and FAQ pages.
              </p>
            </div>

            <div className={styles.policyGrid}>
              {POLICY_META.map(({ key, label, href }) => {
                const currentVal = settings.policies?.[key] || '';
                const isCustom = Boolean(currentVal && currentVal.trim());

                return (
                  <div key={key} className={styles.policyCard}>
                    <div className={styles.policyCardHeader}>
                      <div className={styles.policyTitleGroup}>
                        <h3 className={styles.policyCardTitle}>{label}</h3>
                        <span className={`${styles.policyBadge} ${isCustom ? styles.badgeLive : styles.badgeDraft}`}>
                          {isCustom ? 'Configured' : 'Using Default'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          type="button"
                          className={styles.templateBtn}
                          onClick={() => loadPolicyTemplate(key)}
                          title="Fill with standard Bannu Masala template"
                        >
                          <FontAwesomeIcon icon={faWandMagicSparkles} style={{ color: '#800000' }} />
                          <span>Load Template</span>
                        </button>

                        <Link href={href} target="_blank" className={styles.policyLink} title="View public page">
                          <span>View Page</span>
                          <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: '0.72rem' }} />
                        </Link>
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <textarea
                        rows={8}
                        className={styles.fieldTextarea}
                        placeholder={`Write the ${label.toLowerCase()} here (supports headings with ### and bullets with •)...`}
                        value={currentVal}
                        onChange={(e) => update('policies', { [key]: e.target.value })}
                      />
                      <p className={styles.fieldHint}>
                        Tip: Use <strong>### Heading</strong> for section titles, and <strong>• Bullet point</strong> for lists.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <SaveBar onSave={() => save('policies')} saving={savingKey === 'policies'} />
          </section>
        )}
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`${styles.toast} ${toast.type === 'error' ? styles.toastError : styles.toastSuccess}`}
          role="status"
        >
          <FontAwesomeIcon icon={toast.type === 'error' ? faCircleExclamation : faCircleCheck} />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function SaveBar({ onSave, saving }) {
  return (
    <div className={styles.saveBar}>
      <button type="button" className={styles.saveBtn} onClick={onSave} disabled={saving}>
        <FontAwesomeIcon icon={faFloppyDisk} />
        <span>{saving ? 'Saving changes...' : 'Save changes'}</span>
      </button>
    </div>
  );
}
