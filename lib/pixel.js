'use client';

/**
 * Helper to safely send Facebook/Meta Pixel standard events
 * Docs: https://developers.facebook.com/docs/meta-pixel/reference
 */
export function trackMetaEvent(eventName, params = {}) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params);
    } catch (err) {
      console.warn(`[Meta Pixel] Failed to track ${eventName}:`, err);
    }
  }
}

/**
 * Common ecommerce helpers
 */
export const pixelEvents = {
  pageView: () => {
    trackMetaEvent('PageView');
  },
  viewContent: ({ id, name, category, price, currency = 'PKR' }) => {
    trackMetaEvent('ViewContent', {
      content_ids: id ? [String(id)] : [],
      content_name: name || '',
      content_category: category || 'Spices',
      content_type: 'product',
      value: Number(price) || 0,
      currency,
    });
  },
  addToCart: ({ id, name, variant, price, quantity = 1, currency = 'PKR' }) => {
    const singlePrice = Number(price) || 0;
    const qty = Number(quantity) || 1;
    trackMetaEvent('AddToCart', {
      content_ids: id ? [String(id)] : [],
      content_name: name ? `${name}${variant ? ` - ${variant}` : ''}` : '',
      content_type: 'product',
      value: singlePrice * qty,
      currency,
      num_items: qty,
    });
  },
  initiateCheckout: ({ items = [], totalValue = 0, currency = 'PKR' }) => {
    trackMetaEvent('InitiateCheckout', {
      content_ids: items.map((i) => String(i.id || i.product_id)).filter(Boolean),
      contents: items.map((i) => ({
        id: String(i.id || i.product_id),
        quantity: i.qty || i.quantity || 1,
        item_price: Number(i.price) || 0,
      })),
      content_type: 'product',
      num_items: items.reduce((acc, i) => acc + (Number(i.qty || i.quantity) || 1), 0),
      value: Number(totalValue) || 0,
      currency,
    });
  },
  purchase: ({ orderId, items = [], totalValue = 0, currency = 'PKR' }) => {
    trackMetaEvent('Purchase', {
      content_ids: items.map((i) => String(i.id || i.product_id)).filter(Boolean),
      contents: items.map((i) => ({
        id: String(i.id || i.product_id),
        quantity: i.qty || i.quantity || 1,
        item_price: Number(i.price) || 0,
      })),
      content_type: 'product',
      num_items: items.reduce((acc, i) => acc + (Number(i.qty || i.quantity) || 1), 0),
      value: Number(totalValue) || 0,
      currency,
      order_id: String(orderId || ''),
    });
  },
};

