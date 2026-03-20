import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { FaqQuickNavigationSection } from '@/components/PublicPageVisualSections';
import { faqPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(faqPageContent);

export default function FaqPage() {
  return (
    <PublicPageTemplate content={faqPageContent}>
      <FaqQuickNavigationSection />
    </PublicPageTemplate>
  );
}
