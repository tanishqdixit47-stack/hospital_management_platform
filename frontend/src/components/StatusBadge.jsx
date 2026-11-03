const styles = {
  Scheduled: 'bg-blue-50 text-blue-700',
  Completed: 'bg-green-50 text-green-700',
  Cancelled: 'bg-slate-100 text-slate-600',
  Active: 'bg-green-50 text-green-700',
  Inactive: 'bg-amber-50 text-amber-700',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles.Cancelled}`}>
      {status}
    </span>
  );
}
