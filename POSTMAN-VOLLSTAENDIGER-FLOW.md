# 🎯 Postman Collection - Kompletter Worker Flow mit echten UUIDs

## 📋 Gegebene Daten

### ✅ Bereits vorhanden:
- **Catalog ID:** `7da4405c-7355-43a7-91da-22ae593e323c`
- **Thema ID:** `0be845ed-8636-4752-b7ee-6e9e83858994` 

**⚠️ WICHTIG:** Die Thema ID `0be845ed-8636-4752-b7ee-6e9e83858994` ist ungültig!
- Hat nur **35 Zeichen** (sollte 36 sein)
- Hole die korrekte UUID mit: `GET http://localhost:8080/api/themas`

### ✅ Bereits erstellte Fragen:
- **Radio (Multiple Choice):** `cf3f1289-e056-462a-8a9e-de538e54ce99`
- **Multi Select (Checkbox):** `b9964688-ccf0-46a6-b506-2ae2080bb45e`
- **Text Input:** `54c17854-4d10-4bb5-a21d-185eab4d6698`
- **Ordering (Ordnen):** `b157be82-42d5-4520-9e39-fdc24b1da008`
- **Date Input:** `b8284e2e-de35-447f-8306-a0bb33455070`
- **Number Input:** `bf05b1f6-e1e9-4e4b-bc93-da1689645665`
- **Range:** `aa21576a-329a-4987-8e42-7f846f279b45`
- **Select:** `c5c1850d-4738-4fe5-acab-ec5d716001e2`




```

---




```

---

## 📝 Schritt 2: Alle Fragen zu Question Nodes hinzufügen

### 2.1 Question Node für Text Frage
**POST** `{{BASE_URL}}/api/question-nodes`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "question": {
    "id": "54c17854-4d10-4bb5-a21d-185eab4d6698"
  },
  "thema": {
    "id": "be845ed-8636-4752-b7ee-6e9e83858994"
  }
}
```

**Tests Script:**
```javascript
if (pm.response.code === 201) {
    console.log("✅ Question Node 1 (Text) erstellt");
}
```

---

### 2.2 Question Node für Number Frage
**POST** `{{BASE_URL}}/api/question-nodes`

**Body:**
```json
{
  "question": {
    "id": "bf05b1f6-e1e9-4e4b-bc93-da1689645665"
  },
  "thema": {
    "id": "be845ed-8636-4752-b7ee-6e9e83858994"
  },
  "orderIndex": 2
}
```

---

### 2.3 Question Node für Date Frage
**POST** `{{BASE_URL}}/api/question-nodes`

**Body:**
```json
{
  "question": {
    "id": "b8284e2e-de35-447f-8306-a0bb33455070"
  },
  "thema": {
    "id": "be845ed-8636-4752-b7ee-6e9e83858994"
  },
  "orderIndex": 3
}
```

---

### 2.4 Question Node für Rating Frage
**POST** `{{BASE_URL}}/api/question-nodes`

**Body:**
```json
{
  "question": {
    "id": "{{Q_RATING_ID}}"
  },
  "thema": {
    "id": "be845ed-8636-4752-b7ee-6e9e83858994"
  },
  "orderIndex": 4
}
```

---

### 2.5 Question Node für Radio Frage
**POST** `{{BASE_URL}}/api/question-nodes`

**Body:**
```json
{
  "question": {
    "id": "cf3f1289-e056-462a-8a9e-de538e54ce99"
  },
  "thema": {
    "id": "be845ed-8636-4752-b7ee-6e9e83858994"
  },
  "orderIndex": 5
}
```

---

### 2.6 Question Node für Checkbox Frage
**POST** `{{BASE_URL}}/api/question-nodes`

**Body:**
```json
{
  "question": {
    "id": "b9964688-ccf0-46a6-b506-2ae2080bb45e"
  },
  "thema": {
    "id": "be845ed-8636-4752-b7ee-6e9e83858994"
  },
  "orderIndex": 6
}
```

---

### 2.7 Question Node für Dropdown Frage
**POST** `{{BASE_URL}}/api/question-nodes`

**Body:**
```json
{
  "question": {
    "id": "{{Q_DROPDOWN_ID}}"
  },
  "thema": {
    "id": "be845ed-8636-4752-b7ee-6e9e83858994"
  },
  "orderIndex": 7
}
```

---

### 2.8 Question Node für Ordering Frage
**POST** `{{BASE_URL}}/api/question-nodes`

**Body:**
```json
{
  "question": {
    "id": "b157be82-42d5-4520-9e39-fdc24b1da008"
  },
  "thema": {
    "id": "be845ed-8636-4752-b7ee-6e9e83858994"
  },
  "orderIndex": 8
}
```

---

## 📝 Schritt 3: Thema zum Catalog hinzufügen (Thema-Catalog)

**POST** `{{BASE_URL}}/api/thema-catalogs`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "thema": {
    "id": "be845ed-8636-4752-b7ee-6e9e83858994"
  },
  "catalog": {
    "id": "7da4405c-7355-43a7-91da-22ae593e323c"
  },
  "questions": [
    {"id": "54c17854-4d10-4bb5-a21d-185eab4d6698"},
    {"id": "bf05b1f6-e1e9-4e4b-bc93-da1689645665"},
    {"id": "b8284e2e-de35-447f-8306-a0bb33455070"},
    {"id": "{{Q_RATING_ID}}"},
    {"id": "cf3f1289-e056-462a-8a9e-de538e54ce99"},
    {"id": "b9964688-ccf0-46a6-b506-2ae2080bb45e"},
    {"id": "{{Q_DROPDOWN_ID}}"},
    {"id": "b157be82-42d5-4520-9e39-fdc24b1da008"}
  ]
}
```

