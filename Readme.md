Here’s a full README you can use and adapt.

````markdown
# INPT Ride

INPT Ride is a campus bike and scooter rental platform built as an end-to-end academic and portfolio project.

It combines:
- a **Flutter student mobile app**
- a **React + Vite admin dashboard**
- a **Django REST backend**
- a **PostgreSQL database**
- a **wallet-based billing and invoice flow**
- **analytics** for operational and financial monitoring

The project is designed to model a realistic supervised campus rental system rather than a basic CRUD demo.

---

## Overview

INPT Ride allows authorized students to reserve a bike or scooter, start a ride at the station, end the ride after use, and pay automatically through their wallet balance.

On the admin side, the platform provides management and monitoring tools for:
- vehicles
- authorized students
- user profiles
- reservations
- rides
- wallet operations
- pricing rules
- invoices
- analytics

---

## Main Features

### Student mobile app
- Google-based student authentication
- authorized student access control
- browse available vehicles
- reserve a vehicle by date and hour slot
- view reservations
- start a ride
- end a ride
- wallet balance tracking
- ride payment deduction
- notifications
- ride and reservation history

### Admin dashboard
- admin login
- dashboard overview
- manage vehicles
- manage authorized students
- manage user profiles
- top up wallet balances
- manage pricing rules
- monitor reservations
- monitor rides
- view invoices
- view analytics and revenue insights

### Backend business logic
- authorized student verification
- reservation validation and conflict handling
- ride lifecycle management
- pricing calculation
- wallet deduction on ride completion
- invoice generation
- analytics aggregation

---

## Tech Stack

### Frontend
- **Flutter** for the student mobile app
- **React + Vite** for the admin dashboard

### Backend
- **Django**
- **Django REST Framework**

### Database
- **PostgreSQL**

### Other
- **Redis** planned/used for concurrency and locking support
- **Docker Compose** for local development orchestration

---

## Architecture

The project follows a **modular monolith** architecture.

The backend is a single Django project organized into domain modules such as:
- accounts
- vehicles
- reservations
- rides
- billing
- wallet
- notifications
- audit

This approach keeps the project easier to maintain and deploy while still reflecting real backend separation of responsibilities.

---

## Core Business Flow

### 1. Student authentication
- the student signs in using Google
- the backend checks whether the email belongs to an authorized student
- if authorized, the student can access the app

### 2. Reservation
- the student selects a vehicle
- chooses a reservation date
- selects start and end hours
- submits the reservation
- the backend validates slot availability and reservation constraints

### 3. Start ride
- the student starts the ride from the app
- the backend validates the reservation and vehicle
- the ride is created
- vehicle status changes to `in_use`
- reservation status changes accordingly

### 4. End ride
- the student ends the ride
- the backend computes used hours
- ride pricing is calculated using the active pricing rule
- wallet balance is deducted
- an invoice is created
- vehicle becomes available again
- analytics become updated through invoice data

---

## Billing Model

Billing is based on pricing rules stored in the backend.

Each pricing rule includes:
- vehicle type
- base fee
- hourly rate
- late return multiplier
- no-show fee
- active/inactive state

When a ride ends:
- used duration is computed
- total cost is calculated
- wallet balance is updated
- a wallet transaction is recorded
- an invoice is created and marked as paid when deduction succeeds

---

## Analytics

The admin analytics module provides visibility into financial activity.

Examples of analytics:
- revenue today
- revenue this week
- revenue this month
- paid invoices count
- unpaid invoices count
- completed rides count
- average revenue per completed ride
- penalties totals

The admin dashboard also includes:
- recent reservations
- recent rides
- money analytics summary
- quick actions

---

## Project Structure

### Backend
```text
backend/
├── accounts/
├── audit/
├── billing/
├── config/
├── notifications/
├── reservations/
├── rides/
├── vehicles/
├── wallet/
├── manage.py
└── requirements.txt
````

### Admin dashboard

```text
admin-dashboard/
├── src/
│   ├── api/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

### Mobile app

