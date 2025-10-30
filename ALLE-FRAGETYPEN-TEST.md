# 🧪 Komplette Test-Suite für Alle Fragetypen

## ✅ Voraussetzungen

**Access Token:** `brBBvir4dxDzABqN2MLhb9ei8riHHn20974q4GH51G7Hd8QVMpd0S9S0VLrpfmt1`  
**Session ID:** `24bb920f-1646-4174-bdd9-cd9eaa3194fe`  
**Thema ID:** `0be845edd-8636-4752-b7ee-6e9e83858994` *(korrigiert auf 36 Zeichen)*

---

## 📝 Test-Flow für Alle 8 Fragetypen

### 🔹 1. Text Input (Manual Scoring)

**Question ID:** `54c17854-4d10-4bb5-a21d-185eab4d6698`

```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/54c17854-4d10-4bb5-a21d-185eab4d6698
Content-Type: application/json

{
  "value": "JVM ist die Java Virtual Machine, JRE ist die Java Runtime Environment und JDK ist das Java Development Kit."
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 0,
  "answeredCount": 1
}
```
✅ **Score = 0** (Text wird manuell bewertet)

---

### 🔹 2. Number Input (Manual Scoring)

**Question ID:** `bf05b1f6-e1e9-4e4b-bc93-da1689645665`

```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/bf05b1f6-e1e9-4e4b-bc93-da1689645665
Content-Type: application/json

{
  "value": 32
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 0,
  "answeredCount": 2
}
```
✅ **Score = 0** (Number wird manuell bewertet)

---

### 🔹 3. Date Input (Manual Scoring)

**Question ID:** `b8284e2e-de35-447f-8306-a0bb33455070`

```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/b8284e2e-de35-447f-8306-a0bb33455070
Content-Type: application/json

{
  "value": "1995-05-23"
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 0,
  "answeredCount": 3
}
```
✅ **Score = 0** (Date wird manuell bewertet)

---

### 🔹 4. Rating Scale (Auto-Scoring 0-5)

**Question ID:** `aa21576a-329a-4987-8e42-7f846f279b45`

#### Test Case A: Rating = 5
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/aa21576a-329a-4987-8e42-7f846f279b45
Content-Type: application/json

{
  "value": 5
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 5,
  "answeredCount": 4
}
```
✅ **Score = 5** (Direktes 0-5 Scoring)

#### Test Case B: Rating = 0
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/aa21576a-329a-4987-8e42-7f846f279b45
Content-Type: application/json

{
  "value": 0
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 0,
  "answeredCount": 4
}
```
✅ **Score = 0**

#### Test Case C: Rating = 3
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/aa21576a-329a-4987-8e42-7f846f279b45
Content-Type: application/json

{
  "value": 3
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 3,
  "answeredCount": 4
}
```
✅ **Score = 3**

---

### 🔹 5. Multiple Choice (Radio) - Auto-Scoring

**Question ID:** `cf3f1289-e056-462a-8a9e-de538e54ce99`

**Options:**
```json
[
  {"id": "opt1", "text": "public static void main(String[] args)"},
  {"id": "opt2", "text": "public void main(String[] args)"},
  {"id": "opt3", "text": "static void main(String args)"},
  {"id": "opt4", "text": "public main(String[] args)"}
]
```

**Scoring Schema:**
```json
{
  "opt1": 5,
  "opt2": 0,
  "opt3": 0,
  "opt4": 0
}
```

#### Test Case A: Richtige Antwort (opt1)
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/cf3f1289-e056-462a-8a9e-de538e54ce99
Content-Type: application/json

{
  "value": "opt1"
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 5,
  "answeredCount": 5
}
```
✅ **Score = 5**

#### Test Case B: Falsche Antwort (opt2)
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/cf3f1289-e056-462a-8a9e-de538e54ce99
Content-Type: application/json

