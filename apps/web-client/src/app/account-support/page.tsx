import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { accountSupportPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(accountSupportPageContent);

export default function AccountSupportPage() {
  return <PublicPageTemplate content={accountSupportPageContent} />;
}
