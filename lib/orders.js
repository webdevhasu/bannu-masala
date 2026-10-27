export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'dispatched',
  'delivered',
  'returned',
  'cancelled',
];

export const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  dispatched: 'Dispatched',
  shipped: 'Dispatched', // legacy alias
  completed: 'Delivered', // legacy alias
  delivered: 'Delivered',
  returned: 'Returned',
  cancelled: 'Cancelled',
};

export const STATUS_FLOW = ['pending', 'confirmed', 'dispatched', 'delivered'];

export const STATUS_MESSAGES = {
  pending: 'Aap ka order receive ho gaya hai. Stock aur delivery confirm karke jaldi update denge, InshaAllah.',
  confirmed: 'Aap ka order confirm ho gaya hai aur fresh packing ke liye tayyar kiya ja raha hai.',
  dispatched: 'Aap ka order dispatch ho gaya hai. Courier aur live tracking details neeche mojood hain.',
  delivered: 'Aap ka order deliver ho gaya hai. Bannu Masala se shopping karne ka bohot shukriya!',
  returned: 'Aap ka order return process mein hai. Agar koi masla hai to hamari team se rabta karein.',
  cancelled: 'Aap ka order cancel kar diya gaya hai. Agar yeh ghalti se hua hai to foran humein WhatsApp par batayein.',
};

export function normalizeStatus(status) {
  if (status === 'shipped') return 'dispatched';
  if (status === 'completed') return 'delivered';
  return status || 'pending';
}

export function formatMoney(n) {
  const num = Number(n) || 0;
  return `Rs ${num.toLocaleString()}`;
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Karachi',
  });
}

/** Convert local 03XXXXXXXXX to international 923XXXXXXXXX */
export function pakistanWhatsAppNumber(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('00')) return digits.slice(2);
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return `92${digits}`;
}

/** Best-effort deep links for couriers commonly used in Pakistan */
export function getCourierTrackingUrl(courierName, trackingNumber) {
  const courier = String(courierName || '').trim().toLowerCase();
  const tracking = String(trackingNumber || '').trim();
  if (!courier || !tracking) return null;
  const encoded = encodeURIComponent(tracking);

  if (courier.includes('leopard')) return `https://www.leopardscourier.com/tracking?cn=${encoded}`;
  if (courier.includes('postex')) return `https://postex.pk/tracking?tracking_number=${encoded}`;
  if (courier.includes('trax')) return `https://trax.pk/tracking?tracking_number=${encoded}`;
  if (courier.includes('tcs')) return `https://www.tcsexpress.com/track/${encoded}`;
  if (courier.includes('m&p') || courier.includes('mnp')) return `https://www.mulphilog.com/track-shipment/?cn=${encoded}`;
  if (courier.includes('callcourier')) return `https://callcourier.com.pk/tracking/?tc=${encoded}`;
  return null;
}

export function generateWhatsAppOrderMessage(order, status, settings = {}) {
  const normStatus = normalizeStatus(status);
  const orderNumber = `BM-${order.id}`;
  const storeName = settings?.store?.name || 'Bannu Masala';
  const helpline  = settings?.store?.phone || '+92 309 9907713';

  const itemsList = Array.isArray(order.items) && order.items.length > 0
    ? order.items
        .map((i) => `  • ${i.product_name || i.name} (${i.variant || 'Standard'}) x${i.quantity || i.qty}  —  ${formatMoney(i.price * (i.quantity || i.qty))}`)
        .join('\n')
    : '  • Spices Package';

  /* ─── PENDING — Special order confirmation message ─── */
  if (normStatus === 'pending') {
    const deliveryLine = Number(order.shipping) === 0
      ? 'FREE 🎁'
      : formatMoney(order.shipping);

    return [
      `Assalam-o-Alaikum *${order.customer_name || 'Customer'}* 🌿`,
      '',
      `Aap ka *Bannu Masala* mein order aa gaya hai — Shukriya! 🎉`,
      '',
      `━━━━━━━━━━━━━━━━━━━━━`,
      `🧾 *ORDER SUMMARY*`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      `📦 Order No:  *#${orderNumber}*`,
      ``,
      `*Ordered Items:*`,
      itemsList,
      ``,
      `💰 Subtotal:   ${formatMoney(order.subtotal)}`,
      `🚚 Delivery:   ${deliveryLine}`,
      `*💵 Total:      ${formatMoney(order.total)}*`,
      `💳 Payment:   ${order.payment_method || 'Cash on Delivery'}`,
      ``,
      `📍 *Delivery Address:*`,
      `   ${order.city || ''}`,
      `   ${order.address || ''}`,
      `━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `Baraye meherbani apna order *confirm* farmaein:`,
      ``,
      `✅ *YES* — Haan, order confirm hai`,
      `❌ *NO*  — Nahi, order cancel kar dein`,
      ``,
      `Agar koi cheez change karwani ho (address, quantity) to bhi abhi batayein.`,
      ``,
      `— *${storeName}*`,
      `📞 ${helpline}`,
    ].join('\n');
  }

  /* ─── OTHER STATUSES — existing template ─── */
  const statusMsg = STATUS_MESSAGES[normStatus] || STATUS_MESSAGES.pending;

  const trackingUrl = getCourierTrackingUrl(order.courier_name, order.tracking_number);
  const siteUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://bannumasala.com';

  const productSlug = order.items?.find((i) => i.slug)?.slug;
  const reviewLink = productSlug
    ? `${siteUrl}/products/${productSlug}#reviews`
    : `${siteUrl}/reviews`;

  const reviewSection =
    normStatus === 'delivered'
      ? [
          '',
          'Umeed hai aapko hamaray masalay pasand aayenge! Hamari hosla afzai ke liye baraye meherbani 1 minute nikaal kar apna review zaroor dein:',
          `⭐ *Apna Review Yahan Dein:*`,
          reviewLink,
        ]
      : [];

  const shipmentInfo =
    order.courier_name && order.tracking_number
      ? `\nCourier: ${order.courier_name}\nTracking ID: ${order.tracking_number}${trackingUrl ? `\nLive Tracking: ${trackingUrl}` : ''}`
      : '';

  return [
    `Assalam-o-Alaikum ${order.customer_name || 'Customer'},`,
    '',
    statusMsg,
    ...reviewSection,
    '',
    `*Order Number:* #${orderNumber}`,
    `*Status:* ${STATUS_LABELS[normStatus] || normStatus}`,
    '',
    '*Items:*',
    itemsList,
    '',
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Delivery: ${Number(order.shipping) === 0 ? 'FREE' : formatMoney(order.shipping)}`,
    `*Total Bill: ${formatMoney(order.total)} (${order.payment_method || 'Cash on Delivery'})*`,
    shipmentInfo,
    '',
    `Delivering to: ${order.city || ''}, ${order.address || ''}`,
    '',
    `Shukriya!\n${storeName}\nHelpline: ${helpline}`,
  ]
    .filter((line) => line !== null && line !== undefined)
    .join('\n');
}

export function whatsappUpdateUrl(order, status, settings = {}) {
  const customerWhatsApp = pakistanWhatsAppNumber(order.phone || order.customerPhone);
  if (!customerWhatsApp) return '#';
  const text = generateWhatsAppOrderMessage(order, status, settings);
  return `https://wa.me/${customerWhatsApp}?text=${encodeURIComponent(text)}`;
}
