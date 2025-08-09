# Restaurant Booking — Frontend

A small React + TypeScript web app that integrates with the provided FastAPI mock API to manage restaurant bookings.

---

## Features (per brief)

- Search availability (date, party size) for a specific restaurant
- Select an available time slot and create a booking with customer details
- Show booking confirmation and reference (with copy button)
- Manage an existing booking: lookup by reference, update, and cancel with a reason
- Good UX: responsive layout, form validation, clear error/success messages

---

## Prerequisites

- Node.js 18+ and npm
- FastAPI mock server running locally at `http://localhost:8547` (see “Backend setup” below)

---

## Quick start (Frontend)

```bash
# 1) Create the app (if not done already)
npm create vite@latest booking-frontend -- --template react-ts
cd booking-frontend

# 2) Install deps
npm i @tanstack/react-query axios zod react-hook-form @hookform/resolvers
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3) Environment vars
# Create .env.local at the project root:
VITE_API_BASE=http://localhost:8547
VITE_API_TOKEN=<paste your bearer token here, or leave blank if using dev bypass>

# 4) Run dev server
npm run dev
Open: http://localhost:5173

If you see “Network error” or 401, read the Troubleshooting section.

Backend (mock API) setup
If you already ran the server successfully, you can skip this.

powershell
Copy code
# Windows PowerShell
# Use Python 3.11 (avoids building native wheels)
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
pip install -r requirements.txt

# Enable CORS for the React dev server (already in app/main.py):
# allow_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

# (Option A) Use a bearer token (set in frontend .env.local)
python -m app

# (Option B) Dev bypass auth (no token needed)
$env:DEV_NO_AUTH = "1"
python -m app
Docs:

Swagger: http://localhost:8547/docs

Redoc: http://localhost:8547/redoc

How to use the app
Book a table

Pick date + party size → Check availability

Click an available time

Fill details → Confirm booking

You’ll see a booking reference (copy button included)

Manage a booking

Switch to Manage booking tab

Paste your reference → Lookup

Update party size / special requests → Save changes

To cancel: choose reason → Cancel booking

Short architecture / design overview
Frameworks

React + TypeScript for UI

React Query for server state + caching

Axios for HTTP

React Hook Form + Zod for client-side validation

TailwindCSS for styling

Structure

bash
Copy code
src/
  api/              # axios client + API functions
  features/
    availability/   # availability search page
    booking/        # booking flow (form, confirm)
    manage/         # lookup, update, cancel
  App.tsx           # tab switch between book/manage
  main.tsx          # React Query provider + app mount
API communication

Base URL from VITE_API_BASE

Bearer token from VITE_API_TOKEN (or dev-bypass on backend)

Important: POST/PATCH bodies use application/x-www-form-urlencoded (not JSON).
We serialize with URLSearchParams / manual encoder.

Auth (per mock API)

Endpoints expect a Bearer token; for local dev you can:

Put a token in VITE_API_TOKEN, or

Enable DEV_NO_AUTH=1 in the backend to bypass in dev

UX considerations

Responsive layout across pages

Clear success and error messages

Booking reference visually highlighted + copy button

Scripts
bash
Copy code
# Start dev server
npm run dev

# Typecheck / build
npm run build

# Preview the production build
npm run preview
Configuration
.env.local (frontend)

ini
Copy code
VITE_API_BASE=http://localhost:8547
VITE_API_TOKEN=<optional: your bearer token>
If backend runs with DEV_NO_AUTH=1, you can leave VITE_API_TOKEN blank.

Troubleshooting
401 Unauthorized in browser

Ensure a valid token is set in VITE_API_TOKEN or the backend runs with DEV_NO_AUTH=1.

After editing .env.local, restart npm run dev.

CORS / preflight 405 on OPTIONS

Confirm CORSMiddleware in app/main.py includes:

allow_origins=["http://localhost:5173","http://127.0.0.1:5173"]

allow_methods=["*"], allow_headers=["*"]

422 Unprocessable Entity on availability

Ensure the frontend sends application/x-www-form-urlencoded and includes VisitDate, PartySize, ChannelCode.

Try a date within the next ~30 days (seeded by the mock).

Package build errors on Windows (Python)

Use Python 3.11 — Python 3.13 currently triggers native builds for pydantic-core.
```
