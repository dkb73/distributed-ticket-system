#!/bin/bash

echo "Starting Distributed Ticket System..."

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down

# Start infrastructure services first
echo "Starting infrastructure services (PostgreSQL, Redis, MongoDB, Kafka, Zookeeper)..."
docker-compose up -d postgres redis mongo zookeeper kafka

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 15

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to be ready..."
sleep 10

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
sleep 10

# Start application services
echo "Starting application services..."
docker-compose up -d worker data-sync-service

# Wait a bit for them to initialize
echo "Waiting for worker and data-sync to initialize..."
sleep 10

# Start API services
echo "Starting API services..."
docker-compose up -d write-api read-api

# Wait for APIs to be ready
echo "Waiting for APIs to be ready..."
sleep 10

# Start nginx
echo "Starting nginx gateway..."
docker-compose up -d nginx

echo "All services started! Check logs with: docker-compose logs -f"
echo "Access the system at: http://localhost:8080"