**Tests Script:**
```javascript
if (pm.response.code === 201) {
    const themaCatalogId = pm.response.json().id;
    pm.environment.set("THEMA_CATALOG_ID", themaCatalogId);
    console.log("✅ Thema-Catalog erstellt:", themaCatalogId);
}
```

---

## 📝 Schritt 4: Worker erstellen

**POST** `{{BASE_URL}}/api/workers`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "Test",
  "lastName": "Worker",
  "email": "test.worker@example.com",
  "company": {
    "id": "{{COMPANY_ID}}"
  }
}
```

**Tests Script:**
```javascript
if (pm.response.code === 201) {
    const workerId = pm.response.json().id;
    pm.environment.set("WORKER_ID", workerId);
    console.log("✅ Worker erstellt:", workerId);
}
```

**⚠️ Note:** Du brauchst eine `COMPANY_ID`. Falls nicht vorhanden, erstelle zuerst eine Company!

---

## 📝 Schritt 5: Catalog dem Worker zuweisen (🔑 ACCESS TOKEN!)

**POST** `{{BASE_URL}}/api/worker-catalogs`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "worker": {
    "id": "{{WORKER_ID}}"
  },
  "catalog": {
    "id": "7da4405c-7355-43a7-91da-22ae593e323c"
  },
  "status": "active",
  "expiresAt": "2025-12-31T23:59:59"
}
```

**Tests Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    const accessToken = response.accessToken;
    const accessCode = response.accessCode;
    
    pm.environment.set("ACCESS_TOKEN", accessToken);
    pm.environment.set("ACCESS_CODE", accessCode);
    
    console.log("🔑 ACCESS TOKEN:", accessToken);
    console.log("🔢 ACCESS CODE:", accessCode);
    console.log("✅ Worker-Catalog Assignment erstellt!");
}
```

---

## 👤 WORKER PHASE (Public - Kein JWT!)

### Schritt 6: Access Meta abrufen

**GET** `{{BASE_URL}}/public/access/{{ACCESS_TOKEN}}/meta`

**Headers:** KEINE! (Public Endpoint)

**Expected Response:**
```json
{
  "catalogName": "...",
  "catalogDescription": "...",
  "workerName": "Test Worker",
  "status": "active",
  "requiresCode": true,
  "expiresAt": "2025-12-31T23:59:59"
}
```

---

### Schritt 7: Code verifizieren & Themen laden

**POST** `{{BASE_URL}}/public/access/{{ACCESS_TOKEN}}/verify`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "code": "{{ACCESS_CODE}}"
}
```

**Expected Response:**
```json
{
  "valid": true,
  "themas": [
    {
      "themaId": "be845ed-8636-4752-b7ee-6e9e83858994",
      "themaName": "...",
      "questionCount": 8,
      "status": "not_started"
    }
  ]
}
```

---

### Schritt 8: Assessment Session starten

