# INPT Ride

INPT Ride is a campus bike and scooter rental platform built as an end-to-end academic and portfolio project.

It combines:

- a **Flutter student mobile app**
- a **React + Vite admin dashboard**
- a **Django REST Framework backend**
- a **PostgreSQL database**
- **Redis** for cache / future concurrency features
- **Nginx** for serving the admin dashboard and reverse proxying API requests
- a **wallet-based billing and invoice flow**
- a complete **Jenkins DevSecOps pipeline**

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

The project also includes a DevSecOps workflow around the application:

- Dockerized backend
- Dockerized admin dashboard
- PostgreSQL and Redis services
- Nginx reverse proxy
- Jenkins CI pipeline
- security scanning
- Docker image vulnerability scanning
- full-stack smoke testing
- Docker Hub image publishing
- production-like deployment using registry images

---

## Main Features

### Student Mobile App

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

### Admin Dashboard

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

### Backend Business Logic

- authorized student verification
- reservation validation and conflict handling
- ride lifecycle management
- pricing calculation
- wallet deduction on ride completion
- invoice generation
- analytics aggregation

---

## Tech Stack

### Mobile App

- Flutter
- Dart

### Admin Dashboard

- React
- Vite
- Axios
- Nginx for production serving

### Backend

- Python
- Django
- Django REST Framework

### Database and Cache

- PostgreSQL
- Redis

### DevOps / DevSecOps

- Docker
- Docker Compose
- Jenkins
- Gitleaks
- Bandit
- pip-audit
- npm audit
- Trivy
- Docker Hub

---

## Architecture

The project follows a **modular monolith** backend architecture.

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

## Runtime Architecture

The Dockerized runtime stack contains:

| Service | Technology | Purpose | Port |
|---|---|---|---|
| backend | Django + DRF | REST API | `8001 -> 8000` |
| postgres | PostgreSQL 16 | Main database | `5432` in dev / `5433` in prod-like |
| redis | Redis 7 | Cache / future concurrency support | `6379` in dev / `6380` in prod-like |
| admin-dashboard | React + Nginx | Admin UI + API reverse proxy | `8002 -> 80` |

Runtime request flow:

```text
Browser
  ↓
http://localhost:8002
  ↓
Nginx admin-dashboard container
  ├── serves React static files
  └── proxies /api requests to Django backend
        ↓
      Django backend
        ↓
   PostgreSQL / Redis
```

---

## Core Business Flow

### 1. Student Authentication

- the student signs in using Google
- the backend checks whether the email belongs to an authorized student
- if authorized, the student can access the app

### 2. Reservation

- the student selects a vehicle
- chooses a reservation date
- selects start and end hours
- submits the reservation
- the backend validates slot availability and reservation constraints

### 3. Start Ride

- the student starts the ride from the app
- the backend validates the reservation and vehicle
- the ride is created
- vehicle status changes to `in_use`
- reservation status changes accordingly

### 4. End Ride

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

```text
.
├── backend/
│   ├── accounts/
│   ├── audit/
│   ├── billing/
│   ├── config/
│   ├── notifications/
│   ├── reservations/
│   ├── rides/
│   ├── vehicles/
│   ├── wallet/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── manage.py
│   └── requirements.txt
│
├── admin-dashboard/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── mobile-app/
│   ├── lib/
│   │   ├── models/
│   │   ├── pages/
│   │   ├── services/
│   │   └── main.dart
│   ├── pubspec.yaml
│   └── android/
│
├── infra/
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
├── docs/
│   └── devsecops-pipeline.md
│
├── Jenkinsfile
├── Readme.md
└── .gitignore
```

---

## Main Admin Pages

- Dashboard
- Vehicles
- Authorized Students
- Profiles
- Wallet Top Up
- Pricing
- Reservations
- Rides
- Analytics
- Invoices

---

## Main Student App Pages

- authentication choice
- login / set password
- home
- create reservation
- my reservations
- my rides
- notifications
- wallet
- profile-related flows

---

## API Highlights

Examples of backend responsibilities include:

- authentication and authorization
- vehicle listing and management
- reservation creation and cancellation
- ride start and end
- wallet updates
- invoice generation
- analytics summary and revenue trend

Examples of admin endpoints:

