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

        stage('Run Migrations') {
            steps {
                echo 'Running Django migrations...'
                bat 'docker compose -f infra/docker-compose.yml exec -T backend python manage.py migrate'
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