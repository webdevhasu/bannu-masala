import PolicyPage from '@/components/PolicyPage';
import { getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Returns & Refunds Policy | Bannu Masala',
  description: 'Returns, refunds, and cancellation information for Bannu Masala orders.',
};

export default async function ReturnsPolicyPage() {
  const settings = await getAllSettings();

  return (
    <PolicyPage
      title="Returns & Refunds"
      description="How returns, refunds, and cancellations are handled."
      content={settings.policies.returns}
      activeHref="/returns-policy"
    />
  );
}
