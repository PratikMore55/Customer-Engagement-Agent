# Customer Engagement Agent

A full-stack lead capture and engagement project with:
- **Backend API** (Node.js + Express + MongoDB)
- **Frontend app** (React + Vite)
- **AI-assisted lead classification flow** (currently backed by a mock AI service)

## Repository Walkthrough

## 1) High-level architecture

The project is split into two main applications:

- `backend/`: REST API, auth, form management, customer submissions, lead lifecycle, email dispatch.
- `frontend/`: React UI for authentication and dashboard/form workflows.

The submission workflow is:
1. A public form is submitted (`POST /api/customers/submit`).
2. Submission is stored as a `Customer` document.
3. Classification logic determines hot/normal/cold lead quality.
4. A `Lead` record is created/updated with confidence and follow-up metadata.
5. An email service generates and sends response content.

## 2) Backend walkthrough (`backend/`)

### Entry point and app wiring
- `server.js` initializes Express, CORS, JSON middleware, database connection, route mounting, and health checks.
- API routes are mounted at:
  - `/api/auth`
  - `/api/forms`
  - `/api/customers`
  - `/api/leads`

### Configuration
- `src/config/config.js` centralizes environment-based settings (port, Mongo URI, JWT, email config, lead thresholds).
- `src/config/database.js` handles MongoDB connection and process-level shutdown behavior.

### Data models
- `User.model.js`: account identity + password hashing + profile helper.
- `Form.model.js`: dynamic form schema, field definitions, classification criteria, email settings.
- `Customer.model.js`: captured submission payload (`responses` map) + metadata.
- `Lead.model.js`: classification status, confidence, follow-up tracking, notes, conversion state.

### Controllers and routes
- `auth.controller.js` + `auth.routes.js`: register/login/profile/password flow.
- `form.controller.js` + `form.routes.js`: CRUD + public form fetch + active toggle.
- `customer.controller.js` + `customer.routes.js`: public submission endpoint + owner-side listing and deletion.
- `lead.controller.js` + `lead.routes.js`: lead querying, stats, follow-up updates, notes, conversion.

### Services and middleware
- `classification.service.js`: classifies submission/lead intent.
- `ai.service.mock.js` and `ai.service.js`: mock/AI integration layer.
- `email.service.js`: message generation + transport.
- `auth.middleware.js`: JWT protection.
- `validation.middleware.js`: request validation and object-id checks.

## 3) Frontend walkthrough (`frontend/`)

### Runtime stack
- React 18 + React Router + Axios, built with Vite.
- `src/services/api.js` defines endpoint clients and auth token interceptors.

### Current app shell
- `src/App.jsx` currently uses:
  - Login / Register routes
  - A temporary authenticated dashboard component (`TempDashboard`) for post-login confirmation.

### Notable state of frontend code
The repository includes several files intended for richer dashboard/form functionality, but multiple component/page files are currently placeholders (empty). Existing implemented UI appears concentrated in:
- `src/App.jsx`
- `src/components/Auth/*`
- `src/components/Dashboard/Dashboard.jsx`
- `src/pages/FormBuilderPage.jsx`

There are import path inconsistencies in `FormBuilderPage.jsx` (e.g., relative path to `services/api` and `Navbar` reference), indicating in-progress work before full route integration.

## 4) Quick run guide

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Default local ports:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

