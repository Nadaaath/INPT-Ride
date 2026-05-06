pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Tool Versions') {
            steps {
                echo 'Checking Docker and Docker Compose...'
                bat 'docker --version'
                bat 'docker compose version'
            }
        }

        stage('Clean Local CI Secrets') {
    steps {
        echo 'Removing old local CI environment files before scanning...'
        bat 'if exist .env del .env'
        bat 'if exist .trivy-cache rmdir /S /Q .trivy-cache'
        bat 'if exist backend-image.tar del backend-image.tar'
    }
}

       stage('Secret Scan with Gitleaks') {
    steps {
        echo 'Scanning repository for leaked secrets...'
        bat 'docker run --rm -v "%CD%:/repo" zricethezav/gitleaks:latest detect --source="/repo" --no-git --verbose'
    }
}


        stage('Python SAST with Bandit') {
    steps {
        echo 'Running Bandit Python security scan...'
        bat 'docker run --rm -v "%CD%:/repo" python:3.12-slim sh -c "pip install bandit && bandit -r /repo/backend -x /repo/backend/venv,/repo/backend/.venv"'
    }
}

        stage('Python Dependency Scan with pip-audit') {
    steps {
        echo 'Running pip-audit dependency vulnerability scan...'
        bat 'docker run --rm -v "%CD%:/repo" -w /repo/backend python:3.12-slim sh -c "pip install pip-audit && pip-audit -r requirements.txt"'
    }
}

        stage('Prepare CI Environment') {
    steps {
        echo 'Creating CI .env file...'
        powershell '''
@'
DJANGO_SECRET_KEY=ci-secret-key-for-jenkins
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend,10.0.2.2

POSTGRES_DB=inpt_ride_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

REDIS_HOST=redis
REDIS_PORT=6379

GOOGLE_WEB_CLIENT_ID=ci-placeholder
'@ | Set-Content -Path .env -Encoding UTF8
        '''
    }
}


        stage('Validate Docker Compose') {
            steps {
                echo 'Validating Docker Compose configuration...'
                bat 'docker compose -f infra/docker-compose.yml config'
            }
        }

        stage('Build Backend Image') {
    steps {
        echo 'Building Django backend Docker image...'
        bat 'docker compose -f infra/docker-compose.yml build backend'
    }
}

        stage('Export Backend Image') {
    steps {
        echo 'Exporting backend Docker image for Trivy scan...'
        bat 'docker save infra-backend:latest -o backend-image.tar'
    }
}

        stage('Container Image Scan with Trivy') {
    steps {
        echo 'Preparing Trivy cache directory...'
        bat 'if not exist "C:\\ProgramData\\Jenkins\\.trivy-cache" mkdir "C:\\ProgramData\\Jenkins\\.trivy-cache"'

        echo 'Scanning backend Docker image with Trivy - blocking on CRITICAL only...'
        bat 'docker run --rm -v "%CD%:/repo" -v "C:/ProgramData/Jenkins/.trivy-cache:/root/.cache/trivy" aquasec/trivy:latest image --input /repo/backend-image.tar --severity CRITICAL --exit-code 1 --scanners vuln --timeout 15m'
    }
}


        stage('Start Backend Stack') {
            steps {
                echo 'Starting PostgreSQL, Redis, and backend...'
                bat 'docker compose -f infra/docker-compose.yml up -d postgres redis backend'
            }
        }

        stage('Run Django Checks') {
            steps {
                echo 'Running Django system checks...'
                bat 'docker compose -f infra/docker-compose.yml exec -T backend python manage.py check'
            }
        }

        stage('Check Missing Migrations') {
    steps {
        echo 'Checking for missing Django migrations...'
        bat 'docker compose -f infra/docker-compose.yml exec -T backend python manage.py makemigrations --check --dry-run'
    }
}

        stage('Run Migrations') {
            steps {
                echo 'Running Django migrations...'
                bat 'docker compose -f infra/docker-compose.yml exec -T backend python manage.py migrate'
            }
        }

        stage('Run Backend Tests') {
    steps {
        echo 'Running Django backend tests...'
        bat 'docker compose -f infra/docker-compose.yml exec -T backend python manage.py test'
    }
}

        stage('Smoke Test Backend') {
            steps {
                echo 'Testing Django admin endpoint...'
                powershell '''
                $maxAttempts = 10
                $attempt = 1

                while ($attempt -le $maxAttempts) {
                    try {
                        $response = Invoke-WebRequest http://localhost:8001/admin/ -UseBasicParsing
                        if ($response.StatusCode -eq 200) {
                            Write-Host "Backend smoke test passed."
                            exit 0
                        }
                    } catch {
                        Write-Host "Backend not ready yet. Attempt $attempt/$maxAttempts"
                        Start-Sleep -Seconds 5
                    }

                    $attempt++
                }

                Write-Error "Backend smoke test failed."
                exit 1
                '''
            }
        }

        stage('Build Admin Dashboard') {
    steps {
        echo 'Installing and building React admin dashboard...'
        bat 'cd admin-dashboard && npm ci'
        bat 'cd admin-dashboard && npm run build'
    }
}

    

    stage('Admin Dashboard Dependency Audit') {
    steps {
        echo 'Running npm audit for admin dashboard...'
        bat 'cd admin-dashboard && npm audit --audit-level=high || exit 0'
    }
}

    stage('Build Admin Dashboard Image') {
    steps {
        echo 'Building admin dashboard Docker image...'
        bat 'docker compose -f infra/docker-compose.yml build admin-dashboard'
    }
}

    stage('Export Admin Dashboard Image') {
    steps {
        echo 'Exporting admin dashboard Docker image for Trivy scan...'
        bat 'docker save infra-admin-dashboard:latest -o admin-dashboard-image.tar'
    }
}

