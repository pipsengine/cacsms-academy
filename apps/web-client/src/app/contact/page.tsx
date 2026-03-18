import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { contactPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(contactPageContent);

export default function ContactPage() {
  return <PublicPageTemplate content={contactPageContent} />;
}
