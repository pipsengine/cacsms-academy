import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { featuresPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(featuresPageContent);

export default function FeaturesPage() {
  return <PublicPageTemplate content={featuresPageContent} />;
}