stage('Scan Admin Dashboard Image with Trivy') {
    steps {
        echo 'Preparing Trivy cache directory...'
        bat 'if not exist "C:\\ProgramData\\Jenkins\\.trivy-cache" mkdir "C:\\ProgramData\\Jenkins\\.trivy-cache"'

        echo 'Scanning admin dashboard Docker image with Trivy - blocking on CRITICAL only...'
        bat 'docker run --rm -v "%CD%:/repo" -v "C:/ProgramData/Jenkins/.trivy-cache:/root/.cache/trivy" aquasec/trivy:latest image --input /repo/admin-dashboard-image.tar --severity CRITICAL --exit-code 1 --scanners vuln --timeout 15m'
    }
}

    stage('Start Full Stack') {
    steps {
        echo 'Starting full Docker Compose stack...'
        bat 'docker compose -f infra/docker-compose.yml up -d postgres redis backend admin-dashboard'
    }
}

    stage('Smoke Test Full Stack') {
    steps {
        echo 'Testing admin dashboard through Nginx...'
        powershell '''
        $maxAttempts = 15
        $attempt = 1

        while ($attempt -le $maxAttempts) {
            try {
                $dashboard = Invoke-WebRequest http://localhost:8002 -UseBasicParsing
                if ($dashboard.StatusCode -eq 200) {
                    Write-Host "Admin dashboard is reachable through Nginx."
                    break
                }
            } catch {
                Write-Host "Admin dashboard not ready yet. Attempt $attempt/$maxAttempts"
                Start-Sleep -Seconds 5
            }

            $attempt++
        }

        if ($attempt -gt $maxAttempts) {
            Write-Error "Admin dashboard smoke test failed."
            exit 1
        }
        '''

        echo 'Testing API proxy through Nginx...'
        powershell '''
        $maxAttempts = 10
        $attempt = 1

        while ($attempt -le $maxAttempts) {
            try {
                $api = Invoke-WebRequest http://localhost:8002/api/vehicles/ -UseBasicParsing
                if ($api.StatusCode -eq 200) {
                    Write-Host "Nginx API proxy smoke test passed."
                    exit 0
                }
            } catch {
                Write-Host "API proxy not ready yet. Attempt $attempt/$maxAttempts"
                Start-Sleep -Seconds 5
            }

            $attempt++
        }

        Write-Error "Nginx API proxy smoke test failed."
        exit 1
        '''
    }
}

    stage('Push Docker Images') {
    steps {
        echo 'Pushing Docker images to Docker Hub...'

        withCredentials([usernamePassword(
            credentialsId: 'dockerhub-credentials',
            usernameVariable: 'DOCKERHUB_USER',
            passwordVariable: 'DOCKERHUB_TOKEN'
        )]) {
            bat 'echo %DOCKERHUB_TOKEN% | docker login -u %DOCKERHUB_USER% --password-stdin'

            bat 'docker tag infra-backend:latest %DOCKERHUB_USER%/inpt-ride-backend:%BUILD_NUMBER%'
            bat 'docker tag infra-backend:latest %DOCKERHUB_USER%/inpt-ride-backend:latest'

            bat 'docker tag infra-admin-dashboard:latest %DOCKERHUB_USER%/inpt-ride-admin-dashboard:%BUILD_NUMBER%'
            bat 'docker tag infra-admin-dashboard:latest %DOCKERHUB_USER%/inpt-ride-admin-dashboard:latest'

            bat 'docker push %DOCKERHUB_USER%/inpt-ride-backend:%BUILD_NUMBER%'
            bat 'docker push %DOCKERHUB_USER%/inpt-ride-backend:latest'

            bat 'docker push %DOCKERHUB_USER%/inpt-ride-admin-dashboard:%BUILD_NUMBER%'
            bat 'docker push %DOCKERHUB_USER%/inpt-ride-admin-dashboard:latest'

            bat 'docker logout'
        }
    }
}

    }

    post {
    always {
        echo 'Stopping Docker Compose stack...'
        bat 'docker compose -f infra/docker-compose.yml down --remove-orphans'
        bat 'if exist backend-image.tar del backend-image.tar'
        bat 'if exist admin-dashboard-image.tar del admin-dashboard-image.tar'
    }

    success {
        echo 'Pipeline completed successfully.'
    }

    failure {
        echo 'Pipeline failed.'
    }
}
}