import PolicyPage from '@/components/PolicyPage';
import { getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Terms & Conditions | Bannu Masala',
  description: 'Terms and conditions for using the Bannu Masala website and placing orders.',
};

export default async function TermsPage() {
  const settings = await getAllSettings();

  return (
    <PolicyPage
      title="Terms & Conditions"
      description="The terms that apply when you use our website and place an order."
      content={settings.policies.terms}
      activeHref="/terms-and-conditions"
    />
  );
}
