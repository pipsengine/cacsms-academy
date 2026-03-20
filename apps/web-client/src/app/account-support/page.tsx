import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { AccountSupportChecklistSection } from '@/components/PublicPageVisualSections';
import { accountSupportPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(accountSupportPageContent);

export default function AccountSupportPage() {
  return (
    <PublicPageTemplate content={accountSupportPageContent}>
      <AccountSupportChecklistSection />
    </PublicPageTemplate>
  );
}
