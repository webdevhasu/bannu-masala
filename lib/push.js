import webpush from 'web-push';
import sql from '@/lib/db';

let configured = false;

function configure() {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@bannumasala.com';

  if (!publicKey || !privateKey) {
    console.warn('Push notifications are not configured (missing VAPID keys).');
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export function getVapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY || null;
}

export function isPushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export async function savePushSubscription(subscription, userAgent = null) {
  const endpoint = typeof subscription?.endpoint === 'string' ? subscription.endpoint.trim() : '';
  const p256dh = typeof subscription?.keys?.p256dh === 'string' ? subscription.keys.p256dh : '';
  const auth = typeof subscription?.keys?.auth === 'string' ? subscription.keys.auth : '';

  if (!endpoint || !p256dh || !auth) {
    return { error: 'Invalid push subscription' };
  }

  await sql`
    INSERT INTO push_subscriptions (endpoint, p256dh, auth, user_agent, updated_at)
    VALUES (${endpoint}, ${p256dh}, ${auth}, ${userAgent}, NOW())
    ON CONFLICT (endpoint)
    DO UPDATE SET p256dh = EXCLUDED.p256dh,
                  auth = EXCLUDED.auth,
                  user_agent = EXCLUDED.user_agent,
                  updated_at = NOW()
  `;

  return { success: true };
}

export async function removePushSubscription(endpoint) {
  if (!endpoint) return { success: false };
  await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
  return { success: true };
}

export async function sendPushToAll(payload) {
  if (!configure()) {
    return { sent: 0, failed: 0, skipped: true };
  }

  const subscriptions = await sql`
    SELECT endpoint, p256dh, auth FROM push_subscriptions
  `;

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (row) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 24 }
        );
      } catch (error) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${row.endpoint}`;
        }
        throw error;
      }
    })
  );

  const failed = results.filter((result) => result.status === 'rejected').length;

  return { sent: subscriptions.length - failed, failed };
}

export async function sendOrderPush(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  const itemSummary = items
    .slice(0, 3)
    .map((item) => `${item.qty}× ${item.name}`)
    .join(', ');
  const extra = items.length > 3 ? ` +${items.length - 3} more` : '';

  const bodyLines = [
    `#${order.id} • ${order.customerName || 'Customer'}`,
    [itemSummary, extra].filter(Boolean).join(' '),
    `Total: Rs ${Number(order.total || 0).toLocaleString()}${
      order.city ? ` • ${order.city}` : ''
    }`,
  ].filter(Boolean);

  return sendPushToAll({
    title: `New Order #${order.id}`,
    body: bodyLines.join('\n'),
    url: `/dashboard/orders?order=${order.id}`,
    tag: `bannu-order-${order.id}`,
    requireInteraction: true,
  });
}

export async function sendTestPush() {
  return sendPushToAll({
    title: 'Bannu Masala test notification',
    body: 'Order alerts are working. You will receive new order notifications here.',
    url: '/dashboard/orders',
    tag: 'bannu-test',
  });
}