```text
mobile-app/
├── lib/
│   ├── models/
│   ├── pages/
│   ├── services/
│   └── main.dart
├── pubspec.yaml
└── android/
```

---

## Main Admin Pages

* Dashboard
* Vehicles
* Authorized Students
* Profiles
* Wallet Top Up
* Pricing
* Reservations
* Rides
* Analytics
* Invoices

---

## Main Student App Pages

* authentication choice
* login / set password
* home
* create reservation
* my reservations
* my rides
* notifications
* wallet
* profile-related flows

---

## API Highlights

Examples of backend responsibilities include:

* authentication and authorization
* vehicle listing and management
* reservation creation and cancellation
* ride start and end
* wallet updates
* invoice generation
* analytics summary and revenue trend

Examples of admin endpoints:

* `/api/billing/admin/`
* `/api/billing/admin/invoices/`
* `/api/billing/admin/analytics/summary/`
* `/api/billing/admin/analytics/revenue-trend/`

Examples of operational endpoints:

* `/api/vehicles/`
* `/api/reservations/`
* `/api/rides/`
* `/api/wallet/`

---

## Setup Instructions

## 1. Clone the repository

```bash
git clone <your-repository-url>
cd INPT-Ride
```

---

## 2. Backend setup

Go to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment if needed:

### Windows PowerShell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Apply migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Run the backend server:

```bash
python manage.py runserver 0.0.0.0:8001
```

---

## 3. Admin dashboard setup

Go to the admin dashboard directory:

```bash
cd admin-dashboard
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The admin dashboard runs by default on Vite's local dev port.

---

## 4. Mobile app setup

Go to the Flutter app directory:

```bash
cd mobile-app
```

Install Flutter dependencies:

```bash
flutter pub get
```

Run the app:

```bash
flutter run
```

If using the Android emulator, make sure backend URLs are configured properly, for example:

* `10.0.2.2` for Android emulator access to local backend

---

## Environment Notes

Make sure:

* PostgreSQL is running
* backend database credentials are correct
* frontend and Flutter app point to the correct backend URL
* Google authentication credentials are configured for student login if used

---

## Example Functional Flow

### Student side

1. Sign in with Google
2. Access is allowed only if the email is in authorized students
3. Reserve a vehicle
4. Start ride
5. End ride
6. Wallet is deducted
7. Invoice is generated

### Admin side

1. Log in to dashboard
2. Monitor reservations and rides
3. Manage vehicles and authorized students
4. Adjust pricing rules
5. View invoices
6. View analytics

---

## Current Strengths of the Project

* end-to-end system with mobile, web, backend, and database
* real business flow from reservation to invoice
* admin and student roles
* invoice-backed analytics
* pricing configuration
* wallet deduction logic
* modular backend organization
* strong portfolio value for software engineering / DevOps / cloud path

---

## Possible Future Improvements

* better notification workflows
* richer analytics charts
* invoice export
* CSV import for authorized students
* station hardware integration simulation
* improved penalty rules
* Redis-based reservation locking refinement
* Dockerized full local stack
* CI/CD pipeline
* observability / monitoring
* Kubernetes deployment

---

## Screenshots

Add screenshots here for:

* dashboard
* vehicles page
* reservations page
* rides page
* invoices page
* analytics page
* student home page
* reservation flow
* wallet and invoice flow

Example:

```markdown
## Screenshots

### Admin Dashboard
![Dashboard](./screenshots/dashboard.png)

### Vehicles Management
![Vehicles](./screenshots/vehicles.png)

### Analytics
![Analytics](./screenshots/analytics.png)
```

---

## Demo Script

A clean demo sequence for presentation:

1. Show admin dashboard
2. Show vehicles and pricing rules
3. Show authorized students
4. Open student app
5. Log in with authorized student account
6. Create reservation
7. Start ride
8. End ride
9. Show wallet deduction
10. Return to admin dashboard
11. Show ride, invoice, and analytics updates

---

## Author

Nada Tahiri Alaoui

project focused on:

* mobile development
* backend systems
* business logic implementation
* full-stack architecture
* cloud / DevOps readiness

---

