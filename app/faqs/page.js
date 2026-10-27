import PolicyPage from '@/components/PolicyPage';
import { getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'FAQs | Bannu Masala',
  description: 'Frequently asked questions about Bannu Masala products, orders, and delivery.',
};

export default async function FaqsPage() {
  const settings = await getAllSettings();

  return (
    <PolicyPage
      title="Frequently Asked Questions"
      description="Quick answers to common questions about our products and orders."
      content={settings.policies.faq}
      activeHref="/faqs"
    />
  );
}
