import DashboardLayout from '@/components/DashboardLayout';

export default function Prompt3Page() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xl font-medium text-zinc-100">Prompt 3</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Route is ready. Share Prompt 3 spec and I will implement it here after Prompt 2.
        </p>
      </div>
    </DashboardLayout>
  );
}
