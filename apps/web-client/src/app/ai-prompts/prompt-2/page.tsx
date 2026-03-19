import DashboardLayout from '@/components/DashboardLayout';
import ForexCourseUnitGenerator from '@/components/ForexCourseUnitGenerator';

export default function Prompt2Page() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        <div>
          <h2 className="text-xl font-medium text-zinc-100">Forex Course Generator</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Predefined courses and topics are listed below. Select week/day to generate structured daily learning units with summary, full lesson, and Saturday assignment flow.
          </p>
        </div>

        <ForexCourseUnitGenerator />
      </div>
    </DashboardLayout>
  );
}
