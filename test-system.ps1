# Test Script for Distributed Ticket System
# Run this after starting the system to verify everything is working

Write-Host "🧪 Testing Distributed Ticket System..." -ForegroundColor Green
Write-Host ""

# Test 1: Check if services are running
Write-Host "1. Checking service status..." -ForegroundColor Yellow
docker-compose ps

Write-Host ""
Write-Host "2. Testing Write API..." -ForegroundColor Yellow

# Test Write API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/book" -Method POST -ContentType "application/json" -Body '{"userId": 999, "eventId": 1, "seatId": "B2"}' -TimeoutSec 10
    if ($response.StatusCode -eq 202) {
        Write-Host "✅ Write API is working!" -ForegroundColor Green
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Write API returned unexpected status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Write API test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Testing Read API..." -ForegroundColor Yellow

# Test Read API
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/events" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Read API is working!" -ForegroundColor Green
        Write-Host "   Response length: $($response.Content.Length) characters" -ForegroundColor Gray
    } else {
        Write-Host "❌ Read API returned unexpected status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Read API test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Testing Nginx Gateway..." -ForegroundColor Yellow

# Test Nginx Gateway
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/events" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Nginx Gateway is working!" -ForegroundColor Green
    } else {
        Write-Host "❌ Nginx Gateway returned unexpected status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Nginx Gateway test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Checking database content..." -ForegroundColor Yellow

# Check PostgreSQL
try {
    $result = docker exec -it distributed-ticket-system-postgres-1 psql -U user -d ticketing -c "SELECT COUNT(*) as ticket_count FROM tickets;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL is accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PostgreSQL check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "If all tests passed, your system is working correctly!" -ForegroundColor Cyan
Write-Host "You can now use the APIs:" -ForegroundColor Cyan
Write-Host "  - Write API: http://localhost:3000/api/book" -ForegroundColor White
Write-Host "  - Read API: http://localhost:3001/api/events" -ForegroundColor White
Write-Host "  - Gateway: http://localhost:8080" -ForegroundColor White
