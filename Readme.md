# INPT Ride

INPT Ride is a campus bike and scooter rental platform built as an end-to-end academic and portfolio project.

It combines:

- a **Flutter student mobile app**
- a **React + Vite admin dashboard**
- a **Django REST Framework backend**
- a **PostgreSQL database**
- **Redis** for reservation locking and concurrency protection
- **Nginx** for serving the admin dashboard and reverse proxying API requests
- a **wallet-based billing and invoice flow**
- **Dockerized application services**
- **Jenkins DevSecOps pipelines**
- **Docker Hub image publishing**

The project addresses a real campus need: replacing informal WhatsApp group messages for bike and scooter reservations with a structured platform for availability tracking, reservations, ride management, wallet payments, and admin supervision.
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

- Dockerized Django backend
- Dockerized React admin dashboard served by Nginx
- PostgreSQL and Redis services
- Nginx reverse proxy for `/api` requests
- Jenkins backend/admin DevSecOps pipeline
- Jenkins mobile CI pipeline
- secret scanning
- Python SAST scanning
- dependency vulnerability scanning
- Docker image vulnerability scanning
- backend business tests
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
- automatic ride payment deduction
- wallet transaction history
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
- reservation validation
- reservation conflict handling
- Redis-based reservation locking
- ride lifecycle management
- pricing calculation
- wallet deduction on ride completion
- invoice generation
- analytics aggregation
- notifications for ride events

---

## Tech Stack

### Mobile App

- Flutter
- Dart

### Admin Dashboard

- React
- Vite
- Axios
- Nginx for production-like serving

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

The backend follows a **modular monolith** architecture.

The backend is a single Django project organized into domain modules:

- accounts
- vehicles
- reservations
- rides
- billing
- wallet
- notifications
- audit

This approach keeps the system easier to maintain and deploy while still keeping business domains separated.

---

## Runtime Architecture

The Dockerized runtime stack contains:

| Service | Technology | Purpose | Port |
|---|---|---|---|
| backend | Django + DRF | REST API | `8001 -> 8000` |
| postgres | PostgreSQL 16 | Main database | `5432` in dev / `5433` in prod-like |
| redis | Redis 7 | Reservation locking and cache support | `6379` in dev / `6380` in prod-like |
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
````

---

## Core Business Flow

### 1. Student Authentication

* the student signs in using Google
* the backend checks whether the email belongs to an authorized student
* if authorized, the student can access the app
* unauthorized users are rejected

### 2. Reservation

* the student selects a vehicle
* chooses a reservation date
* selects start and end hours
* submits the reservation
* the backend validates slot availability and reservation constraints
* Redis locking helps prevent concurrent reservation conflicts for the same vehicle/time slot

### 3. Start Ride

* the student starts the ride from the app
* the backend validates the reservation and vehicle
* the ride is created
* vehicle status changes to `in_use`
* reservation status changes accordingly
* a notification is generated

### 4. End Ride

* the student ends the ride
* the backend computes used hours
* ride pricing is calculated using the active pricing rule
* wallet balance is deducted
* an invoice is created
* vehicle becomes available again
* analytics are updated through invoice data

---

## Reservation Rules

Reservations are hour-based.

Rules include:

* reservation starts at exact hour boundaries
* minimum duration: 1 hour
* maximum duration: 10 hours
* vehicle must not already be reserved for an overlapping time slot
* vehicle must not currently be in use
* banned users cannot create reservations
* Redis is used to reduce race conditions during reservation creation

---

## Redis Reservation Locking

Redis is used for reservation concurrency protection.

When a student creates a reservation, the backend attempts to acquire a Redis lock for the selected:

```text
vehicle + date + start hour + end hour
```

If the lock cannot be acquired, the request returns a conflict response.

This protects the system from cases where two students try to reserve the same vehicle/time slot at nearly the same time.

PostgreSQL remains the source of truth, while Redis is used for short-lived locking.

---

## Billing Model

Billing is based on pricing rules stored in the backend.

Each pricing rule includes:

* vehicle type
* base fee
* hourly rate
* late return multiplier
* no-show fee
* active/inactive state

When a ride ends:

* used duration is computed
* total cost is calculated
* wallet balance is updated
* a wallet transaction is recorded
* an invoice is created and marked as paid when deduction succeeds

---

## Analytics

The admin analytics module provides visibility into financial activity.

Examples of analytics:

* total revenue
* revenue this month
* paid invoices count
* unpaid invoices count
* completed rides count
* average revenue per completed ride
* late penalties total
* damage penalties total
* revenue trend

The admin dashboard also includes:

* fleet indicators
* user/profile indicators
* recent reservations
* recent rides
* money analytics summary
* quick actions

---

## Backend Tests

The project includes business-focused Django tests for important backend domains.

Current backend test coverage includes:

* vehicle model tests
* pricing rule model tests
* reservation model validation tests
* reservation serializer validation tests
* reservation API tests
* Redis reservation lock behavior tests

These tests run inside the Jenkins backend/admin DevSecOps pipeline.

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
│   ├── docker-compose.prod.yml
│   └── backups/
│
├── docs/
│   ├── devsecops-pipeline.md
│   └── screenshots/
│       ├── product/
│       └── devops/
│
├── Jenkinsfile
├── Readme.md
└── .gitignore
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
* available vehicles
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
* Redis-backed reservation locking
* ride start and end
* wallet updates
* invoice generation
* analytics summary and revenue trend

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

Run backend tests:

```bash
docker compose -f infra/docker-compose.yml exec backend python manage.py test
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

Start the production-like stack:

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

Stop the production-like stack:

```bash
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod down --remove-orphans
```

---

## Docker Hub Images

The Jenkins pipeline publishes the backend and admin dashboard images to Docker Hub:

```text
nadaaath/inpt-ride-backend:latest
nadaaath/inpt-ride-admin-dashboard:latest
```

Pull images manually:

```bash
docker pull nadaaath/inpt-ride-backend:latest
docker pull nadaaath/inpt-ride-admin-dashboard:latest
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

* `.dockerignore`
* multi-stage Docker build
* a builder stage for Python wheels
* a smaller runtime image without build tools

Image size improvement:

```text
Before optimization: 815 MB
After optimization:  353 MB
```

This reduces upload time, improves registry reliability, and makes deployments faster.

---

## DevSecOps Pipelines

The project uses separated Jenkins pipelines.

This keeps server-side DevSecOps validation separate from mobile artifact generation.

```text
INPT-Ride-Backend-CI
INPT-Ride-Mobile-CI
INPT-Ride-Publish-Images
```

---

## Backend/Admin DevSecOps Pipeline

The backend/admin Jenkins pipeline validates the Dockerized platform.

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
Backend tests
  ↓
Runtime checks
  ↓
Full-stack smoke tests
  ↓