**POST** `{{BASE_URL}}/public/access/{{ACCESS_TOKEN}}/themas/be845ed-8636-4752-b7ee-6e9e83858994/start`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "code": "{{ACCESS_CODE}}"
}
```

**Tests Script:**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("SESSION_ID", response.sessionId);
    
    // Speichere alle Answer IDs
    response.questions.forEach((q, index) => {
        pm.environment.set(`ANSWER_${index + 1}_ID`, q.answerId);
        console.log(`📝 Answer ${index + 1} (${q.questionType}):`, q.answerId);
    });
    
    console.log("✅ Session gestartet:", response.sessionId);
    console.log("📊 Anzahl Fragen:", response.questions.length);
}
```

---

### Schritt 9: Antworten senden (8 Fragen)

#### 9.1 Answer - Text Input
**PUT** `{{BASE_URL}}/api/public/answers/{{ANSWER_1_ID}}`  

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "answer_value": "Dies ist meine Textantwort mit ausführlicher Erklärung."
}
```

**Tests:**
```javascript
console.log("✅ Text Answer gespeichert. Score:", pm.response.json().score);
```

---

#### 9.2 Answer - Number Input
**PUT** `{{BASE_URL}}/api/public/answers/{{ANSWER_2_ID}}`

**Body:**
```json
{
  "answer_value": 42
}
```

---

#### 9.3 Answer - Date Input
**PUT** `{{BASE_URL}}/api/public/answers/{{ANSWER_3_ID}}`

**Body:**
```json
{
  "answer_value": "1990-05-15"
}
```

---

#### 9.4 Answer - Rating Scale
**PUT** `{{BASE_URL}}/api/public/answers/{{ANSWER_4_ID}}`

**Body:**
```json
{
  "answer_value": 4
}
```

**Expected:** `score = 4.0` ✅ (Auto-Scoring!)

**Tests:**
```javascript
const score = pm.response.json().score;
console.log("✅ Rating Answer. Score:", score);
pm.test("Rating Auto-Scoring funktioniert", () => {
    pm.expect(score).to.be.a('number');
    pm.expect(score).to.be.at.least(0);
    pm.expect(score).to.be.at.most(5);
});
```

---

#### 9.5 Answer - Radio Button (Multiple Choice)
**PUT** `{{BASE_URL}}/api/public/answers/{{ANSWER_5_ID}}`

**Body:**
```json
{
  "answer_value": "option-id-hier"
}
```

**⚠️ WICHTIG:** Verwende die richtige Option ID aus der Frage!

**Expected:** `score = X` (Auto-Scoring basierend auf scoringSchema)

---

#### 9.6 Answer - Checkbox (Multiple Select)
**PUT** `{{BASE_URL}}/api/public/answers/{{ANSWER_6_ID}}`

**Body:**
```json
{
  "answer_value": ["option-id-1", "option-id-2"]
}
```

**⚠️ WICHTIG:** Verwende die richtigen Option IDs aus der Frage!

**Expected:** `score = X` (Auto-Scoring - Summe der gewählten Optionen)

---

#### 9.7 Answer - Dropdown (Select)
**PUT** `{{BASE_URL}}/api/public/answers/{{ANSWER_7_ID}}`

**Body:**
```json
{
  "answer_value": "p80"
}
```

**Expected:** `score = 5.0` ✅ (Auto-Scoring!)

**Tests:**
```javascript
const score = pm.response.json().score;
console.log("✅ Dropdown Answer. Score:", score);
pm.test("Dropdown richtig gewählt", () => {
    pm.expect(score).to.equal(5);
});
```

---

#### 9.8 Answer - Ordering (Sortieren)
**PUT** `{{BASE_URL}}/api/public/answers/{{ANSWER_8_ID}}`

**Body:**
```json
{
  "answer_value": ["id1", "id2", "id3", "id4"]
}
```

**⚠️ WICHTIG:** Verwende die richtigen Option IDs in der richtigen Reihenfolge!

**Expected:** `score = null` (Manuelles Scoring erforderlich)

---

### Schritt 10: Session Status prüfen

**GET** `{{BASE_URL}}/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}?code={{ACCESS_CODE}}`

**Headers:** KEINE! (Public Endpoint)

**Expected Response:**
```json
{
  "sessionId": "...",
  "themaName": "...",
  "status": "in_progress",
  "totalQuestions": 8,
  "answeredQuestions": 8,
  "totalScore": 19.0,
  "maxPossibleScore": 30.0,
  "questions": [...]
}
```

---

## 📊 Erwartete Scores

| Frage | Typ | Auto-Scoring? | Expected Score |
|-------|-----|---------------|----------------|
| 1 | Text Input | ❌ | `null` |
| 2 | Number Input | ❌ | `null` |
| 3 | Date Input | ❌ | `null` |
| 4 | Rating Scale | ✅ | `0-5` |
| 5 | Radio Button | ✅ | Aus scoringSchema |
| 6 | Checkbox | ✅ | Summe gewählter Optionen |
| 7 | Dropdown | ✅ | `5.0` (bei p80) |
| 8 | Ordering | ❌ | `null` |

---

## 🎯 Postman Folder-Struktur

```
📁 Worker Assessment - Vollständiger Flow
  📁 1. Setup - Fehlende Fragen erstellen
    ├─ 1.1 Create Rating Question
    └─ 1.2 Create Dropdown Question
  
  📁 2. Question Nodes erstellen (8 Requests)
    ├─ 2.1 Question Node - Text
    ├─ 2.2 Question Node - Number
    ├─ 2.3 Question Node - Date
    ├─ 2.4 Question Node - Rating
    ├─ 2.5 Question Node - Radio
    ├─ 2.6 Question Node - Checkbox
    ├─ 2.7 Question Node - Dropdown
    └─ 2.8 Question Node - Ordering
  
  📁 3. Thema-Catalog & Worker Setup
    ├─ 3.1 Create Thema-Catalog
    ├─ 3.2 Create Worker
    └─ 3.3 Assign Worker to Catalog (ACCESS TOKEN!)
  
  📁 4. Worker Flow - Public Access
    ├─ 4.1 Get Access Meta
    ├─ 4.2 Verify Code
    ├─ 4.3 Start Assessment Session
    📁 4.4 Submit Answers (8 Requests)
      ├─ Answer 1 - Text
      ├─ Answer 2 - Number
      ├─ Answer 3 - Date
      ├─ Answer 4 - Rating
      ├─ Answer 5 - Radio
      ├─ Answer 6 - Checkbox
      ├─ Answer 7 - Dropdown
      └─ Answer 8 - Ordering
    └─ 4.5 Check Session Status