```text
/api/billing/admin/
/api/billing/admin/invoices/
/api/billing/admin/analytics/summary/
/api/billing/admin/analytics/revenue-trend/
```

Examples of operational endpoints:

```text
/api/vehicles/
/api/reservations/
/api/rides/
/api/wallet/
```

---

## Docker Setup

The project supports two Docker Compose workflows:

1. **Development stack**: builds images locally from source code.
2. **Production-like stack**: pulls published images from Docker Hub.

---

## Development Stack

The development stack builds the backend and admin dashboard images locally.

```bash
docker compose -f infra/docker-compose.yml up --build
```

Services:

```text
PostgreSQL:        localhost:5432
Redis:             localhost:6379
Backend:           http://localhost:8001
Admin dashboard:   http://localhost:8002
```

Run backend migrations:

```bash
docker compose -f infra/docker-compose.yml exec backend python manage.py migrate
```

Stop the stack:

```bash
docker compose -f infra/docker-compose.yml down --remove-orphans
```

---

## Production-like Deployment

The production-like stack pulls images from Docker Hub instead of building them locally.

Published images:

```text
nadaaath/inpt-ride-backend:latest
nadaaath/inpt-ride-admin-dashboard:latest
```

Start the prod-like stack:

```bash
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod pull
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod up -d
```

Run migrations:

```bash
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod exec backend python manage.py migrate
```

Services:

```text
PostgreSQL:        localhost:5433
Redis:             localhost:6380
Backend:           http://localhost:8001
Admin dashboard:   http://localhost:8002
```

Stop the prod-like stack:

```bash
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod down --remove-orphans
```

---

## Environment Variables

Create a local `.env` file for development.

Example:

```env
DJANGO_SECRET_KEY=your-local-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,10.0.2.2

POSTGRES_DB=inpt_ride_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379

GOOGLE_WEB_CLIENT_ID=your-google-client-id
```

For production-like local deployment, create `.env.prod`.

Example:

```env
DJANGO_SECRET_KEY=change-this-prod-secret-key
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,inpt_ride_backend_prod

POSTGRES_DB=inpt_ride_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379

GOOGLE_WEB_CLIENT_ID=prod-placeholder
```

Important:

```text
.env
.env.*
```

must stay ignored and must not be committed.

---

## Backend Docker Optimization

The backend Docker image was optimized using:

- `.dockerignore`
- multi-stage Docker build
- a builder stage for Python wheels
- a smaller runtime image without build tools

Image size improvement:

```text
Before optimization: 815 MB
After optimization:  353 MB
```

This reduces upload time, improves registry reliability, and makes deployments faster.

---

## DevSecOps Pipeline

The project includes an end-to-end Jenkins DevSecOps pipeline.

Pipeline flow:

```text
GitHub
  ↓
Jenkins
  ↓
Security scans
  ↓
Docker builds
  ↓
Image vulnerability scans
  ↓
Runtime checks
  ↓
Full-stack smoke tests
  ↓
Docker Hub publishing
```

---

## Jenkins Pipeline Stages

The Jenkins pipeline includes:

### Environment Preparation

- checkout source code
- check Docker and Docker Compose versions
- clean local CI artifacts
- generate CI `.env` file

### Security Scanning

| Tool | Purpose |
|---|---|
| Gitleaks | detects leaked secrets |
| Bandit | Python static application security testing |
| pip-audit | Python dependency vulnerability scanning |
| npm audit | frontend dependency vulnerability scanning |
| Trivy | Docker image vulnerability scanning |

### Backend Validation

- Docker Compose validation
- backend Docker image build
- backend image export
- Trivy backend image scan
- backend stack startup
- Django system check
- missing migrations check
- database migrations
- backend tests
- backend smoke test

### Admin Dashboard Validation

- `npm ci`
- `npm run build`
- admin dashboard dependency audit
- admin dashboard Docker image build
- admin dashboard image export
- Trivy admin image scan

### Full-stack Validation

The pipeline starts the full Docker Compose stack:

```text
postgres
redis
backend
admin-dashboard
```

Then it validates:

```text
http://localhost:8002
http://localhost:8002/api/vehicles/
```

This confirms that:

- Nginx serves the React dashboard
- Nginx proxies `/api` requests to Django
- the backend container is reachable
- the deployed stack works together

