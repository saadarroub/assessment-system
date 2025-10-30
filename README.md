# Assessment System — Single Image (All‑in‑One)

Eine saubere, minimale Distribution: Ein Docker Image enthält Postgres 17.5, das Spring‑Boot‑Backend und die gebaute React‑App. Ideal zum Weitergeben und Testen mit genau einem Befehl.

## Was ist drin?

- PostgreSQL 17.5 mit Seeding aus `db/init.sql` (beim ersten Start)
- Spring Boot Backend (Java 17 Target; läuft mit JRE 21)
- Frontend (Vite Build) wird als statische Ressourcen von Spring ausgeliefert
- Build-Datei: `Dockerfile.allinone`

## Voraussetzungen

- Docker Desktop (Windows/macOS/Linux)
- Optional: Docker Hub Account zum Pushen

## Schnellstart

### **Option 1: Fertige Image von Docker Hub (empfohlen) 🚀**

```powershell
docker run --rm -p 8082:8080 saadarroub/assessment-allinone:latest
```

### **Option 2: Lokal bauen**

**WICHTIG:** Vor dem Build sicherstellen, dass Git die Zeilenumbrüche korrekt setzt:

```powershell
# Zeilenumbrüche normalisieren (wichtig für Windows!)
git add --renormalize .

# Image bauen
docker build -t saadarroub/assessment-allinone:latest -f Dockerfile.allinone .

# Starten
docker run -d -p 8080:8080 --name assessment-app saadarroub/assessment-allinone:latest
```

Öffnen:
- Web-UI: http://localhost:8080
- API: über denselben Port (z. B. http://localhost:8080/api/... oder /public/...)

**⚠️ Bekannte Probleme:**
- **"env: 'bash\r': No such file or directory"** → Führe `git add --renormalize .` aus vor dem Build
- Die `.gitattributes` Datei stellt sicher, dass Shell-Scripts immer Unix-Zeilenumbrüche (LF) verwenden

Hinweise:
- Der erste Start dauert etwas länger (DB-Init + Seeding).
- Ohne gemountetes Volume ist jeder Run "frisch" (praktisch für Tests).

## Push zu Docker Hub

```powershell
docker login -u saadarroub
docker push saadarroub/assessment-allinone:latest
```

Optional kannst du `DOCKERHUB_NAMESPACE` und `TAG` in `.env` pflegen, sie sind aber für den All‑in‑One Build nicht zwingend.

## Troubleshooting

- Bild startet, aber App ist nicht erreichbar
	- Warte bis zur Logzeile “Starting Spring Boot…”. Der Erststart initialisiert die DB.
- Seed nicht angewendet
	- Das Seeding läuft beim ersten Start eines neuen Datenverzeichnisses. Ohne Volumes ist jeder Run “frisch”.
- Port belegt
	- Ändere `-p 8082:8080` auf einen freien Host‑Port.

## Hinweis zu entfernten Dateien

Diese Codebasis wurde bewusst vereinfacht:
- Entfernt: CI‑Workflow, docker‑compose, separate Dockerfiles für Backend/Frontend/DB
- Übrig: Nur `Dockerfile.allinone` + `scripts/allinone-entry.sh` (zum Starten von Postgres und App)

Der Start‑Script ist notwendig, weil in einem Container zwei Prozesse orchestriert werden (Postgres im Hintergrund und anschließend das Spring‑Boot‑Backend inklusive Seeding beim Erststart). Ohne diesen Script wäre zuverlässiges Starten/Beenden und Seeding deutlich aufwendiger.

## Pushing images to Docker Hub

1) Set your namespace and tag in `.env` (e.g., `DOCKERHUB_NAMESPACE=myuser`, `TAG=latest`)
2) Login and build/push
	 - docker login
	 - docker compose build
	 - docker compose push

This will push all three service images using the names from `.env`.

## Troubleshooting

- Port already in use
	- Backend host port is 8082, frontend 8081, db 5434. Change host ports in `docker-compose.yml` if needed.
- DB seeding didn’t run
	- Initialization scripts run only on first start with an empty data directory. Use `docker compose down -v` to remove volumes and re-initialize.
- Postgres version errors during init
	- Ensure the image stays at `postgres:17.5` to match the dump format.
- Frontend can’t reach the API
	- Nginx proxies `/api/` and `/public/` to `backend:8080`. Ensure both services are on the same compose network and backend is healthy.

## File map (high level)

- `docker-compose.yml` — Orchestrates backend, frontend, db
- `backend/Dockerfile` — Multi-stage Maven build for Spring Boot
- `frontend/Dockerfile` — Build with Node, serve via Nginx
- `frontend/nginx/default.conf` — SPA routing and API proxy to backend
- `db/Dockerfile` — Postgres 17.5 image with `init.sql`
- `Dockerfile.single` — Optional single-container runtime (backend + static frontend)

## CI publishing (optional)

A GitHub Actions workflow can build and push images on demand or on tags. See `.github/workflows/docker-publish.yml` after adding your Docker Hub credentials as repository secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN` (a Docker Hub access token)

Then trigger the workflow manually or by pushing a tag.

