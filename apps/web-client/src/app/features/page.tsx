import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { FeaturesCapabilityMatrixSection } from '@/components/PublicPageVisualSections';
import { featuresPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(featuresPageContent);

export default function FeaturesPage() {
  return (
    <PublicPageTemplate content={featuresPageContent}>
      <FeaturesCapabilityMatrixSection />
    </PublicPageTemplate>
  );
}
