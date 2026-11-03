const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../middleware/asyncHandler');
const httpError = require('../utils/httpError');
const pick = require('../utils/pick');
const escapeRegex = require('../utils/escapeRegex');

const FIELDS = ['name', 'specialization', 'phone', 'department', 'consultationFee'];

// POST /api/doctors
exports.createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create(pick(req.body, FIELDS));
  res.status(201).json(doctor);
});

// GET /api/doctors?search=cardio  (matches name or specialization)
exports.getDoctors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ name: regex }, { specialization: regex }];
  }
  const doctors = await Doctor.find(filter).sort({ doctorId: 1 });
  res.json(doctors);
});

// PUT /api/doctors/:id
exports.updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!doctor) throw httpError(404, 'Doctor not found');
  res.json(doctor);
});

// DELETE /api/doctors/:id  (blocked while the doctor still has scheduled appointments)
exports.deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) throw httpError(404, 'Doctor not found');

  const upcoming = await Appointment.countDocuments({ doctor: doctor._id, status: 'Scheduled' });
  if (upcoming > 0) {
    throw httpError(409, `Cannot remove this doctor: ${upcoming} scheduled appointment(s) exist. Complete or cancel them first.`);
  }

  await doctor.deleteOne();
  res.json({ message: 'Doctor removed' });
});
