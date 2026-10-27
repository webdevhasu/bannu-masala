import PolicyPage from '@/components/PolicyPage';
import { getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shipping Policy | Bannu Masala',
  description: 'Delivery charges, areas, and timelines for Bannu Masala orders.',
};

export default async function ShippingPolicyPage() {
  const settings = await getAllSettings();

  return (
    <PolicyPage
      title="Shipping Policy"
      description="Everything you need to know about delivery charges and timelines."
      content={settings.policies.shipping}
      activeHref="/shipping-policy"
    />
  );
}
