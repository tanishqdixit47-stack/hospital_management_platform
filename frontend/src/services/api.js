import axios from 'axios';

// Locally, calls go to the same origin (/api...) and the Vite dev server proxies
// them to http://localhost:5000. In production, VITE_API_BASE_URL (set in Render)
// points at the deployed backend, e.g. https://hospital-api.onrender.com/api.
const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' });

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