{
  "value": "opt2"
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 0,
  "answeredCount": 5
}
```
✅ **Score = 0**

---

### 🔹 6. Multiple Select (Checkbox) - Auto-Scoring

**Question ID:** `b9964688-ccf0-46a6-b506-2ae2080bb45e`

**Options:**
```json
[
  {"id": "pub", "text": "public"},
  {"id": "priv", "text": "private"},
  {"id": "prot", "text": "protected"},
  {"id": "def", "text": "default"},
  {"id": "stat", "text": "static"}
]
```

**Scoring Schema:**
```json
{
  "pub": 1.5,
  "priv": 1.5,
  "prot": 1.5,
  "def": 0.5,
  "stat": 0
}
```

#### Test Case A: Alle richtigen (pub, priv, prot, def)
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/b9964688-ccf0-46a6-b506-2ae2080bb45e
Content-Type: application/json

{
  "value": ["pub", "priv", "prot", "def"]
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 5.0,
  "answeredCount": 6
}
```
✅ **Score = 1.5 + 1.5 + 1.5 + 0.5 = 5.0**

#### Test Case B: Nur 3 richtige (pub, priv, prot)
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/b9964688-ccf0-46a6-b506-2ae2080bb45e
Content-Type: application/json

{
  "value": ["pub", "priv", "prot"]
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 4.5,
  "answeredCount": 6
}
```
✅ **Score = 1.5 + 1.5 + 1.5 = 4.5**

#### Test Case C: Mit falschem (pub, priv, stat)
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/b9964688-ccf0-46a6-b506-2ae2080bb45e
Content-Type: application/json

{
  "value": ["pub", "priv", "stat"]
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 3.0,
  "answeredCount": 6
}
```
✅ **Score = 1.5 + 1.5 + 0 = 3.0**

---

### 🔹 7. Dropdown (Select) - Auto-Scoring

**Question ID:** `c5c1850d-4738-4fe5-acab-ec5d716001e2`

**Options:**
```json
[
  {"id": "p80", "text": "80"},
  {"id": "p443", "text": "443"},
  {"id": "p8080", "text": "8080"}
]
```

**Scoring Schema:**
```json
{
  "p80": 5,
  "p443": 0,
  "p8080": 2
}
```

#### Test Case A: Richtige Antwort (p80)
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/c5c1850d-4738-4fe5-acab-ec5d716001e2
Content-Type: application/json

{
  "value": "p80"
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 5,
  "answeredCount": 7
}
```
✅ **Score = 5**

#### Test Case B: Teilweise richtig (p8080)
```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/c5c1850d-4738-4fe5-acab-ec5d716001e2
Content-Type: application/json

{
  "value": "p8080"
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 2,
  "answeredCount": 7
}
```
✅ **Score = 2**

---

### 🔹 8. Ordering (Manual Scoring)

**Question ID:** `b157be82-42d5-4520-9e39-fdc24b1da008`

**Options:**
```json
[
  {"id": "req", "text": "Requirements"},
  {"id": "des", "text": "Design"},
  {"id": "imp", "text": "Implementation"},
  {"id": "test", "text": "Testing"},
  {"id": "dep", "text": "Deployment"}
]
```

```http
PUT http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/b157be82-42d5-4520-9e39-fdc24b1da008
Content-Type: application/json

