import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { technologyPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(technologyPageContent);

export default function TechnologyPage() {
  return <PublicPageTemplate content={technologyPageContent} />;
}
