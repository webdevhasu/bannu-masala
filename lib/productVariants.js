function asInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseCustomVariants(customVariants) {
  if (!customVariants) return [];
  if (Array.isArray(customVariants)) return customVariants;

  if (typeof customVariants === 'string') {
    try {
      const parsed = JSON.parse(customVariants);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

export function buildVariantsMap(productRow) {
  const variants = {
    '250g': asInt(productRow?.price_250g),
    '500g': asInt(productRow?.price_500g),
    '1kg': asInt(productRow?.price_1kg),
  };

  for (const v of parseCustomVariants(productRow?.custom_variants)) {
    if (!v) continue;
    const label = typeof v.label === 'string' ? v.label.trim() : '';
    const price = asInt(v.price);
    if (!label || price <= 0) continue;
    variants[label] = price;
  }

  return variants;
}

