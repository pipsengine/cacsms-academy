import { Suspense } from 'react';
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

        <Suspense
          fallback={
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-400">
              Loading lesson details...
            </div>
          }
        >
          <ForexCourseUnitReadMore />
        </Suspense>
      </div>
    </DashboardLayout>
  );
}
