interface StatCardProps {
  label: string;
  value: string;
  change: string;
}

export default function StatCard({ label, value, change }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-zinc-900">{value}</p>
      <p className="mt-2 text-sm text-zinc-500">{change}</p>
    </div>
  );
}
