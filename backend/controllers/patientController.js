const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../middleware/asyncHandler');
const httpError = require('../utils/httpError');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');

const FIELDS = ['name', 'dateOfBirth', 'gender', 'phone', 'address', 'bloodGroup', 'medicalCondition'];

// POST /api/patients
exports.createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create(pick(req.body, FIELDS)); // insertOne
  res.status(201).json(patient);
});

// GET /api/patients?search=asha&active=true
exports.getPatients = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ name: regex }, { patientId: regex }]; // search by name OR patient ID
  }
  if (req.query.active === 'true') filter.isActive = true;
  const patients = await Patient.find(filter).sort({ patientId: 1 });
  res.json(patients);
});

// GET /api/patients/:id
exports.getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw httpError(404, 'Patient not found');
  res.json(patient);
});

// PUT /api/patients/:id
exports.updatePatient = asyncHandler(async (req, res) => {
  const data = pick(req.body, [...FIELDS, 'isActive']);
  const patient = await Patient.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });
  if (!patient) throw httpError(404, 'Patient not found');
  res.json(patient);
});

// DELETE /api/patients/:id
// Patients with appointment history are deactivated (kept for records); others are deleted.
exports.deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw httpError(404, 'Patient not found');

  const hasHistory = await Appointment.exists({ patient: patient._id });
  if (hasHistory) {
    patient.isActive = false;
    await patient.save();
    await Appointment.updateMany(
      { patient: patient._id, status: 'Scheduled' },
      { $set: { status: 'Cancelled' } }
    );
    return res.json({
      message: 'Patient has appointment history, so the record was deactivated and upcoming appointments were cancelled',
      deactivated: true,
    });
  }

  await patient.deleteOne();
  res.json({ message: 'Patient deleted', deactivated: false });
});
