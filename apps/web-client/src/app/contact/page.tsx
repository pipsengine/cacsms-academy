import PublicPageTemplate, { buildPublicMetadata } from '@/components/PublicPageTemplate';
import ContactForm from '@/components/ContactForm';
import { contactPageContent } from '@/lib/public-page-content';

export const metadata = buildPublicMetadata(contactPageContent);

export default function ContactPage() {
  return (
    <PublicPageTemplate content={contactPageContent}>
      <section className="border-t border-zinc-200 bg-zinc-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </section>
    </PublicPageTemplate>
  );
}
