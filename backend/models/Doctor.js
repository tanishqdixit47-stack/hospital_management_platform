const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

const doctorSchema = new mongoose.Schema(
  {
    doctorId: { type: String, unique: true },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    specialization: { type: String, required: [true, 'Specialization is required'], trim: true },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number (7-15 digits)'],
    },
    department: { type: String, required: [true, 'Department is required'], trim: true },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Consultation fee cannot be negative'],
    },
  },
  { timestamps: true }
);

doctorSchema.pre('validate', async function () {
  if (this.isNew && !this.doctorId) {
    this.doctorId = await generateId(this.constructor, 'doctorId', 'D');
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);
