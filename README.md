# Distributed Ticket Booking System

A microservices-based distributed ticket booking system built with Node.js, Docker, and various databases.

## 🏗️ Architecture

This system consists of the following microservices:

- **Write-API**: Handles ticket booking requests (PostgreSQL + Kafka)
- **Read-API**: Serves event data (MongoDB)
- **Worker**: Processes booking requests asynchronously (Redis + PostgreSQL)
- **Data-Sync-Service**: Synchronizes data between PostgreSQL and MongoDB
- **Nginx**: API Gateway for routing requests

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd distributed-ticket-system
```

### 2. Start the System

#### Option A: Use the Startup Script (Recommended)

**Windows:**
```bash
.\start-services.bat
```

**Linux/Mac:**
```bash
chmod +x start-services.sh
./start-services.sh
```

#### Option B: Manual Startup

```bash
# Start infrastructure services first
docker-compose up -d postgres redis mongo zookeeper kafka

# Wait for them to be ready (about 30 seconds), then start application services
docker-compose up -d worker data-sync-service write-api read-api nginx
```

### 3. Verify the System is Running

```bash
docker-compose ps
```

All services should show as "Up" or "Healthy".

## 📡 API Endpoints

### Write API (Booking)
- **URL**: `http://localhost:3000/api/book`
- **Method**: POST
- **Body**:
```json
{
  "userId": 123,
  "eventId": 1,
  "seatId": "A1"
}
```

### Read API (Events)
- **URL**: `http://localhost:3001/api/events`
- **Method**: GET

### Nginx Gateway
- **URL**: `http://localhost:8080`
- **Routes**:
  - `POST /api/book` → Write API
  - `GET /api/events` → Read API

## 🧪 Testing the System

### 1. Test Write API
```bash
curl -X POST http://localhost:3000/api/book \
  -H "Content-Type: application/json" \
  -d '{"userId": 123, "eventId": 1, "seatId": "A1"}'
```

### 2. Test Read API
```bash
curl http://localhost:3001/api/events
```

### 3. Check Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f write-api
docker-compose logs -f worker
docker-compose logs -f data-sync-service
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Make sure ports 3000, 3001, 8080, 5432, 6379, 27017, 9092 are available
   - Stop any existing services using these ports

2. **Container Name Conflicts**
   - Run `docker-compose down` to stop all containers
   - Then restart with `.\start-services.bat`

3. **Database Connection Issues**
   - Wait for infrastructure services to be fully ready (check with `docker-compose ps`)
   - Look for "Healthy" status for PostgreSQL and MongoDB

4. **Infinite Logs**
   - This usually means a service is crashing and restarting
   - Check individual service logs: `docker-compose logs <service-name>`

### Reset Everything

If you need to start fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Remove all images (optional)
docker system prune -a

# Start again
.\start-services.bat
```

## 📊 System Status

| Service | Status | Port | Purpose |
|---------|--------|------|---------|
| PostgreSQL | ✅ Working | 5432 | Primary database (bookings) |
| MongoDB | ✅ Working | 27017 | Read database (events) |
| Redis | ✅ Working | 6379 | Caching & locks |
| Kafka | ✅ Working | 9092 | Message queue |
| Zookeeper | ✅ Working | 2181 | Kafka coordination |
| Write-API | ✅ Working | 3000 | Booking endpoint |
| Read-API | ✅ Working | 3001 | Events endpoint |
| Worker | ✅ Working | - | Async processing |
| Data-Sync | ⚠️ Partially Working | - | PostgreSQL → MongoDB sync |
| Nginx | ✅ Working | 8080 | API Gateway |

## 🐛 Known Issues

1. **Data-Sync Service**: The data synchronization between PostgreSQL and MongoDB has timing issues and may not sync all updates immediately. This doesn't affect the core booking functionality.

2. **Initial Data**: The system starts with sample tickets for events 1 and 2. You can create new bookings using the Write API.

## 🔍 Monitoring

### Check Service Health
```bash
docker-compose ps
```

### View Real-time Logs
```bash
docker-compose logs -f
```

### Check Database Content
```bash
# PostgreSQL
docker exec -it distributed-ticket-system-postgres-1 psql -U user -d ticketing -c "SELECT * FROM tickets;"

# MongoDB
docker exec -it distributed-ticket-system-mongo-1 mongosh -u user -p password --authenticationDatabase admin ticketing --eval "db.events.find().pretty()"
```

## 📝 Development

### Project Structure
```
distributed-ticket-system/
├── write-api/          # Booking API (PostgreSQL + Kafka)
├── read-api/           # Events API (MongoDB)
├── worker/             # Async booking processor
├── data-sync-service/  # PostgreSQL → MongoDB sync
├── nginx/              # API Gateway
├── docker-compose.yml  # Service orchestration
└── start-services.bat  # Startup script
```

### Adding New Features

1. **New API Endpoint**: Add to the appropriate service (write-api or read-api)
2. **Database Changes**: Update the database initialization in worker/src/services/postgres.js
3. **New Service**: Add to docker-compose.yml and create startup script entry

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes.
