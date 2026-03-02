import StatCard from "@/src/components/instructor/dashboard/StatCard";

const stats = [
  { label: "Active Reading Levels", value: "12", change: "+2 this month" },
  { label: "Published Passages", value: "84", change: "+9 this week" },
  { label: "Question Sets", value: "146", change: "+14 this week" },
  { label: "Monitoring Alerts", value: "07", change: "3 need review" },
];

export default function InstructorDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-indigo-600">Welcome back</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Instructor Dashboard Overview
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Track content operations, monitor reading activity, and manage the IELTS learning pipeline from one place.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            change={item.change}
          />
        ))}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-zinc-900">Today’s Focus</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-800">Review reading progression</p>
            <p className="mt-1 text-sm text-zinc-500">Validate level progress and pending monitor alerts.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-800">Publish learning content</p>
            <p className="mt-1 text-sm text-zinc-500">Prepare new passages and question sets for release.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="text-sm font-medium text-zinc-800">Manage weakness tags</p>
            <p className="mt-1 text-sm text-zinc-500">Refine trap labels to improve mistake analytics.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
