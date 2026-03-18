import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { careersPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(careersPageContent);

export default function CareersPage() {
  return <PublicPageTemplate content={careersPageContent} />;
}
