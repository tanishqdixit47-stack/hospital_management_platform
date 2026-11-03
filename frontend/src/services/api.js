import axios from 'axios';

// All calls go to /api/... (Vite proxies them to http://localhost:5000).
const http = axios.create({ baseURL: '/api' });

// Turns an Axios error into a message a user can read.
export const getErrorMessage = (err) =>
  err.response?.data?.message ||
  (err.request ? 'Cannot reach the server. Check that the backend is running.' : err.message);

const crud = (path) => ({
  list: (params) => http.get(path, { params }).then((r) => r.data),
  create: (data) => http.post(path, data).then((r) => r.data),
  update: (id, data) => http.put(`${path}/${id}`, data).then((r) => r.data),
  remove: (id) => http.delete(`${path}/${id}`).then((r) => r.data),
});

export const patientApi = crud('/patients');
export const doctorApi = crud('/doctors');
export const appointmentApi = crud('/appointments');
export const dashboardApi = { get: () => http.get('/dashboard').then((r) => r.data) };
