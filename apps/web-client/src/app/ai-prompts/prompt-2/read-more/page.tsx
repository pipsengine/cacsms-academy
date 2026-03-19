import DashboardLayout from '@/components/DashboardLayout';
import ForexCourseUnitReadMore from '@/components/ForexCourseUnitReadMore';

export default function Prompt2ReadMorePage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-medium text-zinc-100">Forex Course Topic Details</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Full lesson breakdown with concept explanation, practical application, and assignment flow where applicable.
          </p>
        </div>

        <ForexCourseUnitReadMore />
      </div>
    </DashboardLayout>
  );
}
