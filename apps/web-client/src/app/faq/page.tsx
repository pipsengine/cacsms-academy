import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { faqPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(faqPageContent);

export default function FaqPage() {
  return <PublicPageTemplate content={faqPageContent} />;
}
