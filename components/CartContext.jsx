'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bm-cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('bm-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, variant, quantity = 1, openSidebar = true) => {
    setItems(prev => {
      const key = `${product.id}-${variant}`;
      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i => i.key === key ? { ...i, qty: i.qty + (quantity || 1) } : i);
      }
      return [...prev, {
        key,
        id: product.id,
        name: product.name,
        variant,
        price: product.variants[variant],
        image: product.image,
        qty: quantity || 1,
      }];
    });
    if (openSidebar) setSidebarOpen(true);
  };

  const removeFromCart = (key) => setItems(prev => prev.filter(i => i.key !== key));

  const updateQty = (key, qty) => {
    if (qty < 1) { removeFromCart(key); return; }
    setItems(prev => prev.map(i => i.key === key ? { ...i, qty } : i));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal >= 3000 ? 0 : (subtotal > 0 ? 200 : 0);
  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQty, clearCart,
      subtotal, shipping, total, itemCount,
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
