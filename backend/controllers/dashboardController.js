const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/dashboard
exports.getDashboard = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const today = { appointmentDate: { $gte: start, $lt: end } };

  const [totalPatients, totalDoctors, totalAppointments, todaysAppointments, todaysList] = await Promise.all([
    Patient.countDocuments({ isActive: true }),
    Doctor.countDocuments(),
    Appointment.countDocuments(),
    Appointment.countDocuments(today),
    Appointment.find(today)
      .populate('patient', 'name patientId')
      .populate('doctor', 'name specialization')
      .sort({ appointmentDate: 1 }),
  ]);

  res.json({ totalPatients, totalDoctors, totalAppointments, todaysAppointments, todaysList });
});
