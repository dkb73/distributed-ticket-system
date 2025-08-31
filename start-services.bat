@echo off
echo Starting Distributed Ticket System...

REM Stop any existing containers
echo Stopping existing containers...
docker-compose down

REM Start infrastructure services first
echo Starting infrastructure services (PostgreSQL, Redis, MongoDB, Kafka, Zookeeper)...
docker-compose up -d postgres redis mongo zookeeper kafka

REM Wait for PostgreSQL to be ready
echo Waiting for PostgreSQL to be ready...
timeout /t 15 /nobreak >nul

REM Wait for MongoDB to be ready
echo Waiting for MongoDB to be ready...
timeout /t 10 /nobreak >nul

REM Wait for Kafka to be ready
echo Waiting for Kafka to be ready...
timeout /t 10 /nobreak >nul

REM Start application services
echo Starting application services...
docker-compose up -d worker data-sync-service

REM Wait a bit for them to initialize
echo Waiting for worker and data-sync to initialize...
timeout /t 10 /nobreak >nul

REM Start API services
echo Starting API services...
docker-compose up -d write-api read-api

REM Wait for APIs to be ready
echo Waiting for APIs to be ready...
timeout /t 10 /nobreak >nul

REM Start nginx
echo Starting nginx gateway...
docker-compose up -d nginx

echo All services started! Check logs with: docker-compose logs -f
echo Access the system at: http://localhost:8080
pause