```

---

## ⚠️ Wichtige Hinweise

### Company ID:
Falls du noch keine Company hast, erstelle zuerst eine:

**POST** `{{BASE_URL}}/api/companies`
```json
{
  "name": "Test Company",
  "address": "Test Straße 1",
  "contactInfo": "test@company.com"
}
```

### Option IDs für bestehende Fragen:
Du musst die **echten Option IDs** aus deinen Radio, Checkbox und Ordering Fragen verwenden!

**Abrufen:**
```
GET {{BASE_URL}}/api/questions/cf3f1289-e056-462a-8a9e-de538e54ce99
GET {{BASE_URL}}/api/questions/b9964688-ccf0-46a6-b506-2ae2080bb45e
GET {{BASE_URL}}/api/questions/b157be82-42d5-4520-9e39-fdc24b1da008
```

---

## 🚀 Ausführung

1. **Environment Setup:**
   - Setze `ADMIN_TOKEN`
   - Setze `COMPANY_ID` (oder erstelle Company)
   - Alle anderen Variablen oben sind bereits gesetzt

2. **Run Collection:**
   - Folder 1: Fehlende Fragen erstellen
   - Folder 2: Question Nodes erstellen (8x)
   - Folder 3: Thema-Catalog & Worker Setup
   - Folder 4: Worker Flow (Public)

3. **Verify:**
   - Prüfe Console für ACCESS_TOKEN und ACCESS_CODE
   - Prüfe Scores in Answer Responses
   - Prüfe Final Session Status

**Gesamt: ~25 Requests für kompletten Flow!** 🎉

---

## 📝 Notes

- ✅ **Bereits vorhanden:** Catalog, Thema, 6 Fragen
- ✅ **Neu erstellen:** 2 Fragen (Rating, Dropdown)
- ✅ **Question Nodes:** Alle 8 Fragen zum Thema hinzufügen
- ✅ **Thema-Catalog:** Verknüpfung erstellen
- ✅ **Worker Flow:** Komplett mit Access Token testen

**Happy Testing!** 🎯
