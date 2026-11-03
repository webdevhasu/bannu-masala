'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function OrderAppSetup() {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    setIsIOS(ios);
    setIsStandalone(standalone);

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }

    if (ios && !standalone) {
      setStatus('ios-install');
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }

    let cancelled = false;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(() => navigator.serviceWorker.ready)
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (cancelled) return;
        setStatus(subscription ? 'subscribed' : 'prompt');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleEnable = async () => {
    setBusy(true);
    setMessage('');

    try {
      if (!('Notification' in window)) {
        setStatus('unsupported');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setMessage('Notifications are blocked. Allow them from your browser settings.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const keyResponse = await fetch('/api/admin/push/public-key', { cache: 'no-store' });
        const keyData = await keyResponse.json().catch(() => null);

        if (!keyResponse.ok || !keyData?.publicKey) {
          throw new Error(keyData?.error || 'Push notifications are not configured.');
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
        });
      }

      const saveResponse = await fetch('/api/admin/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      if (!saveResponse.ok) {
        const data = await saveResponse.json().catch(() => null);
        throw new Error(data?.error || 'Failed to save notification settings.');
      }

      setStatus('subscribed');
      setMessage('Order alerts are enabled on this device.');
    } catch (error) {
      setMessage(error.message || 'Could not enable notifications.');
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/push/test', { method: 'POST' });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Test notification failed.');
      }

      if (data?.skipped) {
        setMessage('Push is not configured on the server.');
      } else if (data?.sent > 0) {
        setMessage('Test notification sent. Check your notifications.');
      } else {
        setMessage('No subscribed devices found.');
      }
    } catch (error) {
      setMessage(error.message || 'Test notification failed.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'checking') return null;
  if (status === 'unsupported') return null;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <div style={{ minWidth: '240px' }}>
        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>
          {status === 'subscribed' ? 'Order alerts are on' : 'Get order alerts on this device'}
        </div>
        <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '3px' }}>
          {status === 'ios-install'
            ? 'iPhone par notifications ke liye Safari mein Share > Add to Home Screen karein, phir app kholein.'
            : status === 'subscribed'
              ? 'Naya order aane par notification milegi, app band ho tab bhi.'
              : 'Install the app and enable notifications to hear new orders instantly.'}
        </div>
        {message && (
          <div style={{ color: '#0f766e', fontSize: '0.8rem', marginTop: '6px' }}>{message}</div>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {installPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            style={{
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
              borderRadius: '9px',
              padding: '9px 14px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Install App
          </button>
        )}

        {status === 'prompt' && (
          <button
            type="button"
            onClick={handleEnable}
            disabled={busy}
            style={{
              border: 'none',
              background: '#800000',
              color: '#ffffff',
              borderRadius: '9px',
              padding: '9px 14px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: busy ? 'default' : 'pointer',
            }}
          >
            {busy ? 'Enabling...' : 'Enable Order Alerts'}
          </button>
        )}

        {status === 'subscribed' && (
          <button
            type="button"
            onClick={handleTest}
            disabled={busy}
            style={{
              border: '1px solid #bbf7d0',
              background: '#f0fdf4',
              color: '#15803d',
              borderRadius: '9px',
              padding: '9px 14px',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: busy ? 'default' : 'pointer',
            }}
          >
            {busy ? 'Sending...' : 'Send Test Notification'}
          </button>
        )}

        {isIOS && !isStandalone && status === 'ios-install' && (
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#92400e',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '9px',
              padding: '9px 12px',
            }}
          >
            Home Screen install required
          </span>
        )}
      </div>
    </div>
  );
}
