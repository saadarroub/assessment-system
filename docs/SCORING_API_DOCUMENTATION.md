# Scoring API Documentation (Firmen-basiert)

## Übersicht
Die Scoring APIs ermöglichen es, Scores für eine Firma, deren Kataloge, Themas und Worker abzufragen. Alle Scores werden als Prozentsatz (0-100%) dargestellt und **nur completed Sessions werden berücksichtigt**.

## Authentifizierung
Alle Endpunkte erfordern die Berechtigung `ADMIN_PANEL_ADMIN`.

---

## Endpunkte

### 1. Company Overall Score
**GET** `/api/scoring/company/{companyId}/overall`

Gesamtübersicht aller Scores für eine Firma.

**Response:**
```json
{
  "companyId": "uuid",
  "companyName": "Example GmbH",
  "averagePercentageScore": 75.5,
  "totalCompletedSessions": 150,
  "totalSessions": 200,
  "totalWorkers": 50,
  "totalCatalogs": 5,
  "catalogScores": [
    {
      "catalogId": "uuid",
      "catalogTitle": "Java Basics",
      "totalScore": 450.5,
      "maxPossibleScore": 600.0,
      "percentageScore": 75.08,
      "completedSessions": 30,
      "totalSessions": 40,
      "themaScores": [...],
      "workerScores": []
    }
  ]
}
```

**Logik:**
- Holt alle Catalogs die dieser Firma über `worker_catalog` zugewiesen sind
- Berechnet Durchschnitt der Catalog-Scores (nur Catalogs mit completed Sessions)
- Summiert alle completed/total Sessions über alle Catalogs

---

### 2. Company Catalog Score (ohne Worker)
**GET** `/api/scoring/company/{companyId}/catalog/{catalogId}`

Score für einen bestimmten Catalog einer Firma.

**Response:**
```json
{
  "catalogId": "uuid",
  "catalogTitle": "Java Basics",
  "totalScore": 450.5,
  "maxPossibleScore": 600.0,
  "percentageScore": 75.08,
  "completedSessions": 30,
  "totalSessions": 40,
  "themaScores": [
    {
      "themaId": "uuid",
      "themaName": "OOP Concepts",
      "totalScore": 280.5,
      "maxPossibleScore": 400.0,
      "percentageScore": 70.13,
      "completedSessions": 15,
      "totalSessions": 20
    }
  ],
  "workerScores": []
}
```

**Logik:**
- Alle Themas im Catalog werden berücksichtigt
- Nur completed Sessions dieser Firma
- `totalScore` = Summe aller completed Thema-Scores
- `maxPossibleScore` = Summe aller max_possible_score der completed Themas
- `percentageScore` = (totalScore / maxPossibleScore) × 100

---

### 3. Company Catalog Score (mit Worker-Liste)
**GET** `/api/scoring/company/{companyId}/catalog/{catalogId}/workers`

Score für einen Catalog mit Liste aller Worker die daran arbeiten.

**Response:**
```json
{
  "catalogId": "uuid",
  "catalogTitle": "Java Basics",
  "totalScore": 450.5,
  "maxPossibleScore": 600.0,
  "percentageScore": 75.08,
  "completedSessions": 30,
  "totalSessions": 40,
  "themaScores": [...],
  "workerScores": [
    {
      "workerId": "uuid",
      "workerName": "Max Mustermann",
      "workerEmail": "max@example.com",
      "percentageScore": 88.5,
      "completedThemas": 3,
      "totalThemas": 3,
      "status": "completed"
    },
    {
      "workerId": "uuid",
      "workerName": "Anna Schmidt",
      "workerEmail": "anna@example.com",
      "percentageScore": 65.0,
      "completedThemas": 2,
      "totalThemas": 3,
      "status": "in_progress"
    },
    {
      "workerId": "uuid",
      "workerName": "Peter Müller",
      "workerEmail": "peter@example.com",
      "percentageScore": 0.0,
      "completedThemas": 0,
      "totalThemas": 3,
      "status": "assigned"
    }
  ]
}
```

**Worker Status:**
- `assigned` - Zugewiesen aber noch nicht gestartet (completedThemas = 0)
- `in_progress` - Mindestens ein Thema completed, aber nicht alle (0 < completedThemas < totalThemas)
- `completed` - Alle Themas completed (completedThemas = totalThemas)

**Worker Score Logik:**
- Für jedes Thema: beste completed Session
- Durchschnitt über alle Themas (completedThemas + nicht gestartete)

---

### 4. Company Thema Score
**GET** `/api/scoring/company/{companyId}/thema/{themaId}`

Score für ein Thema einer Firma.

**Response:**
```json
{
  "themaId": "uuid",
  "themaName": "OOP Concepts",
  "totalScore": 280.5,
  "maxPossibleScore": 400.0,
  "percentageScore": 70.13,
  "completedSessions": 15,
  "totalSessions": 20
}
```

**Logik:**
- Summiert alle completed Sessions dieser Firma für dieses Thema
- `totalScore` = COALESCE(SUM(total_score), 0) WHERE status = 'completed'
- `maxPossibleScore` = COALESCE(SUM(max_possible_score), 0) WHERE status = 'completed'
- `percentageScore` = (totalScore / maxPossibleScore) × 100

---

### 5. Worker Thema Score
**GET** `/api/scoring/worker/{workerId}/thema/{themaId}`

