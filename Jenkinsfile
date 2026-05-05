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

        stage('Container Image Scan with Trivy') {
    steps {
        echo 'Scanning backend Docker image with Trivy...'
        bat 'trivy image --severity HIGH,CRITICAL --exit-code 1 infra-backend:latest'
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
    }

    post {
        always {
            echo 'Stopping Docker Compose stack...'
            bat 'docker compose -f infra/docker-compose.yml down'
        }

        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}