<p align="center">
  <img src="docs/9.png" alt="ICA³ Landing Page" width="100%">
</p>

<h1 align="center">ICA³ — Integrated Customer Assessments & Advanced Analytics</h1>

<p align="center">
  A SaaS platform for conducting, managing, and analyzing structured company assessments.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.1-61dafb?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.4-6db33f?logo=springboot&logoColor=white" alt="Spring Boot">
  <img src="https://img.shields.io/badge/PostgreSQL-17.5-4169e1?logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker&logoColor=white" alt="Docker">
</p>

---

## About

**ICA³** replaces fragmented legacy tools (Excel, email, manual evaluation) with an integrated digital solution. Workers take self-assessments via invitation links — no login required. Administrators build catalogs, manage questions, and analyze results through real-time dashboards.

**Key capabilities:**
- 8 question types with conditional navigation logic
- Auto & manual scoring with configurable maturity models
- Real-time analytics dashboard with PDF export
- Role-based access control with 37+ granular permissions
- JWT authentication with Twilio WhatsApp password reset
- Full audit logging of all system actions

---

## Screenshots

<details>
<summary><strong>Authentication & Landing</strong></summary>
<br>

| Login Page | Landing Page |
|:---:|:---:|
| ![Login](docs/8.png) | ![Landing](docs/9.png) |
| Split-screen login with branded visuals | Marketing hero section |

</details>

<details>
<summary><strong>Assessment Flow</strong></summary>
<br>

| Invitation | Question View | Completion | Results |
|:---:|:---:|:---:|:---:|
| ![Invite](docs/15.png) | ![Question](docs/1.png) | ![Complete](docs/2.png) | ![Results](docs/16.png) |
| 6-digit code entry | Rating Scale with progress bar | Confetti animation | Score overview |

</details>

<details>
<summary><strong>Admin Dashboard & Analytics</strong></summary>
<br>

| Dashboard | Time Series | PDF Export |
|:---:|:---:|:---:|
| ![Dashboard](docs/4.png) | ![Analytics](docs/5.png) | ![PDF](docs/6.png) |
| Stats, charts & top companies | Theme analysis with date filters | Export dialog with preview |

</details>

<details>
<summary><strong>Catalog & Content Management</strong></summary>
<br>

| Themes | Catalogs | Catalog Detail | Condition Editor |
|:---:|:---:|:---:|:---:|
| ![Themes](docs/10.png) | ![Catalogs](docs/11.png) | ![Detail](docs/12.png) | ![Conditions](docs/13.png) |
| Topic cards with filters | Maturity model assignment | Questions per theme | Visual conditional logic |

</details>

<details>
<summary><strong>Administration</strong></summary>
<br>

| Maturity Models | Admin Panel | Audit Log | Profile |
|:---:|:---:|:---:|:---:|
| ![Maturity](docs/3.png) | ![Admin](docs/14.png) | ![Audit](docs/7.png) | ![Profile](docs/17.png) |
| Configurable intervals | User & company management | Activity trail | Avatar upload |

</details>

---

## Tech Stack

| Frontend | Backend | Database | DevOps |
|----------|---------|----------|--------|
| React 19 + TypeScript | Spring Boot 3.5 (Java 21) | PostgreSQL 17.5 | Docker (multi-stage) |
| Vite 7 | Spring Security + JWT | 20+ tables, UUID PKs | All-in-one container |
| Tailwind CSS 4 | Spring Data JPA | JSONB columns | Swagger/OpenAPI |
| Recharts, Framer Motion | Twilio SDK | 24 indexes | |

---

## Getting Started

**Prerequisites:** Java 17+ &nbsp;/&nbsp; Node.js 20+ &nbsp;/&nbsp; PostgreSQL 17+ &nbsp;/&nbsp; Maven 3.9+

```bash
# 1. Database
psql -U postgres -f db/init.sql

# 2. Backend (http://localhost:8080)
cd backend && ./mvnw spring-boot:run

# 3. Frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

### Docker

```bash
docker build -t ica3 .
docker run -d -p 8080:8080 --name ica3 ica3
```

---

## Project Structure

```
├── backend/           Spring Boot API (22 controllers, 100+ endpoints)
├── frontend/          React SPA (feature-based architecture)
├── db/                PostgreSQL schema & seed data
├── docs/              Documentation & screenshots
└── Dockerfile         Multi-stage all-in-one build
```

---

## License

Developed for **CapConsulting GmbH** as part of a university software project at Westfälische Hochschule Gelsenkirchen.
