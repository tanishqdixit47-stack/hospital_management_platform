const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    // References (foreign keys) to the other two collections.
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: [true, 'Patient is required'] },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: [true, 'Doctor is required'] },
    appointmentDate: { type: Date, required: [true, 'Appointment date and time is required'] },
    reason: {
      type: String,
      required: [true, 'Reason for visit is required'],
      trim: true,
      minlength: [3, 'Reason must be at least 3 characters'],
    },
    status: {
      type: String,
      enum: { values: ['Scheduled', 'Completed', 'Cancelled'], message: 'Invalid status' },
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

// Speeds up the "is this doctor free?" check and date filtering.
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