Score eines bestimmten Workers in einem Thema.

**Response:**
```json
{
  "themaId": "uuid",
  "themaName": "OOP Concepts",
  "totalScore": 35.5,
  "maxPossibleScore": 40.0,
  "percentageScore": 88.75,
  "completedSessions": 1,
  "totalSessions": 2
}
```

**Logik:**
- Nimmt die **beste** completed Session des Workers für dieses Thema
- Sortierung: `ORDER BY total_score DESC LIMIT 1`
- Falls keine completed Session existiert: Score = 0

---

### 6. Worker Catalog Score
**GET** `/api/scoring/worker/{workerId}/catalog/{catalogId}`

Score eines Workers über alle Themas in einem Catalog.

**Response:**
```json
{
  "catalogId": "uuid",
  "catalogTitle": "Java Basics",
  "totalScore": 115.5,
  "maxPossibleScore": 120.0,
  "percentageScore": 96.25,
  "completedSessions": 3,
  "totalSessions": 3,
  "themaScores": [
    {
      "themaId": "uuid",
      "themaName": "OOP Concepts",
      "totalScore": 35.5,
      "maxPossibleScore": 40.0,
      "percentageScore": 88.75,
      "completedSessions": 1,
      "totalSessions": 1
    },
    {
      "themaId": "uuid",
      "themaName": "Collections",
      "totalScore": 40.0,
      "maxPossibleScore": 40.0,
      "percentageScore": 100.0,
      "completedSessions": 1,
      "totalSessions": 1
    }
  ],
  "workerScores": []
}
```

**Logik:**
- Alle Themas im Catalog
- Für jedes Thema: beste completed Session des Workers
- Summiert alle Thema-Scores

---

## Wichtige Konzepte

### Session Count
- **Jeder Start eines Themas = eine Session**
- Sessions werden pro Thema gezählt, nicht global
- `completedSessions` = Anzahl der Sessions mit status = 'completed'
- `totalSessions` = Anzahl aller Sessions (alle Status)

### Scoring-Logik
- Nur **completed Sessions** werden für Score-Berechnung verwendet
- Bei mehreren Sessions: **beste Session** wird verwendet (höchster total_score)
- Prozentsatz: `(totalScore / maxPossibleScore) × 100`
- Falls maxPossibleScore = 0: percentageScore = 0.0

### max_possible_score
- Wird beim Start einer Session berechnet
- Rating-Fragen: 5 Punkte
- Single Choice/Dropdown: Max-Wert aus scoringSchema
- Multiple Choice: Summe aller Werte in scoringSchema
- Manuelle Fragen: 5 Punkte
- Text/Number/Date: 0 Punkte (können nicht auto-scored werden)

---

## Admin Panel UI Flow

### 1. Company Dashboard
```
GET /api/scoring/company/{companyId}/overall

Zeigt:
- Gesamt-Durchschnitt der Firma
- Anzahl completed/total Sessions
- Anzahl Workers
- Anzahl Catalogs
- Liste aller Catalogs mit Score
```

### 2. Catalog View (mit Worker-Liste)
```
GET /api/scoring/company/{companyId}/catalog/{catalogId}/workers

Zeigt:
- Catalog-Score (nur completed Sessions)
- Liste aller Themas mit Score
- Tabelle aller Worker mit:
  - Name, Email
  - Percentage Score
  - Completed Themas / Total Themas
  - Status (assigned/in_progress/completed)
```

### 3. Catalog Detail View (nur Themas)
```
GET /api/scoring/company/{companyId}/catalog/{catalogId}

Zeigt:
- Catalog-Score
- Detaillierte Tabelle aller Themas mit:
  - Thema Name
  - Total Score / Max Possible Score
  - Percentage Score
  - Completed Sessions / Total Sessions
```

### 4. Worker Detail View
```
GET /api/scoring/worker/{workerId}/catalog/{catalogId}

Zeigt:
- Worker's Gesamt-Score im Catalog
- Breakdown pro Thema
- Beste Session pro Thema
```

---


## Beispiel-Workflow

### Admin möchte Firma "Example GmbH" analysieren:

1. **Gesamt-Übersicht holen:**
   ```
   GET /api/scoring/company/12345678-1234-1234-1234-123456789012/overall
   ```
   → Sieht: averagePercentageScore = 75.5%, 5 Catalogs, 50 Workers

2. **Catalog "Java Basics" analysieren:**
   ```
   GET /api/scoring/company/12345678-1234-1234-1234-123456789012/catalog/7da4405c-7355-43a7-91da-22ae593e323c/workers
   ```
   → Sieht: Catalog Score = 75.08%, 3 Themas, 20 Workers
   → Tabelle zeigt: Max (completed, 88.5%), Anna (in_progress, 65%), Peter (assigned, 0%)

3. **Thema "OOP Concepts" Details:**
   ```
   GET /api/scoring/company/12345678-1234-1234-1234-123456789012/thema/be845edd-8636-4752-b7ee-6e9e83858994
   ```
   → Sieht: Thema Score = 70.13%, 15 completed 

4. **Worker "Max" im Detail:**
   ```
   GET /api/scoring/worker/87654321-4321-4321-4321-210987654321/catalog/7da4405c-7355-43a7-91da-22ae593e323c
   ```
   → Sieht: Max's Catalog Score = 88.5%, Breakdown pro Thema

---
