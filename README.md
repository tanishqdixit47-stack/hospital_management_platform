# 🏥 Hospital Management System

[![CI/CD Pipeline](https://github.com/tanishqdixit47-stack/hospital_management_platform/actions/workflows/deploy.yml/badge.svg)](https://github.com/tanishqdixit47-stack/hospital_management_platform/actions/workflows/deploy.yml)

A full-stack MERN (MongoDB · Express · React · Node.js) mini project for managing **patients**, **doctors** and **appointments**, with a live dashboard of today's hospital activity.

> Every list, count and dropdown in the UI is fetched from the API, which reads MongoDB. Nothing is hardcoded in the frontend.

**🌐 Live demo:** [Frontend](https://hospital-frontend-tinn.onrender.com) · [API](https://hospital-api-nw2i.onrender.com/api/dashboard)
*(Free-tier Render services spin down when idle — the first request may take ~50 s while the instance wakes up.)*

---

## ✨ Features

### Dashboard
- Total patients, doctors, appointments and today's appointments at a glance
- "Today's schedule" list with patient / doctor / status, refreshed live from MongoDB

### Patients
- Add, edit, list and search patients (search matches **name or patient ID**, case-insensitive)
- Filter to active-only patients
- **Safe deletion:** patients with appointment history are *deactivated* (soft delete) instead of removed, and all their scheduled appointments are automatically **cancelled** — so old records keep a valid reference

### Doctors
- Add, edit, search doctors (matches **name or specialization**)
- Auto-generated IDs (`D-0001`, `D-0002`, …), consultation fee displayed in dropdowns
- **Removal guard:** a doctor cannot be deleted while they have scheduled appointments (HTTP 409)

### Appointments
- Schedule a visit: pick patient + doctor from live dropdowns, choose date & time, enter a reason
- **Doctor availability check:** each appointment occupies the doctor for a 30-minute slot; an overlapping scheduled appointment is rejected (HTTP 409)
- Filter by date (`YYYY-MM-DD`) and status (`Scheduled` / `Completed` / `Cancelled`)
- One-click "mark completed" / "cancel" actions, full edit (reschedule, change doctor/patient, edit reason)
- Patient and doctor names resolved via MongoDB **references + populate** (like a join)

### Validation & errors
- Validation lives in the **Mongoose schemas** (required, enum, match, min/max, custom validators)
- Schema errors are converted to clean **400** responses by central error middleware
- Human-readable error messages surfaced as toasts in the UI

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Lucide icons, Axios, React Router 6 |
| Backend | Node.js, Express, Mongoose 8, CORS, dotenv |
| Database | MongoDB (local or Atlas) |

---

## ☁️ Cloud Deployment & CI/CD

The app runs entirely in the cloud — **Render** (backend web service + frontend static site) with **MongoDB Atlas** as the database. Everything is reproducible from the repository:

| Piece | Where | What it does |
|---|---|---|
| `render.yaml` | repo root | Render **Blueprint** — declares `hospital-api` (Node web service) and `hospital-frontend` (static site). One click: Render → New → Blueprint → pick repo |
| `.github/workflows/deploy.yml` | `main` branch | **CI/CD pipeline** — see below |
| `MONGO_URI` / `VITE_API_BASE_URL` | Render env vars | Atlas connection string / deployed API URL (never committed) |

**Pipeline flow on every push to `main`:**

```
git push origin main
        │
        ▼
┌─────────────── CI (GitHub Actions) ───────────────┐
│ ci-backend:    npm ci · syntax-check every JS file│
│                · load all modules without err     │
│ ci-frontend:   npm ci · vite production build     │
└──────────────┬────────────────────────────────────┘
               │ both jobs pass
               ▼
┌────────────── CD (GitHub Actions) ────────────────┐
│ triggers Render Deploy Hooks for backend +        │
│ frontend → both services rebuild & redeploy       │
└───────────────────────────────────────────────────┘
```

Required repository secrets: `RENDER_DEPLOY_HOOK_BACKEND`, `RENDER_DEPLOY_HOOK_FRONTEND` (Render → Service → Settings → Deploy Hook).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **MongoDB** running locally on port 27017 — or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (free M0 tier is used in the live demo)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tanishqdixit47-stack/hospital_management_platform.git
cd hospital_management_platform

# 2. Backend — install, seed sample data, start API
cd backend
npm install
npm run seed        # loads fictional sample patients, doctors, appointments
npm run dev         # API on http://localhost:5000

# 3. Frontend — open a second terminal
cd frontend
npm install
npm run dev         # App on http://localhost:5173
```

Open **http://localhost:5173** in your browser. 🎉

### Environment variables

`backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hospital_db
```

For Atlas, replace `MONGO_URI` with your cluster's connection string.

### npm scripts

| Script | Runs in | Purpose |
|---|---|---|
| `npm run dev` | backend | Start Express with auto-restart (`node --watch`) |
| `npm start` | backend | Start Express (production style) |
| `npm run seed` | backend | Wipe and re-insert fictional sample data |
| `npm run dev` | frontend | Start Vite dev server on port 5173 |
| `npm run build` | frontend | Production build into `dist/` |

---

## 🏗 Architecture

```
Browser (React, port 5173)
   |  Axios  GET/POST/PUT/DELETE  /api/...
   v   (Vite dev server proxies /api to port 5000)
Express API (port 5000)
   routes → controllers → Mongoose models
   middleware: validateObjectId · asyncHandler · errorHandler
   |  Mongoose
   v
MongoDB (hospital_db): patients | doctors | appointments
```

### Project structure

```
hospital-mini-project/
├── backend/
│   ├── config/db.js               # MongoDB connection (one shared Mongoose connection)
│   ├── models/                    # Patient.js, Doctor.js, Appointment.js (schemas + validation)
│   ├── controllers/               # business logic per module + dashboard aggregation
│   ├── routes/                    # URL → controller mapping
│   ├── middleware/                # errorHandler, asyncHandler, validateObjectId
│   ├── utils/                     # generateId, pick (field whitelist), escapeRegex, httpError
│   ├── seed.js                    # fictional sample data loader
│   ├── .env                       # PORT + MONGO_URI (not committed)
│   └── server.js                  # app entry point
└── frontend/
    ├── src/
    │   ├── pages/                 # Dashboard, Patients, Doctors, Appointments
    │   ├── components/            # Layout, Modal, ConfirmDialog, forms, DataTable, Toast…
    │   ├── services/api.js        # Axios instance + API functions
    │   └── utils/format.js        # date / currency formatting helpers
    ├── vite.config.js             # dev proxy: /api → http://localhost:5000
    └── tailwind.config.js
```

---

## 📬 API Reference

Base URL: `http://localhost:5000/api`

### Patients

| Method | Route | Purpose |
|---|---|---|
| POST | `/patients` | Add patient |
| GET | `/patients?search=&active=true` | List / search by name or patient ID |
| GET | `/patients/:id` | Get one patient |
| PUT | `/patients/:id` | Update patient |
| DELETE | `/patients/:id` | Delete — or **deactivate** (soft delete) if the patient has appointment history |

### Doctors

| Method | Route | Purpose |
|---|---|---|
| POST | `/doctors` | Add doctor |
| GET | `/doctors?search=` | List / search (matches name or specialization) |
| PUT | `/doctors/:id` | Update doctor |
| DELETE | `/doctors/:id` | Remove — **blocked (409)** while scheduled appointments exist |

### Appointments

| Method | Route | Purpose |
|---|---|---|
| POST | `/appointments` | Schedule (checks doctor availability, 409 on overlap) |
| GET | `/appointments?date=YYYY-MM-DD&status=Scheduled` | List with filters |
| PUT | `/appointments/:id` | Reschedule, edit reason, change status |
| DELETE | `/appointments/:id` | Delete appointment |

### Dashboard

| Method | Route | Purpose |
|---|---|---|
| GET | `/dashboard` | Totals + today's appointment list |

**Status codes:** `200` OK · `201` Created · `400` validation error / bad id · `404` not found · `409` conflict (doctor busy / doctor has scheduled appointments) · `500` server error.

**Example — create an appointment:**

```http
POST /api/appointments
Content-Type: application/json

{
  "patient": "<patientObjectId>",
  "doctor": "<doctorObjectId>",
  "appointmentDate": "2026-11-03T10:00:00.000Z",
  "reason": "Blood pressure follow-up"
}
```

---

## 🗄 Data Model

```
patients { patientId "P-0001"*, name, dateOfBirth, gender, phone, address,
           bloodGroup, medicalCondition, isActive }
doctors  { doctorId "D-0001"*, name, specialization, phone, department,
           consultationFee }
appointments { patient → Patient.*, doctor → Doctor.*,
               appointmentDate, reason, status: Scheduled|Completed|Cancelled}
```

- `patientId` / `doctorId` are **auto-generated** (`P-0001…`, `D-0001…`) in a `pre('validate')` hook and protected by **unique indexes**
- `appointments` stores **ObjectId references** (not copies) — edits to a patient or doctor show up everywhere; `.populate()` joins them when reading
- Indexes: `{ doctor: 1, appointmentDate: 1 }` on appointments → fast availability checks and date filtering

---

## 🔒 Business Rules

1. **No double-booking** — each appointment blocks the doctor for 30 minutes (`SLOT_MINUTES` in `appointmentController.js`). A new appointment is rejected with **409** if a `Scheduled` appointment of the same doctor starts within 30 minutes either side. `Completed` / `Cancelled` appointments don't block slots. The same check runs on reschedule.
2. **Soft delete for patients** — a patient with appointment history is deactivated (`isActive: false`) instead of deleted, and their scheduled appointments are cancelled with one `updateMany`. Patients with no history are truly deleted.
3. **Doctor removal guard** — a doctor cannot be removed while scheduled appointments exist (409 with the count of the remaining ones).
4. **Field whitelisting** — controllers apply `pick(req.body, ALLOWED_FIELDS)`, so unexpected/privileged fields in requests are ignored.

---

## 🧠 MongoDB Operations Used

| Operation | Where | Mongoose call |
|---|---|---|
| Insert a document | add patient/doctor/appointment | `Model.create()` |
| Insert many | seed.js | `Appointment.insertMany()` |
| Find with filter | search, status & date filters | `Model.find({ $or: [...] })`, `$gte`, `$lt` |
| Regex search (case-insensitive) | patient & doctor search | `/search/i` built with `escapeRegex()` |
| Find by id | get one / update / delete | `findById()` |
| Update | edit forms | `findByIdAndUpdate(id, data, { new: true, runValidators: true })` |
| Update many | deactivate patient → cancel appointments | `updateMany(filter, { $set })` |
| Delete | remove records | `deleteOne()`, `findByIdAndDelete()` |
| Count | dashboard totals | `countDocuments()` |
| Existence check | has patient got history? | `Model.exists()` |
| Reference + populate | patient/doctor names in appointments | `.populate('patient', 'name patientId')` |
| Sort | earliest time first | `.sort({ appointmentDate: 1 })` |
| Index | fast availability lookup | `schema.index({ doctor: 1, appointmentDate: 1 })` |
| Unique index | no duplicate IDs | `unique: true` in schema |
| Aggregation-free dashboard | 5 parallel reads | `Promise.all([…])` |

---

## 📄 License

MIT — see [LICENSE](LICENSE).

---

*Built as a hands-on mini project to practice the full MERN stack, schema validation, and document-database design patterns.*
