# LITE Backend Startup Script
# This script sets the correct Java version and starts the Spring Boot application

$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.3.9-hotspot"
$env:PATH = "C:\Program Files\Eclipse Adoptium\jdk-21.0.3.9-hotspot\bin;$env:PATH"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  LITE Backend - Spring Boot Application" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Java Version:" -ForegroundColor Yellow
& java -version
Write-Host ""
Write-Host "Starting server on http://localhost:8080..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

.\mvnw.cmd spring-boot:run
