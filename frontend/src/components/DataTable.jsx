export default function DataTable({ columns, rows, loading, empty = 'No records found.' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            {columns.map((c) => (
              <th key={c.header} className="whitespace-nowrap px-4 py-3 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">Loading…</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">{empty}</td></tr>
          ) : (
            rows.map((row) => (
              <tr key={row._id} className="border-t border-line">
                {columns.map((c) => (
                  <td key={c.header} className="px-4 py-3 align-middle">{c.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