Docker Hub publishing
```

### Pipeline Stages

#### Environment Preparation

* checkout source code
* check Docker and Docker Compose versions
* clean local CI artifacts
* generate CI `.env` file

#### Security Scanning

| Tool      | Purpose                                    |
| --------- | ------------------------------------------ |
| Gitleaks  | detects leaked secrets                     |
| Bandit    | Python static application security testing |
| pip-audit | Python dependency vulnerability scanning   |
| npm audit | frontend dependency vulnerability scanning |
| Trivy     | Docker image vulnerability scanning        |

#### Backend Validation

* Docker Compose validation
* backend Docker image build
* backend image export
* Trivy backend image scan
* backend stack startup
* Django system check
* missing migrations check
* database migrations
* backend business tests
* backend smoke test

#### Admin Dashboard Validation

* `npm ci`
* `npm run build`
* admin dashboard dependency audit
* admin dashboard Docker image build
* admin dashboard image export
* Trivy admin dashboard image scan

#### Full-stack Validation

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

* Nginx serves the React dashboard
* Nginx proxies `/api` requests to Django
* the backend container is reachable
* the deployed stack works together

#### Docker Hub Publishing

After successful checks, Jenkins pushes images to Docker Hub:

```text
nadaaath/inpt-ride-backend:latest
nadaaath/inpt-ride-admin-dashboard:latest
```

Docker Hub credentials are stored securely in Jenkins Credentials and are not committed to the repository.

---

## Mobile CI Pipeline

The mobile pipeline validates the Flutter application separately.

Pipeline responsibilities:

* checkout source code
* configure Flutter for Jenkins
* configure Android SDK path
* run `flutter pub get`
* run `flutter analyze --no-fatal-infos`
* build debug APK
* archive `app-debug.apk` as a Jenkins artifact

This pipeline proves that the mobile app can be built automatically in CI.

---

## DevSecOps Tools Explained

### Gitleaks

Scans the repository for secrets such as:

* tokens
* passwords
* private keys
* accidental `.env` leaks

### Bandit

Scans Python source code for insecure patterns such as:

* hardcoded secrets
* unsafe subprocess usage
* insecure cryptography usage

### pip-audit

Checks Python dependencies against known vulnerability databases.

### npm audit

Checks frontend JavaScript dependencies for known vulnerabilities.

### Trivy

Scans Docker images for vulnerabilities in:

* operating system packages
* base images
* installed dependencies

The pipeline blocks on critical vulnerabilities.

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

Analyze the app:

```bash
flutter analyze --no-fatal-infos
```

Run the app:

```bash
flutter run
```

Build a debug APK:

```bash
flutter build apk --debug
```

For Android emulator access to the local backend, use:

```text
10.0.2.2
```

Example backend URL:

```text
http://10.0.2.2:8001/api/
```

---

## Screenshots

### Product Screenshots

#### Admin Dashboard Overview

![Admin Dashboard Overview](docs/screenshots/product/admin-dashboard-overview.png)

#### Fleet Management

![Fleet Management](docs/screenshots/product/admin-vehicles.png)

#### Ride Monitoring

![Ride Monitoring](docs/screenshots/product/admin-rides.png)

#### Revenue Analytics

![Revenue Analytics](docs/screenshots/product/admin-analytics.png)

#### Student Mobile Home

![Student Mobile Home](docs/screenshots/product/mobile-home.png)

#### Available Vehicles

![Available Vehicles](docs/screenshots/product/mobile-available-vehicles.png)

#### Wallet and Transactions

![Wallet](docs/screenshots/product/mobile-wallet.png)

#### Notifications

![Notifications](docs/screenshots/product/mobile-notifications.png)

---

### DevOps Screenshots

#### Jenkins Jobs Overview

![Jenkins Jobs Overview](docs/screenshots/devops/jenkins-jobs-overview.png)

#### Backend DevSecOps Pipeline

![Backend DevSecOps Pipeline](docs/screenshots/devops/jenkins-backend-pipeline-success.png)

#### Mobile CI APK Artifact

![Mobile CI APK Artifact](docs/screenshots/devops/jenkins-mobile-ci-apk-artifact.png)

#### Docker Hub Repositories

![Docker Hub Repositories](docs/screenshots/devops/dockerhub-repositories.png)

#### Docker Hub Backend Image

![Docker Hub Backend Image](docs/screenshots/devops/dockerhub-backend-image.png)

#### Docker Hub Admin Dashboard Image

![Docker Hub Admin Dashboard Image](docs/screenshots/devops/dockerhub-admin-dashboard-image.png)

---

## Example Functional Flow

### Student Side

1. Sign in with Google.
2. Access is allowed only if the email is in authorized students.
3. Browse available vehicles.
4. Reserve a vehicle.
5. Start a ride.
6. End the ride.
7. Wallet is deducted.
8. Invoice is generated.
9. Notification is sent.

### Admin Side

1. Log in to dashboard.
2. Monitor dashboard KPIs.
3. Manage vehicles and authorized students.
4. Adjust pricing rules.
5. Monitor reservations and rides.
6. View invoices.
7. View analytics.

---

## Demo Script

A clean demo sequence for presentation:

1. Show Docker Compose stack running.
2. Show Jenkins backend/admin DevSecOps pipeline.
3. Show Jenkins mobile CI APK artifact.
4. Show Docker Hub published images.
5. Open admin dashboard.
6. Show dashboard overview.
7. Show vehicles and pricing rules.
8. Show rides and analytics.
9. Open student app.
10. Show student home, wallet, available vehicles, and notifications.
11. Explain reservation and ride flow.
12. Explain wallet deduction and invoice-backed analytics.

---

## Current Strengths of the Project

* end-to-end system with mobile, web, backend, and database
* realistic campus mobility use case
* admin and student roles
* vehicle reservation and ride lifecycle
* wallet deduction logic
* invoice-backed analytics
* pricing configuration
* Redis reservation locking
* modular backend organization
* real Django business tests
* Dockerized backend and admin dashboard
* Nginx reverse proxy
* PostgreSQL and Redis services
* Jenkins backend/admin DevSecOps pipeline
* Jenkins mobile CI pipeline with APK artifact
* secret scanning
* SAST scanning
* dependency vulnerability scanning
* Docker image vulnerability scanning
* full-stack smoke testing
* Docker Hub publishing
* production-like deployment using registry images

---

## Future Improvements

* richer analytics charts
* invoice PDF export
* CSV import for authorized students
* improved mobile UI polish
* automated GitHub webhook trigger for Jenkins
* observability with Prometheus and Grafana
* Kubernetes deployment
* deployment to a cloud VM or Kubernetes cluster
* release versioning for Docker images
* production signing for mobile release builds

---

## Author

**Nada Tahiri Alaoui**

Project focused on:

* mobile development
* backend systems
* business logic implementation
* full-stack architecture
* Docker and containerization
* Jenkins CI/CD
* DevSecOps pipeline design
* cloud / DevOps readiness
