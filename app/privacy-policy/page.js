import PolicyPage from '@/components/PolicyPage';
import { getAllSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Privacy Policy | Bannu Masala',
  description: 'How Bannu Masala collects, uses, and protects customer information.',
};

export default async function PrivacyPolicyPage() {
  const settings = await getAllSettings();

  return (
    <PolicyPage
      title="Privacy Policy"
      description="How we collect, use, and protect your information."
      content={settings.policies.privacy}
      activeHref="/privacy-policy"
    />
  );
}
