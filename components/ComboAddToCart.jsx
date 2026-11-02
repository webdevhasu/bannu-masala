'use client';
import { useCart } from './CartContext';

export default function ComboAddToCart({ deal, items, className, children }) {
  const { addDealToCart } = useCart();

  const handleAdd = () => {
    const dealItems = deal?.items || items || [];
    if (dealItems.length === 0) return;

    addDealToCart({
      id: deal?.id ?? dealItems[0]?.deal_id,
      title: deal?.title || dealItems[0]?.deal_title,
      image: deal?.image || dealItems[0]?.deal_image,
      free_delivery: Boolean(deal?.free_delivery ?? dealItems[0]?.free_delivery),
      items: dealItems,
    });
  };

  return (
    <button type="button" className={className} onClick={handleAdd}>
      {children}
    </button>
  );
}
