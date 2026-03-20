import { redirect } from 'next/navigation';
import ForexCourseUnitReadMore from '@/components/ForexCourseUnitReadMore';

type CourseTopicPageProps = {
  searchParams?: Promise<{
    slug?: string;
  }>;
};

export default async function CourseTopicPage({ searchParams }: CourseTopicPageProps) {
  const params = await searchParams;
  const slug = params?.slug ? decodeURIComponent(params.slug) : null;

  if (slug) {
    redirect(`/our-courses/lesson/${encodeURIComponent(slug)}`);
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-xl font-medium text-zinc-900">Course Topic Details</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Full lesson explanation with topic context, previous and next navigation, and practical application guidance.
        </p>
      </div>

      <ForexCourseUnitReadMore />
    </div>
  );
}
