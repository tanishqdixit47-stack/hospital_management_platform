// Run with: npm run seed   (clears the three collections and inserts fictional sample data)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const patients = [
  { name: 'Aarav Mehta', dateOfBirth: '1990-04-12', gender: 'Male', phone: '9876500001', address: '12 Lake View Road, Pune', bloodGroup: 'O+', medicalCondition: 'Hypertension' },
  { name: 'Diya Sharma', dateOfBirth: '1985-09-23', gender: 'Female', phone: '9876500002', address: '45 Green Park, Pune', bloodGroup: 'A+', medicalCondition: 'Asthma' },
  { name: 'Rohan Iyer', dateOfBirth: '2001-01-30', gender: 'Male', phone: '9876500003', address: '7 Station Road, Mumbai', bloodGroup: 'B+', medicalCondition: 'None' },
  { name: 'Meera Nair', dateOfBirth: '1972-11-05', gender: 'Female', phone: '9876500004', address: '88 Hill Street, Nashik', bloodGroup: 'AB-', medicalCondition: 'Type 2 Diabetes' },
  { name: 'Kabir Singh', dateOfBirth: '1998-06-18', gender: 'Male', phone: '9876500005', address: '21 Market Lane, Pune', bloodGroup: 'O-', medicalCondition: 'Migraine' },
  { name: 'Anaya Patel', dateOfBirth: '2010-03-09', gender: 'Female', phone: '9876500006', address: '3 Rose Garden, Satara', bloodGroup: 'A-', medicalCondition: 'Seasonal allergies' },
];

const doctors = [
  { name: 'Dr. Neha Kulkarni', specialization: 'Cardiology', phone: '9123400001', department: 'Cardiology', consultationFee: 800 },
  { name: 'Dr. Arjun Deshpande', specialization: 'Pediatrics', phone: '9123400002', department: 'Child Care', consultationFee: 500 },
  { name: 'Dr. Sana Khan', specialization: 'Dermatology', phone: '9123400003', department: 'Skin & Cosmetology', consultationFee: 600 },
  { name: 'Dr. Vikram Rao', specialization: 'General Medicine', phone: '9123400004', department: 'OPD', consultationFee: 400 },
];

// Date helper: today (+ dayOffset) at the given hour/minute.
const at = (dayOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

const run = async () => {
  await connectDB();
  await Promise.all([Patient.deleteMany({}), Doctor.deleteMany({}), Appointment.deleteMany({})]);

  // Created one by one so the auto-generated P-0001 / D-0001 IDs increase correctly.
  const p = [];
  for (const data of patients) p.push(await Patient.create(data));
  const d = [];
  for (const data of doctors) d.push(await Doctor.create(data));

  await Appointment.insertMany([
    { patient: p[0]._id, doctor: d[0]._id, appointmentDate: at(0, 10, 0), reason: 'Blood pressure follow-up', status: 'Scheduled' },
    { patient: p[1]._id, doctor: d[3]._id, appointmentDate: at(0, 10, 30), reason: 'Breathing difficulty at night', status: 'Scheduled' },
    { patient: p[5]._id, doctor: d[1]._id, appointmentDate: at(0, 11, 0), reason: 'Routine child check-up', status: 'Scheduled' },
    { patient: p[2]._id, doctor: d[2]._id, appointmentDate: at(1, 9, 30), reason: 'Skin rash', status: 'Scheduled' },
    { patient: p[3]._id, doctor: d[3]._id, appointmentDate: at(1, 12, 0), reason: 'Diabetes review', status: 'Scheduled' },
    { patient: p[4]._id, doctor: d[3]._id, appointmentDate: at(-1, 15, 0), reason: 'Recurring headaches', status: 'Completed' },
    { patient: p[0]._id, doctor: d[0]._id, appointmentDate: at(-2, 11, 30), reason: 'ECG test', status: 'Completed' },
    { patient: p[1]._id, doctor: d[2]._id, appointmentDate: at(2, 16, 0), reason: 'Allergy consultation', status: 'Cancelled' },
  ]);

  console.log(`Seeded ${p.length} patients, ${d.length} doctors, 8 appointments`);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
