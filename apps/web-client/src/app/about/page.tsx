import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import { aboutPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(aboutPageContent);

export default function AboutPage() {
  return <PublicPageTemplate content={aboutPageContent} />;
}
