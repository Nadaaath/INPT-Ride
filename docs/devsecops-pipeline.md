```text
docs/devsecops-pipeline.md
```

This file will explain:

```text
- architecture
- Docker setup
- Jenkins pipeline stages
- DevSecOps tools
- Docker Hub publishing
- prod-like deployment
- useful commands
```

## Step 1 — Create the documentation file

From project root:

```powershell
notepad docs\devsecops-pipeline.md
```

Paste this:

````md
# INPT Ride — DevSecOps Pipeline Documentation

## 1. Project Overview

INPT Ride is a campus bike/scooter rental platform composed of:

- Django REST Framework backend
- PostgreSQL database
- Redis cache service
- React admin dashboard
- Nginx reverse proxy for the admin dashboard
- Flutter mobile app

This document describes the Docker, Jenkins, security scanning, image publishing, and deployment workflow implemented for the project.

---

## 2. Runtime Architecture

The Dockerized stack contains:

| Service | Technology | Purpose | Port |
|---|---|---|---|
| backend | Django + DRF | REST API | 8001 → 8000 |
| postgres | PostgreSQL 16 | Main database | 5432 / 5433 |
| redis | Redis 7 | Cache / future async features | 6379 / 6380 |
| admin-dashboard | React + Nginx | Admin UI + API reverse proxy | 8002 → 80 |

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

## 3. Docker Setup

### Development Compose

Development uses:

```bash
docker compose -f infra/docker-compose.yml up --build
```

This Compose file builds images locally from the source code.

### Production-like Compose

Production-like deployment uses:

```bash
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod up -d
```

This Compose file pulls images from Docker Hub instead of building locally:

```text
nadaaath/inpt-ride-backend:latest
nadaaath/inpt-ride-admin-dashboard:latest
```

This simulates a real deployment environment where images are produced by CI and consumed by deployment.

---

## 4. Backend Docker Optimization

The backend Docker image was optimized using:

* `.dockerignore`
* multi-stage Docker build
* builder stage for Python wheels
* final runtime image without build tools

Image size improvement:

```text
Before optimization: 815 MB
After optimization:  353 MB
```

This reduces upload time, improves registry reliability, and makes deployments faster.

---

## 5. Jenkins Pipeline Overview

The Jenkins pipeline implements an end-to-end CI/DevSecOps workflow:

```text
GitHub
  ↓
Jenkins Pipeline
  ↓
Security scans
  ↓
Docker builds
  ↓
Image scans
  ↓
Runtime tests
  ↓
Full-stack smoke test
  ↓
Docker Hub push
```

---

## 6. Jenkins Pipeline Stages

The pipeline includes the following main stages:

### Environment preparation

* Checkout source code
* Check tool versions
* Create CI `.env` file
* Clean local CI artifacts

### Security checks

| Tool      | Purpose                              |
| --------- | ------------------------------------ |
| Gitleaks  | Detect leaked secrets                |
| Bandit    | Python static security analysis      |
| pip-audit | Python dependency vulnerability scan |
| npm audit | Admin dashboard dependency scan      |
| Trivy     | Docker image vulnerability scan      |

### Backend checks

* Docker Compose validation
* Backend Docker image build
* Backend image export
* Trivy backend image scan
* Start backend stack
* Django system check
* Missing migrations check
* Database migrations
* Backend tests
* Backend smoke test

### Admin dashboard checks

* `npm ci`
* `npm run build`
* Admin dashboard Docker image build
* Admin dashboard image export
* Trivy admin image scan

### Full-stack validation

The full stack is started using Docker Compose:

```text
postgres
redis
backend
admin-dashboard
```

Smoke tests validate:

```text
http://localhost:8002
http://localhost:8002/api/vehicles/
```

This confirms:

* Nginx serves the React dashboard
* Nginx proxies API requests to Django
* Backend container is reachable
* The stack works together, not just as isolated images

### Image publishing

After successful checks, Jenkins pushes images to Docker Hub:

```text
nadaaath/inpt-ride-backend:latest
nadaaath/inpt-ride-admin-dashboard:latest
```

Docker Hub credentials are stored securely in Jenkins Credentials, not in the repository.

---

## 7. DevSecOps Tools Explained

### Gitleaks

Scans the repository for secrets such as:

* tokens
* passwords
* private keys
* `.env` leaks

### Bandit

Scans Python source code for insecure patterns.

Example issues it can detect:

* hardcoded passwords
* unsafe subprocess usage
* insecure cryptography usage

### pip-audit

Checks Python dependencies against known vulnerability databases.

### npm audit

Checks frontend JavaScript dependencies for known vulnerabilities.

### Trivy

Scans Docker images for vulnerabilities in:

* OS packages
* installed dependencies
* base images

The pipeline currently blocks on CRITICAL vulnerabilities.

---

## 8. Docker Hub Publishing

Jenkins authenticates to Docker Hub using a Personal Access Token stored in Jenkins Credentials.

Credential ID:

```text
dockerhub-credentials
```

Published images:

```text
nadaaath/inpt-ride-backend:latest
nadaaath/inpt-ride-admin-dashboard:latest
```

---

## 9. Local Commands

### Start development stack

```bash
docker compose -f infra/docker-compose.yml up --build
```

### Stop development stack

```bash
docker compose -f infra/docker-compose.yml down --remove-orphans
```

### Start production-like stack

```bash
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod up -d
```

### Pull production images

```bash
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod pull
```

### Run migrations

```bash
docker compose -f infra/docker-compose.prod.yml --env-file .env.prod exec backend python manage.py migrate
```

### Test backend

```bash
curl http://localhost:8001/admin/
```

### Test admin dashboard

```bash
curl http://localhost:8002
```

### Test Nginx API proxy

```bash
curl http://localhost:8002/api/vehicles/
```

---

## 10. Ports

### Development

| Component       | URL                                            |
| --------------- | ---------------------------------------------- |
| Backend         | [http://localhost:8001](http://localhost:8001) |
| Admin dashboard | [http://localhost:8002](http://localhost:8002) |
| PostgreSQL      | localhost:5432                                 |
| Redis           | localhost:6379                                 |

### Production-like local deployment

| Component       | URL                                            |
| --------------- | ---------------------------------------------- |
| Backend         | [http://localhost:8001](http://localhost:8001) |
| Admin dashboard | [http://localhost:8002](http://localhost:8002) |
| PostgreSQL      | localhost:5433                                 |
| Redis           | localhost:6380                                 |

---

## 11. Current DevSecOps Milestone

The project now supports:

* Dockerized backend
* Dockerized admin dashboard
* PostgreSQL and Redis services
* Nginx reverse proxy
* Jenkins CI pipeline
* Secret scanning
* SAST scanning
* Dependency vulnerability scanning
* Docker image vulnerability scanning
* Full-stack smoke testing
* Docker Hub image publishing
* Production-like deployment from registry images
