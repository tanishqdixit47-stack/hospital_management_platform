export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-line bg-white p-5">
      <div className="rounded-lg bg-primary-soft p-3 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
