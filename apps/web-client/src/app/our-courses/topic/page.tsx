import DashboardLayout from '@/components/DashboardLayout';
import ForexCourseUnitReadMore from '@/components/ForexCourseUnitReadMore';

export default function CourseTopicPage() {
  return (
    <DashboardLayout>
      <div className="max-w-6xl space-y-6">
        <div>
          <h2 className="text-xl font-medium text-zinc-100">Course Topic Details</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Full lesson explanation with topic context, previous and next navigation, and practical application guidance.
          </p>
        </div>

        <ForexCourseUnitReadMore />
      </div>
    </DashboardLayout>
  );
}
