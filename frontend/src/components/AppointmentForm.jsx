import { useEffect, useState } from 'react';
import FormField from './FormField.jsx';
import FormActions from './FormActions.jsx';
import { patientApi, doctorApi, getErrorMessage } from '../services/api.js';
import { useToast } from './Toast.jsx';
import { formatCurrency } from '../utils/format.js';

const empty = { patient: '', doctor: '', appointmentDate: '', reason: '', status: 'Scheduled' };

export default function AppointmentForm({ initial, onSubmit, onCancel, saving }) {
  const toast = useToast();
  const [form, setForm] = useState(initial || empty);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Dropdown options come from MongoDB, not from hardcoded lists.
  useEffect(() => {
    Promise.all([patientApi.list({ active: true }), doctorApi.list()])
      .then(([p, d]) => {
        setPatients(p);
        setDoctors(d);
      })
      .catch((e) => toast.error(getErrorMessage(e)));
  }, [toast]);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...form, appointmentDate: new Date(form.appointmentDate).toISOString() });
      }}
      className="space-y-4"
    >
      <FormField label="Patient">
        <select className="input" name="patient" value={form.patient} onChange={set} required>
          <option value="">Select a patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.name} ({p.patientId})</option>
          ))}
        </select>
      </FormField>
      <FormField label="Doctor">
        <select className="input" name="doctor" value={form.doctor} onChange={set} required>
          <option value="">Select a doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>{d.name}, {d.specialization} ({formatCurrency(d.consultationFee)})</option>
          ))}
        </select>
      </FormField>
      <FormField label="Date and time">
        <input className="input" type="datetime-local" name="appointmentDate" value={form.appointmentDate} onChange={set} required />
      </FormField>
      <FormField label="Reason for visit">
        <input className="input" name="reason" value={form.reason} onChange={set} required minLength={3} />
      </FormField>
      {initial && (
        <FormField label="Status">
          <select className="input" name="status" value={form.status} onChange={set}>
            <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
          </select>
        </FormField>
      )}
      <FormActions onCancel={onCancel} saving={saving} submitLabel={initial ? 'Save changes' : 'Schedule appointment'} />
    </form>
  );
}
