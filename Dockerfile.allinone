# All-in-one image: PostgreSQL 17.5 + Spring Boot backend + static frontend
# Intended for quick testing/demo. Not recommended for production.

# 1) Build backend
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /backend
COPY backend/pom.xml ./
COPY backend/.mvn .mvn
COPY backend/mvnw mvnw
RUN chmod +x mvnw || true
RUN ./mvnw -q -DskipTests dependency:go-offline
COPY backend/src src
RUN ./mvnw -q -DskipTests package

# 2) Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# 3) Final image based on Postgres so we can run DB + Java
FROM postgres:17.5 AS runtime

ENV POSTGRES_USER=devuser \
    POSTGRES_PASSWORD=devpass123 \
    POSTGRES_DB=assessment_system \
    PGDATA=/var/lib/postgresql/data

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-21-jre-headless ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend jar
COPY --from=backend-build /backend/target/*.jar /app/app.jar

# Copy frontend static assets
RUN mkdir -p /opt/static
COPY --from=frontend-build /frontend/dist /opt/static

# Copy seed SQL
COPY db/init.sql /docker-entrypoint-initdb.d/01-init.sql

# Entry script to start Postgres then Java
COPY scripts/allinone-entry.sh /usr/local/bin/allinone-entry.sh
RUN chmod +x /usr/local/bin/allinone-entry.sh

EXPOSE 8080

# Default Spring overrides so it talks to local Postgres inside the container
ENV SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/assessment_system \
    SPRING_DATASOURCE_USERNAME=devuser \
    SPRING_DATASOURCE_PASSWORD=devpass123 \
    SPRING_PROFILES_ACTIVE=docker \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0" \
    SPRING_WEB_RESOURCES_STATIC_LOCATIONS=file:/opt/static/

ENTRYPOINT ["/usr/local/bin/allinone-entry.sh"]
