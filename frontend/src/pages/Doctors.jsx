import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import DataTable from '../components/DataTable.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import DoctorForm from '../components/DoctorForm.jsx';
import { doctorApi, getErrorMessage } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { formatCurrency } from '../utils/format.js';

export default function Doctors() {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setDoctors(await doctorApi.list(search ? { search } : {}));
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openForm = (doctor = null) => {
    setEditing(doctor);
    setShowForm(true);
  };

  const save = async (form) => {
    setSaving(true);
    try {
      if (editing) {
        await doctorApi.update(editing._id, form);
        toast.success('Doctor updated');
      } else {
        await doctorApi.create(form);
        toast.success('Doctor added');
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
      const res = await doctorApi.remove(toDelete._id);
      toast.success(res.message);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setToDelete(null);
    }
  };

  const columns = [
    { header: 'ID', render: (d) => <span className="font-medium">{d.doctorId}</span> },
    { header: 'Name', render: (d) => d.name },
    { header: 'Specialization', render: (d) => d.specialization },
    { header: 'Department', render: (d) => d.department },
    { header: 'Phone', render: (d) => d.phone },
    { header: 'Fee', render: (d) => formatCurrency(d.consultationFee) },
    {
      header: 'Actions',
      render: (d) => (
        <div className="flex gap-1">
          <button className="icon-btn" onClick={() => openForm(d)} aria-label={`Edit ${d.name}`}><Pencil className="h-4 w-4" /></button>
          <button className="icon-btn hover:text-red-600" onClick={() => setToDelete(d)} aria-label={`Remove ${d.name}`}><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Manage doctor listings"
        action={<button className="btn btn-primary" onClick={() => openForm()}><Plus className="h-4 w-4" />Add doctor</button>}
      />
      <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Search by name or specialization" /></div>
      <DataTable columns={columns} rows={doctors} loading={loading} empty={search ? 'No doctors match your search.' : 'No doctors yet. Add the first one.'} />

      {showForm && (
        <Modal title={editing ? 'Edit doctor' : 'Add doctor'} onClose={() => setShowForm(false)}>
          <DoctorForm initial={editing} onSubmit={save} onCancel={() => setShowForm(false)} saving={saving} />
        </Modal>
      )}
      {toDelete && (
        <ConfirmDialog
          title="Remove doctor?"
          message={`${toDelete.name} will be removed from the hospital's listings. Doctors with scheduled appointments cannot be removed.`}
          confirmLabel="Remove"
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