### Docker Hub Publishing

After successful checks, Jenkins pushes images to Docker Hub:

```text
nadaaath/inpt-ride-backend:latest
nadaaath/inpt-ride-admin-dashboard:latest
```

Docker Hub credentials are stored securely in Jenkins Credentials and are not committed to the repository.

---

## DevSecOps Tools Explained

### Gitleaks

Scans the repository for secrets such as:

- tokens
- passwords
- private keys
- accidental `.env` leaks

### Bandit

Scans Python source code for insecure patterns such as:

- hardcoded secrets
- unsafe subprocess usage
- insecure cryptography usage

### pip-audit

Checks Python dependencies against known vulnerability databases.

### npm audit

Checks frontend JavaScript dependencies for known vulnerabilities.

### Trivy

Scans Docker images for vulnerabilities in:

- operating system packages
- base images
- installed dependencies

The pipeline currently blocks on CRITICAL vulnerabilities.

---

## Manual Setup Instructions

These instructions are useful if you want to run each part manually without Docker.

---

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd INPT-Ride
```

---

## 2. Backend Setup

Go to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment.

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

## 3. Admin Dashboard Setup

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

## 4. Mobile App Setup

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

If using the Android emulator, make sure backend URLs are configured properly.

For Android emulator access to the local backend, use:

```text
10.0.2.2
```

Example backend URL:

```text
http://10.0.2.2:8001/api/
```

---

## Example Functional Flow

### Student Side

1. Sign in with Google.
2. Access is allowed only if the email is in authorized students.
3. Reserve a vehicle.
4. Start ride.
5. End ride.
6. Wallet is deducted.
7. Invoice is generated.

### Admin Side

1. Log in to dashboard.
2. Monitor reservations and rides.
3. Manage vehicles and authorized students.
4. Adjust pricing rules.
5. View invoices.
6. View analytics.

---

## Current Strengths of the Project

- end-to-end system with mobile, web, backend, and database
- real business flow from reservation to invoice
- admin and student roles
- invoice-backed analytics
- pricing configuration
- wallet deduction logic
- modular backend organization
- Dockerized backend and admin dashboard
- Nginx reverse proxy
- PostgreSQL and Redis services
- Jenkins CI pipeline
- secret scanning
- SAST scanning
- dependency vulnerability scanning
- Docker image vulnerability scanning
- full-stack smoke testing
- Docker Hub publishing
- production-like deployment using registry images

---

## Screenshots

Add screenshots here for:

- dashboard
- vehicles page
- reservations page
- rides page
- invoices page
- analytics page
- student home page
- reservation flow
- wallet and invoice flow
- Jenkins pipeline
- Docker Hub repositories
- Docker Compose running stack

Example:

```markdown
## Screenshots

### Admin Dashboard
![Dashboard](./screenshots/dashboard.png)

### Vehicles Management
![Vehicles](./screenshots/vehicles.png)

### Analytics
![Analytics](./screenshots/analytics.png)

### Jenkins Pipeline
![Jenkins Pipeline](./screenshots/jenkins-pipeline.png)
```

---

## Demo Script

A clean demo sequence for presentation:

1. Show Docker Compose stack running.
2. Show Jenkins pipeline stages.
3. Show Docker Hub published images.
4. Open admin dashboard.
5. Show vehicles and pricing rules.
6. Show authorized students.
7. Open student app.
8. Log in with authorized student account.
9. Create reservation.
10. Start ride.
11. End ride.
12. Show wallet deduction.
13. Return to admin dashboard.
14. Show ride, invoice, and analytics updates.

---

## Future Improvements

- mobile CI with `flutter analyze`, `flutter test`, and APK build artifact
- better notification workflows
- richer analytics charts
- invoice export
- CSV import for authorized students
- Redis-based reservation locking refinement
- observability with Prometheus and Grafana
- Kubernetes deployment
- GitHub webhook trigger for Jenkins
- deployment to a cloud VM or Kubernetes cluster

---

## Author

Nada Tahiri Alaoui

Project focused on:

- mobile development
- backend systems
- business logic implementation
- full-stack architecture
- Docker and containerization
- Jenkins CI/CD
- DevSecOps pipeline design
- cloud / DevOps readiness
