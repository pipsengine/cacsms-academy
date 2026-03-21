import DashboardLayout from '@/components/DashboardLayout';

export default function Prompt3Page() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-medium text-zinc-900">Prompt 3</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Route is ready. Share Prompt 3 spec and I will implement it here after Prompt 2.
        </p>
      </div>
    </DashboardLayout>
  );
}
