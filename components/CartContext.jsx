'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shippingConfig, setShippingConfig] = useState({ flat_rate: 200, free_threshold: 0 });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bm-cart');
      if (saved) {
        const parsedParams = JSON.parse(saved);
        setItems(parsedParams);
        
        const savedSel = localStorage.getItem('bm-cart-sel');
        if (savedSel) {
          setSelectedKeys(JSON.parse(savedSel));
        } else {
          setSelectedKeys(parsedParams.map(i => i.key));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('bm-cart', JSON.stringify(items));
    localStorage.setItem('bm-cart-sel', JSON.stringify(selectedKeys));
  }, [items, selectedKeys]);

  useEffect(() => {
    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        if (data?.shipping) {
          setShippingConfig({
            flat_rate: Number(data.shipping.flat_rate) || 0,
            free_threshold: Number(data.shipping.free_threshold) || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const addToCart = (product, variant, quantity = 1, openSidebar = true) => {
    setItems(prev => {
      const key = `${product.id}-${variant}`;
      const existing = prev.find(i => i.key === key);
      
      const price = product.variants ? (parseInt(product.variants[variant], 10) || 0) : 0;

      if (existing) {
        return prev.map(i => i.key === key
          ? { ...i, qty: i.qty + (quantity || 1), price: price || i.price }
          : i);
      }
      return [...prev, {
        key,
        id: product.id,
        name: product.name,
        variant,
        price: price,
        image: product.image,
        qty: quantity || 1,
      }];
    });
    const key = `${product.id}-${variant}`;
    setSelectedKeys(prev => prev.includes(key) ? prev : [...prev, key]);
    if (openSidebar) setSidebarOpen(true);
  };

  const addDealToCart = (deal, quantity = 1, openSidebar = true) => {
    const dealItems = Array.isArray(deal?.items)
      ? deal.items.filter((item) => item?.product_id && item?.variant)
      : [];

    if (dealItems.length === 0) return;

    const key = `deal-${deal.id}`;
    const qtyToAdd = quantity || 1;
    const itemKeys = new Set(dealItems.map((item) => `${item.product_id}-${item.variant}`));
    const price = dealItems.reduce((sum, item) => sum + (Number(item.sale_price) || 0), 0);
    const originalPrice = dealItems.reduce(
      (sum, item) => sum + (Number(item.original_price) || 0),
      0
    );

    const comboItem = {
      key,
      isDeal: true,
      dealId: deal.id,
      id: key,
      name: deal.title || `${dealItems.length}-Product Combo`,
      variant: `${dealItems.length} products`,
      image: deal.image || dealItems[0]?.product_image || '',
      price,
      originalPrice,
      qty: qtyToAdd,
      items: dealItems.map((item) => ({
        id: item.product_id,
        name: item.product_name,
        variant: item.variant,
        price: Number(item.sale_price) || 0,
        originalPrice: Number(item.original_price) || 0,
        image: item.product_image,
        qty: 1,
      })),
    };

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      const cleaned = prev.filter(
        (item) => item.key === key || item.isDeal || !itemKeys.has(item.key)
      );

      if (existing) {
        return cleaned.map((item) =>
          item.key === key ? { ...item, qty: item.qty + qtyToAdd } : item
        );
      }

      return [...cleaned, comboItem];
    });

    setSelectedKeys((prev) => {
      const cleaned = prev.filter((key) => !itemKeys.has(key));
      return cleaned.includes(key) ? cleaned : [...cleaned, key];
    });

    if (openSidebar) setSidebarOpen(true);
  };

  const removeFromCart = (key) => {
    setItems(prev => prev.filter(i => i.key !== key));
    setSelectedKeys(prev => prev.filter(k => k !== key));
  };

  const toggleSelection = (key) => {
    setSelectedKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const updateQty = (key, qty) => {
    if (qty < 1) { removeFromCart(key); return; }
    setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };

  const clearCart = () => {
    setItems([]);
    setSelectedKeys([]);
  };

  const clearSelectedCart = () => {
    setItems(prev => prev.filter(i => !selectedKeys.includes(i.key)));
    setSelectedKeys([]);
  };

  const selectedItems = items.filter(i => selectedKeys.includes(i.key));
  const subtotal = selectedItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = shippingConfig.free_threshold > 0 && subtotal >= shippingConfig.free_threshold
    ? 0
    : shippingConfig.flat_rate;
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, selectedKeys, toggleSelection, addToCart, addDealToCart, removeFromCart, updateQty, clearCart, clearSelectedCart,
      subtotal, shipping, total, itemCount, shippingConfig,
      sidebarOpen, setSidebarOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
