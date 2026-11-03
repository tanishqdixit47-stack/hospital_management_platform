const mongoose = require('mongoose');
const generateId = require('../utils/generateId');

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, unique: true },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: (v) => v <= new Date(),
        message: 'Date of birth cannot be in the future',
      },
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: { values: ['Male', 'Female', 'Other'], message: 'Gender must be Male, Female or Other' },
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s]{7,15}$/, 'Enter a valid phone number (7-15 digits)'],
    },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: 'Invalid blood group',
      },
    },
    medicalCondition: { type: String, trim: true, default: 'None' },
    isActive: { type: Boolean, default: true }, // false = deactivated (soft delete)
  },
  { timestamps: true }
);

// Auto-generate patientId (P-0001, P-0002...) before the first save.
patientSchema.pre('validate', async function () {
  if (this.isNew && !this.patientId) {
    this.patientId = await generateId(this.constructor, 'patientId', 'P');
  }
});

module.exports = mongoose.model('Patient', patientSchema);
