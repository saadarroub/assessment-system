# Backend Starter Script
# Automatisch JAVA_HOME setzen und Spring Boot starten

Write-Host "Setze JAVA_HOME..." -ForegroundColor Cyan

# Java-Installation finden
$javaPath = (Get-Command java -ErrorAction SilentlyContinue).Source
if (-not $javaPath) {
    Write-Host "Java nicht gefunden! Bitte Java installieren." -ForegroundColor Red
    exit 1
}

# JAVA_HOME aus java.exe Pfad ableiten
$env:JAVA_HOME = $javaPath -replace '\\bin\\java.exe$', ''
Write-Host "JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Green

# Zum Backend-Verzeichnis wechseln
Set-Location -Path $PSScriptRoot

Write-Host "" -ForegroundColor Cyan
Write-Host "Starte Spring Boot Backend..." -ForegroundColor Cyan
Write-Host "Port: 8080" -ForegroundColor Gray
Write-Host "Zum Stoppen: Ctrl+C" -ForegroundColor Gray
Write-Host "" -ForegroundColor Gray

# Maven ausführen
mvn spring-boot:run
