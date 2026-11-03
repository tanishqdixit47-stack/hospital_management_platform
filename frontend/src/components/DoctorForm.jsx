import { useState } from 'react';
import FormField from './FormField.jsx';
import FormActions from './FormActions.jsx';

const empty = { name: '', specialization: '', phone: '', department: '', consultationFee: '' };

export default function DoctorForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial || empty);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, consultationFee: Number(form.consultationFee) });
      }}
      className="space-y-4"
    >
      <FormField label="Full name">
        <input className="input" name="name" value={form.name} onChange={set} required minLength={2} placeholder="Dr. " />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Specialization">
          <input className="input" name="specialization" value={form.specialization} onChange={set} required />
        </FormField>
        <FormField label="Department">
          <input className="input" name="department" value={form.department} onChange={set} required />
        </FormField>
        <FormField label="Phone number">
          <input className="input" name="phone" value={form.phone} onChange={set} required pattern="[0-9+\-\s]{7,15}" title="7-15 digits" />
        </FormField>
        <FormField label="Consultation fee (₹)">
          <input className="input" type="number" min="0" name="consultationFee" value={form.consultationFee} onChange={set} required />
        </FormField>
      </div>
      <FormActions onCancel={onCancel} saving={saving} submitLabel={initial ? 'Save changes' : 'Add doctor'} />
    </form>
  );
}
