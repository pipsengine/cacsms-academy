import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { CareersRolePathSection } from '@/components/PublicPageVisualSections';
import { careersPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(careersPageContent);

export default function CareersPage() {
  return (
    <PublicPageTemplate content={careersPageContent}>
      <CareersRolePathSection />
    </PublicPageTemplate>
  );
}