{
  "value": ["req", "des", "imp", "test", "dep"]
}
```

**Expected Response:**
```json
{
  "saved": true,
  "answerId": "uuid...",
  "score": 0,
  "answeredCount": 8
}
```
✅ **Score = 0** (Ordering wird manuell bewertet)

---

## 📊 Zusammenfassung der Scores

| # | Frage Typ | Question ID (letzte 4 Zeichen) | Auto/Manual | Score Range |
|---|-----------|--------------------------------|-------------|-------------|
| 1 | Text Input | `...6698` | Manual | 0 |
| 2 | Number Input | `...5665` | Manual | 0 |
| 3 | Date Input | `...5070` | Manual | 0 |
| 4 | Rating Scale | `...9b45` | **Auto** | **0-5** |
| 5 | Multiple Choice | `...ce99` | **Auto** | **0 or 5** |
| 6 | Multiple Select | `...b45e` | **Auto** | **0-5** (Summe) |
| 7 | Dropdown | `...01e2` | **Auto** | **0, 2, or 5** |
| 8 | Ordering | `...a008` | Manual | 0 |

---

## 🎯 Postman Collection JSON

```json
{
  "info": {
    "name": "Assessment Worker - Alle Fragetypen",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Text Input",
      "request": {
        "method": "PUT",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/54c17854-4d10-4bb5-a21d-185eab4d6698",
        "body": {
          "mode": "raw",
          "raw": "{\"value\": \"JVM ist die Java Virtual Machine\"}"
        }
      }
    },
    {
      "name": "2. Number Input",
      "request": {
        "method": "PUT",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/bf05b1f6-e1e9-4e4b-bc93-da1689645665",
        "body": {
          "mode": "raw",
          "raw": "{\"value\": 32}"
        }
      }
    },
    {
      "name": "3. Date Input",
      "request": {
        "method": "PUT",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/b8284e2e-de35-447f-8306-a0bb33455070",
        "body": {
          "mode": "raw",
          "raw": "{\"value\": \"1995-05-23\"}"
        }
      }
    },
    {
      "name": "4. Rating Scale (5)",
      "request": {
        "method": "PUT",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/aa21576a-329a-4987-8e42-7f846f279b45",
        "body": {
          "mode": "raw",
          "raw": "{\"value\": 5}"
        }
      }
    },
    {
      "name": "5. Multiple Choice (opt1)",
      "request": {
        "method": "PUT",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/cf3f1289-e056-462a-8a9e-de538e54ce99",
        "body": {
          "mode": "raw",
          "raw": "{\"value\": \"opt1\"}"
        }
      }
    },
    {
      "name": "6. Multiple Select (all correct)",
      "request": {
        "method": "PUT",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/b9964688-ccf0-46a6-b506-2ae2080bb45e",
        "body": {
          "mode": "raw",
          "raw": "{\"value\": [\"pub\", \"priv\", \"prot\", \"def\"]}"
        }
      }
    },
    {
      "name": "7. Dropdown (p80)",
      "request": {
        "method": "PUT",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/c5c1850d-4738-4fe5-acab-ec5d716001e2",
        "body": {
          "mode": "raw",
          "raw": "{\"value\": \"p80\"}"
        }
      }
    },
    {
      "name": "8. Ordering",
      "request": {
        "method": "PUT",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/answers/b157be82-42d5-4520-9e39-fdc24b1da008",
        "body": {
          "mode": "raw",
          "raw": "{\"value\": [\"req\", \"des\", \"imp\", \"test\", \"dep\"]}"
        }
      }
    },
    {
      "name": "9. Get Next Question",
      "request": {
        "method": "GET",
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/next"
      }
    },
    {
      "name": "10. Complete Session",
      "request": {
        "method": "POST",
        "url": "http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/complete"
      }
    }
  ],
  "variable": [
    {
      "key": "ACCESS_TOKEN",
      "value": "brBBvir4dxDzABqN2MLhb9ei8riHHn20974q4GH51G7Hd8QVMpd0S9S0VLrpfmt1"
    },
    {
      "key": "SESSION_ID",
      "value": "24bb920f-1646-4174-bdd9-cd9eaa3194fe"
    }
  ]
}
```

---

## ✅ Testing Checklist

- [ ] Backend neu starten: `mvn spring-boot:run`
- [ ] Test 1: Text Input → Score = 0
- [ ] Test 2: Number Input → Score = 0
- [ ] Test 3: Date Input → Score = 0
- [ ] Test 4: Rating Scale → Score = 0-5
- [ ] Test 5: Multiple Choice → Score = 5 oder 0
- [ ] Test 6: Multiple Select → Score = Summe (0-5)
- [ ] Test 7: Dropdown → Score = 5, 2 oder 0
- [ ] Test 8: Ordering → Score = 0
- [ ] Test 9: Next Question → Vollständige Daten
- [ ] Test 10: Complete Session → Status = completed

---

## 🚀 Quick Start

1. **Backend starten:**
   ```bash
   cd d:\assessment-system\backend
   mvn spring-boot:run
   ```

2. **Postman Collection importieren** (JSON oben)

3. **Variables setzen:**
   - `ACCESS_TOKEN`: `brBBvir4dxDzABqN2MLhb9ei8riHHn20974q4GH51G7Hd8QVMpd0S9S0VLrpfmt1`
   - `SESSION_ID`: `24bb920f-1646-4174-bdd9-cd9eaa3194fe`

4. **Tests durchführen** (1-10 in Reihenfolge)

5. **Erfolg validieren:**
   - Alle Antworten gespeichert
   - Scores korrekt berechnet
   - Session completed

**Happy Testing!** 🎉
