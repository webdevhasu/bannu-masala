'use client';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faEnvelopeOpen,
  faTrash,
  faPhone,
  faAt,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../orders/page.module.css';

const FILTERS = [
  { key: 'unread', label: 'Unread' },
  { key: 'read', label: 'Read' },
  { key: 'all', label: 'All' },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unread');
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact?t=' + Date.now());
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (msg) => {
    const nextRead = !msg.is_read;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, is_read: nextRead } : m))
    );

    try {
      const res = await fetch(`/api/contact/${msg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: nextRead }),
      });
      if (!res.ok) {
        fetchMessages();
        return;
      }
      showToast(nextRead ? 'Marked as read.' : 'Marked as unread.');
    } catch {
      fetchMessages();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message permanently?')) return;

    setMessages((prev) => prev.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Message deleted.');
      } else {
        fetchMessages();
      }
    } catch {
      fetchMessages();
    }
  };

  if (loading) return <div style={{ padding: '40px' }}>Loading messages...</div>;

  const unreadCount = messages.filter((m) => !m.is_read).length;
  const readCount = messages.length - unreadCount;

  const filtered = messages.filter((msg) => {
    if (filter === 'unread') return !msg.is_read;
    if (filter === 'read') return msg.is_read;
    return true;
  });

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className={styles.pageTitle}>
          <FontAwesomeIcon icon={faEnvelope} style={{ width: '24px', marginRight: '12px' }} />
          Contact Messages
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {FILTERS.map((item) => {
          const count = item.key === 'unread' ? unreadCount : item.key === 'read' ? readCount : messages.length;
          const active = filter === item.key;

          return (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              style={{
                padding: '9px 16px',
                borderRadius: '999px',
                border: active ? '1px solid #800000' : '1px solid #e2e8f0',
                background: active ? '#800000' : '#fff',
                color: active ? '#fff' : '#334155',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {item.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIcon}>
            <FontAwesomeIcon icon={faEnvelopeOpen} />
          </div>
          <h3>No messages here</h3>
          <p>New messages from the contact form will appear in this inbox.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filtered.map((msg) => {
            const expanded = expandedId === msg.id;

            return (
              <div
                key={msg.id}
                style={{
                  background: '#fff',
                  border: msg.is_read ? '1px solid #e2e8f0' : '1px solid #fecaca',
                  borderLeft: msg.is_read ? '4px solid #e2e8f0' : '4px solid #b91c1c',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#1e293b' }}>{msg.name}</strong>
                      {!msg.is_read && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px',
                            color: '#b91c1c',
                            background: '#fee2e2',
                            padding: '2px 8px',
                            borderRadius: '999px',
                          }}
                        >
                          New
                        </span>
                      )}
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {msg.phone && (
                        <a href={`tel:${msg.phone}`} style={{ fontSize: '0.82rem', color: '#475569', textDecoration: 'none' }}>
                          <FontAwesomeIcon icon={faPhone} style={{ marginRight: '5px', color: '#94a3b8' }} />
                          {msg.phone}
                        </a>
                      )}
                      {msg.email && (
                        <a href={`mailto:${msg.email}`} style={{ fontSize: '0.82rem', color: '#475569', textDecoration: 'none' }}>
                          <FontAwesomeIcon icon={faAt} style={{ marginRight: '5px', color: '#94a3b8' }} />
                          {msg.email}
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <button
                      onClick={() => handleToggleRead(msg)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        color: '#334155',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {msg.is_read ? 'Mark unread' : 'Mark read'}
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      style={{
                        padding: '7px 12px',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                        background: '#fff',
                        color: '#b91c1c',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                {msg.subject && (
                  <p style={{ margin: '12px 0 0', fontWeight: 700, color: '#334155', fontSize: '0.9rem' }}>
                    {msg.subject}
                  </p>
                )}

                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: '0.9rem',
                    color: '#475569',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    display: expanded ? 'block' : '-webkit-box',
                    WebkitLineClamp: expanded ? 'unset' : 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {msg.message}
                </p>

                {msg.message?.length > 180 && (
                  <button
                    onClick={() => setExpandedId(expanded ? null : msg.id)}
                    style={{
                      marginTop: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#800000',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {expanded ? 'Show less' : 'Read full message'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#10b981',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FontAwesomeIcon icon={faCircleCheck} /> {toast}
        </div>
      )}
    </div>
  );
}
