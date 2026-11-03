export default function FormActions({ onCancel, saving, submitLabel }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving…' : submitLabel}
      </button>
    </div>
  );
}
