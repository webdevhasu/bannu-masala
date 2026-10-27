'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || 'Login failed');
      }

      const target = nextPath.startsWith('/') && !nextPath.startsWith('//') ? nextPath : '/dashboard';
      router.replace(target);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Image src="/logo.png" alt="Bannu Masala" width={64} height={64} className={styles.logo} />
          <div>
            <p className={styles.brandTop}>Bannu Masala</p>
            <h1 className={styles.title}>Admin Panel</h1>
          </div>
        </div>

        <p className={styles.subtitle}>Sign in to manage products, deals, orders and site content.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className={styles.input}
              value={form.username}
              onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={styles.input}
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              required
            />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <Link href="/" className={styles.backLink}>← Back to store</Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className={styles.page}><div className={styles.card}>Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
