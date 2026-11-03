const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const asyncHandler = require('../middleware/asyncHandler');
const httpError = require('../utils/httpError');

const SLOT_MINUTES = 30; // every appointment blocks the doctor for 30 minutes

// Finds a Scheduled appointment for the same doctor that overlaps the requested slot.
// Two 30-minute slots overlap when their start times are less than 30 minutes apart.
const findConflict = (doctorId, date, excludeId) => {
  const ms = SLOT_MINUTES * 60 * 1000;
  const query = {
    doctor: doctorId,
    status: 'Scheduled',
    appointmentDate: { $gt: new Date(date.getTime() - ms), $lt: new Date(date.getTime() + ms) },
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Appointment.findOne(query);
};

const parseDate = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw httpError(400, 'A valid appointment date and time is required');
  return date;
};

const CONFLICT_MSG = `Doctor is not available: another appointment is already scheduled within ${SLOT_MINUTES} minutes of this time`;

// POST /api/appointments
exports.createAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, appointmentDate, reason } = req.body;
  if (!mongoose.isValidObjectId(patient) || !mongoose.isValidObjectId(doctor)) {
    throw httpError(400, 'A valid patient and doctor are required');
  }
  const date = parseDate(appointmentDate);

  const [patientDoc, doctorDoc] = await Promise.all([Patient.findById(patient), Doctor.findById(doctor)]);
  if (!patientDoc) throw httpError(404, 'Patient not found');
  if (!patientDoc.isActive) throw httpError(400, 'This patient record is deactivated');
  if (!doctorDoc) throw httpError(404, 'Doctor not found');

  if (await findConflict(doctor, date)) throw httpError(409, CONFLICT_MSG);

  const appointment = await Appointment.create({ patient, doctor, appointmentDate: date, reason });
  await appointment.populate('patient doctor');
  res.status(201).json(appointment);
});

// GET /api/appointments?date=2026-10-27&status=Scheduled
exports.getAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) {
    const start = new Date(`${req.query.date}T00:00:00`);
    if (Number.isNaN(start.getTime())) throw httpError(400, 'Date must be in YYYY-MM-DD format');
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.appointmentDate = { $gte: start, $lt: end };
  }
  const appointments = await Appointment.find(filter)
    .populate('patient', 'name patientId') // "join" with the patients collection
    .populate('doctor', 'name specialization doctorId')
    .sort({ appointmentDate: 1 });
  res.json(appointments);
});

// PUT /api/appointments/:id  (reschedule, edit reason, or change status)
exports.updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw httpError(404, 'Appointment not found');

  const { patient, doctor, appointmentDate, reason, status } = req.body;
  if (patient !== undefined) {
    if (!mongoose.isValidObjectId(patient)) throw httpError(400, 'Invalid patient');
    appointment.patient = patient;
  }
  if (doctor !== undefined) {
    if (!mongoose.isValidObjectId(doctor)) throw httpError(400, 'Invalid doctor');
    if (!(await Doctor.exists({ _id: doctor }))) throw httpError(404, 'Doctor not found');
    appointment.doctor = doctor;
  }
  if (appointmentDate !== undefined) appointment.appointmentDate = parseDate(appointmentDate);
  if (reason !== undefined) appointment.reason = reason;
  if (status !== undefined) appointment.status = status;

  // Only a Scheduled appointment occupies the doctor's time, so only then do we check overlaps.
  if (appointment.status === 'Scheduled') {
    if (await findConflict(appointment.doctor, appointment.appointmentDate, appointment._id)) {
      throw httpError(409, CONFLICT_MSG);
    }
  }

  await appointment.save(); // runs schema validation (e.g. status enum)
  await appointment.populate('patient doctor');
  res.json(appointment);
});

// DELETE /api/appointments/:id
exports.deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) throw httpError(404, 'Appointment not found');
  res.json({ message: 'Appointment deleted' });
});
