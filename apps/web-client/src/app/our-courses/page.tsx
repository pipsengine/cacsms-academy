import DashboardLayout from '@/components/DashboardLayout';
import AppSectionLayout from '@/components/AppSectionLayout';
import ForexCourseUnitGenerator from '@/components/ForexCourseUnitGenerator';
import { forexCourseCurriculum } from '@/lib/learning/curriculum';

export default function OurCoursesPage() {
  return (
    <DashboardLayout>
      <AppSectionLayout
        title="Our Courses"
        description="Structured weekly forex curriculum with daily topics and Saturday practical assignments."
        navItems={[
          { id: 'curriculum', label: 'Curriculum', helper: 'Week-by-week course modules' },
          { id: 'generator', label: 'Generate Topic Unit', helper: 'Create lesson and assignment output' },
          { id: 'navigation', label: 'Topic Navigation', helper: 'Use read more to move into full topic pages' },
        ]}
      >
        <section id="curriculum" className="scroll-mt-28 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Curriculum</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {forexCourseCurriculum.map((week) => (
              <div key={week.week} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">Week {week.week}</p>
                <h4 className="mt-2 text-sm font-semibold text-zinc-100">{week.module}</h4>
                <p className="mt-1 text-xs text-zinc-400">Level: {week.level}</p>
                <ul className="mt-3 space-y-1.5 text-xs text-zinc-300">
                  <li><span className="text-zinc-500">Mon:</span> {week.topics.Monday}</li>
                  <li><span className="text-zinc-500">Tue:</span> {week.topics.Tuesday}</li>
                  <li><span className="text-zinc-500">Wed:</span> {week.topics.Wednesday}</li>
                  <li><span className="text-zinc-500">Thu:</span> {week.topics.Thursday}</li>
                  <li><span className="text-zinc-500">Fri:</span> {week.topics.Friday}</li>
                  <li><span className="text-zinc-500">Sat:</span> {week.topics.Saturday}</li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="generator" className="scroll-mt-28">
          <ForexCourseUnitGenerator />
        </section>

        <section id="navigation" className="scroll-mt-28 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-500">Topic Navigation</h3>
          <p className="mt-3 text-sm text-zinc-300">
            After generating a topic unit, use the Read More button to open the dedicated topic explanation page. That page includes previous and next topic links in the sidebar so learners can move through the curriculum in order.
          </p>
        </section>
      </AppSectionLayout>
    </DashboardLayout>
  );
}
