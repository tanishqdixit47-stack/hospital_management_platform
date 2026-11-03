import { useEffect, useState } from 'react';
import { Users, Stethoscope, CalendarDays, CalendarCheck } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { dashboardApi, getErrorMessage } from '../services/api.js';
import { useToast } from '../components/Toast.jsx';
import { formatTime } from '../utils/format.js';

export default function Dashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .get()
      .then(setData)
      .catch((e) => toast.error(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [toast]);

  const columns = [
    { header: 'Time', render: (a) => formatTime(a.appointmentDate) },
    { header: 'Patient', render: (a) => a.patient?.name ?? 'Removed patient' },
    { header: 'Doctor', render: (a) => a.doctor?.name ?? 'Removed doctor' },
    { header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick look at today's hospital activity" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total patients" value={data?.totalPatients ?? '–'} icon={Users} />
        <StatCard label="Total doctors" value={data?.totalDoctors ?? '–'} icon={Stethoscope} />
        <StatCard label="Total appointments" value={data?.totalAppointments ?? '–'} icon={CalendarDays} />
        <StatCard label="Today's appointments" value={data?.todaysAppointments ?? '–'} icon={CalendarCheck} />
      </div>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Today's schedule</h2>
      <DataTable columns={columns} rows={data?.todaysList ?? []} loading={loading} empty="No appointments scheduled for today." />
    </>
  );
}
