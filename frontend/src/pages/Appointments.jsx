import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import AppointmentForm from '../components/AppointmentForm.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { appointmentApi, getErrorMessage } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { formatDateTime, toLocalInput } from '../utils/format.js';

export default function Appointments() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (date) params.date = date;
      if (status) params.status = status;
      setAppointments(await appointmentApi.list(params));
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [date, status, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openForm = (appointment = null) => {
    setEditing(appointment);
    setShowForm(true);
  };

  // The edit form works with plain ids and a local date string, not populated objects.
  const initialForm = editing && {
    patient: editing.patient?._id ?? '',
    doctor: editing.doctor?._id ?? '',
    appointmentDate: toLocalInput(editing.appointmentDate),
    reason: editing.reason,
    status: editing.status,
  };

  const save = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await appointmentApi.update(editing._id, form);
        toast.success('Appointment updated');
      } else {
        await appointmentApi.create(form);
        toast.success('Appointment scheduled');
      }
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e)); // includes the "doctor not available" message from the backend
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (appointment, newStatus) => {
    try {
      await appointmentApi.update(appointment._id, { status: newStatus });
      toast.success(`Appointment marked ${newStatus.toLowerCase()}`);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await appointmentApi.remove(toDelete._id);
      toast.success(res.message);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setToDelete(null);
    }
  };

  const columns = [
    { header: 'Date & time', render: (a) => <span className="whitespace-nowrap">{formatDateTime(a.appointmentDate)}</span> },
    {
      header: 'Patient',
      render: (a) => (a.patient ? <>{a.patient.name} <span className="text-slate-500">({a.patient.patientId})</span></> : 'Removed patient'),
    },
    {
      header: 'Doctor',
      render: (a) => (a.doctor ? <>{a.doctor.name} <span className="text-slate-500">· {a.doctor.specialization}</span></> : 'Removed doctor'),
    },
    { header: 'Reason', render: (a) => a.reason },
    { header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      header: 'Actions',
      render: (a) => (
        <div className="flex gap-1">
          {a.status === 'Scheduled' && (
            <>
              <button className="icon-btn hover:text-green-600" onClick={() => changeStatus(a, 'Completed')} aria-label="Mark completed"><CheckCircle2 className="h-4 w-4" /></button>
              <button className="icon-btn hover:text-amber-600" onClick={() => changeStatus(a, 'Cancelled')} aria-label="Cancel appointment"><XCircle className="h-4 w-4" /></button>
            </>
          )}
          <button className="icon-btn" onClick={() => openForm(a)} aria-label="Edit appointment"><Pencil className="h-4 w-4" /></button>
          <button className="icon-btn hover:text-red-600" onClick={() => setToDelete(a)} aria-label="Delete appointment"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Appointments"
        subtitle="Schedule visits and track their status"
        action={<button className="btn btn-primary" onClick={() => openForm()}><Plus className="h-4 w-4" />Schedule appointment</button>}
      />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="label">Date</span>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Status</span>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option>Scheduled</option><option>Completed</option><option>Cancelled</option>
          </select>
        </label>
        {(date || status) && (
          <button className="btn btn-secondary" onClick={() => { setDate(''); setStatus(''); }}>Clear filters</button>
        )}
      </div>
      <DataTable columns={columns} rows={appointments} loading={loading} empty="No appointments match these filters." />

      {showForm && (
        <Modal title={editing ? 'Edit appointment' : 'Schedule appointment'} onClose={() => setShowForm(false)}>
          <AppointmentForm initial={initialForm} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving} />
        </Modal>
      )}
      {toDelete && (
        <ConfirmDialog
          title="Delete appointment?"
          message="This permanently removes the appointment. To keep a record, cancel it instead."
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
