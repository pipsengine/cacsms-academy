import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { helpCenterPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(helpCenterPageContent);

export default function HelpCenterPage() {
  return <PublicPageTemplate content={helpCenterPageContent} />;
}
