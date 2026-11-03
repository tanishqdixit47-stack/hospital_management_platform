import { useState } from 'react';
import FormField from './FormField.jsx';
import FormActions from './FormActions.jsx';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const empty = { name: '', dateOfBirth: '', gender: 'Male', phone: '', address: '', bloodGroup: 'O+', medicalCondition: '', isActive: true };

export default function PatientForm({ initial, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(initial ? { ...initial, dateOfBirth: initial.dateOfBirth?.slice(0, 10) } : empty);
  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, isActive: form.isActive === true || form.isActive === 'true' });
      }}
      className="space-y-4"
    >
      <FormField label="Full name">
        <input className="input" name="name" value={form.name} onChange={set} required minLength={2} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Date of birth">
          <input className="input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={set} max={new Date().toISOString().slice(0, 10)} required />
        </FormField>
        <FormField label="Gender">
          <select className="input" name="gender" value={form.gender} onChange={set}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </FormField>
        <FormField label="Phone number">
          <input className="input" name="phone" value={form.phone} onChange={set} required pattern="[0-9+\-\s]{7,15}" title="7-15 digits" />
        </FormField>
        <FormField label="Blood group">
          <select className="input" name="bloodGroup" value={form.bloodGroup} onChange={set}>
            {BLOOD_GROUPS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </FormField>
      </div>
      <FormField label="Address">
        <input className="input" name="address" value={form.address} onChange={set} required />
      </FormField>
      <FormField label="Medical condition">
        <input className="input" name="medicalCondition" value={form.medicalCondition} onChange={set} placeholder="None" />
      </FormField>
      {initial && (
        <FormField label="Record status">
          <select className="input" name="isActive" value={String(form.isActive)} onChange={set}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </FormField>
      )}
      <FormActions onCancel={onCancel} saving={saving} submitLabel={initial ? 'Save changes' : 'Add patient'} />
    </form>
  );
}
