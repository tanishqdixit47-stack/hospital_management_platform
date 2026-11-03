import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import PatientForm from '../components/PatientForm.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { patientApi, getErrorMessage } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { calcAge } from '../utils/format.js';

export default function Patients() {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = adding a new patient
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setPatients(await patientApi.list(search ? { search } : {}));
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  // Wait 300 ms after typing stops before asking the server.
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openForm = (patient = null) => {
    setEditing(patient);
    setShowForm(true);
  };

  const save = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await patientApi.update(editing._id, form);
        toast.success('Patient updated');
      } else {
        await patientApi.create(form);
        toast.success('Patient added');
      }
      setShowForm(false);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      const res = await patientApi.remove(toDelete._id);
      toast.success(res.message);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setToDelete(null);
    }
  };

  const columns = [
    { header: 'ID', render: (p) => <span className="font-medium">{p.patientId}</span> },
    { header: 'Name', render: (p) => p.name },
    { header: 'Age / Gender', render: (p) => `${calcAge(p.dateOfBirth)} / ${p.gender}` },
    { header: 'Phone', render: (p) => p.phone },
    { header: 'Blood group', render: (p) => p.bloodGroup },
    { header: 'Condition', render: (p) => p.medicalCondition },
    { header: 'Status', render: (p) => <StatusBadge status={p.isActive ? 'Active' : 'Inactive'} /> },
    {
      header: 'Actions',
      render: (p) => (
        <div className="flex gap-1">
          <button className="icon-btn" onClick={() => openForm(p)} aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></button>
          <button className="icon-btn hover:text-red-600" onClick={() => setToDelete(p)} aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="Register and manage patient records"
        action={<button className="btn btn-primary" onClick={() => openForm()}><Plus className="h-4 w-4" />Add patient</button>}
      />
      <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or patient ID" /></div>
      <DataTable columns={columns} rows={patients} loading={loading} empty={search ? 'No patients match your search.' : 'No patients yet. Add the first one.'} />

      {showForm && (
        <Modal title={editing ? 'Edit patient' : 'Add patient'} onClose={() => setShowForm(false)}>
          <PatientForm initial={editing} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving} />
        </Modal>
      )}
      {toDelete && (
        <ConfirmDialog
          title="Delete patient?"
          message={`${toDelete.name} will be deleted. If this patient has appointment history, the record is deactivated instead and upcoming appointments are cancelled.`}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
