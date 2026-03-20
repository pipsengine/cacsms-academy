import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { PlatformWorkflowMapSection } from '@/components/PublicPageVisualSections';
import { platformPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(platformPageContent);

export default function PlatformPage() {
  return (
    <PublicPageTemplate content={platformPageContent}>
      <PlatformWorkflowMapSection />
    </PublicPageTemplate>
  );
}
