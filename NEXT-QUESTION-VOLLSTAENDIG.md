# 🎯 Next Question Endpoint - Vollständige Response

## ✅ Was wurde geändert?

Der `/next` Endpoint liefert jetzt **alle Daten** für das Frontend!

---

## 📡 Endpoint

**GET** `http://localhost:8080/public/access/{ACCESS_TOKEN}/sessions/{SESSION_ID}/next`

**Headers:** KEINE (Public Endpoint)

---

## 📊 Neue Response-Struktur

### ✅ Text Input Frage
```json
{
  "questionId": "54c17854-4d10-4bb5-a21d-185eab4d6698",
  "index": 1,
  "text": "Erkläre den Unterschied zwischen JVM, JRE und JDK",
  "inputType": "text_input",
  "questionTypeName": "Text Input",
  "options": null,
  "scoringSchema": null,
  "answered": false
}
```

### ✅ Number Input Frage
```json
{
  "questionId": "bf05b1f6-e1e9-4e4b-bc93-da1689645665",
  "index": 2,
  "text": "Wie viele Bits hat ein Java int?",
  "inputType": "number_input",
  "questionTypeName": "Number Input",
  "options": null,
  "scoringSchema": null,
  "answered": false
}
```

### ✅ Date Input Frage
```json
{
  "questionId": "b8284e2e-de35-447f-8306-a0bb33455070",
  "index": 3,
  "text": "Wann wurde Java veröffentlicht?",
  "inputType": "date_input",
  "questionTypeName": "Date Input",
  "options": null,
  "scoringSchema": null,
  "answered": false
}
```

### ✅ Rating Scale Frage
```json
{
  "questionId": "aa21576a-329a-4987-8e42-7f846f279b45",
  "index": 4,
  "text": "Wie gut kennst du Spring Boot? (0-5)",
  "inputType": "rating_scale",
  "questionTypeName": "Rating Scale",
  "options": null,
  "scoringSchema": null,
  "answered": false
}
```

### ✅ Multiple Choice (Radio) Frage
```json
{
  "questionId": "cf3f1289-e056-462a-8a9e-de538e54ce99",
  "index": 5,
  "text": "Was ist die richtige Syntax für eine main-Methode?",
  "inputType": "multiple_choice",
  "questionTypeName": "Multiple Choice",
  "options": "[{\"id\":\"opt1\",\"text\":\"public static void main(String[] args)\"},{\"id\":\"opt2\",\"text\":\"public void main(String[] args)\"},{\"id\":\"opt3\",\"text\":\"static void main(String args)\"},{\"id\":\"opt4\",\"text\":\"public main(String[] args)\"}]",
  "scoringSchema": "{\"opt1\":5,\"opt2\":0,\"opt3\":0,\"opt4\":0}",
  "answered": false
}
```

### ✅ Multiple Select (Checkbox) Frage
```json
{
  "questionId": "b9964688-ccf0-46a6-b506-2ae2080bb45e",
  "index": 6,
  "text": "Welche sind Java Zugriffsmodifikatoren?",
  "inputType": "multiple_select",
  "questionTypeName": "Multiple Select",
  "options": "[{\"id\":\"pub\",\"text\":\"public\"},{\"id\":\"priv\",\"text\":\"private\"},{\"id\":\"prot\",\"text\":\"protected\"},{\"id\":\"def\",\"text\":\"default\"},{\"id\":\"stat\",\"text\":\"static\"}]",
  "scoringSchema": "{\"pub\":1.5,\"priv\":1.5,\"prot\":1.5,\"def\":0.5,\"stat\":0}",
  "answered": false
}
```

### ✅ Dropdown (Select) Frage
```json
{
  "questionId": "c5c1850d-4738-4fe5-acab-ec5d716001e2",
  "index": 7,
  "text": "Standard Port für HTTP?",
  "inputType": "dropdown",
  "questionTypeName": "Dropdown",
  "options": "[{\"id\":\"p80\",\"text\":\"80\"},{\"id\":\"p443\",\"text\":\"443\"},{\"id\":\"p8080\",\"text\":\"8080\"}]",
  "scoringSchema": "{\"p80\":5,\"p443\":0,\"p8080\":2}",
  "answered": false
}
```

### ✅ Ordering Frage
```json
{
  "questionId": "b157be82-42d5-4520-9e39-fdc24b1da008",
  "index": 8,
  "text": "Sortiere die Schritte des SDLC",
  "inputType": "ordering",
  "questionTypeName": "Ordering",
  "options": "[{\"id\":\"req\",\"text\":\"Requirements\"},{\"id\":\"des\",\"text\":\"Design\"},{\"id\":\"imp\",\"text\":\"Implementation\"},{\"id\":\"test\",\"text\":\"Testing\"},{\"id\":\"dep\",\"text\":\"Deployment\"}]",
  "scoringSchema": null,
  "answered": false
}
```

### ❌ Keine weiteren Fragen
```json
{
  "done": true
}
```
**HTTP Status:** `204 NO_CONTENT`

---

## 🎨 Frontend Integration

### JavaScript Beispiel:
```javascript
// Nächste Frage abrufen
async function getNextQuestion(accessToken, sessionId) {
  const response = await fetch(
    `http://localhost:8080/public/access/${accessToken}/sessions/${sessionId}/next`
  );
  
  if (response.status === 204) {
    return { done: true };
  }
  
  const question = await response.json();
  
  // Options parsen (wenn vorhanden)
  if (question.options) {
    question.optionsParsed = JSON.parse(question.options);
  }
  
  // Scoring Schema parsen (wenn vorhanden)
  if (question.scoringSchema) {
    question.scoringSchemaParsed = JSON.parse(question.scoringSchema);
  }
  
  return question;
}

// Verwendung
const question = await getNextQuestion(accessToken, sessionId);

if (question.done) {
  console.log("Assessment abgeschlossen!");
} else {
  console.log("Nächste Frage:", question.text);
  console.log("Typ:", question.inputType);
  
  if (question.optionsParsed) {
    console.log("Optionen:", question.optionsParsed);
  }
}
```

---

### React Beispiel:
```tsx
interface Question {
  questionId: string;
  index: number;
  text: string;
  inputType: string;
  questionTypeName: string;
  options: string | null;
  scoringSchema: string | null;
  answered: boolean;
  
  // Parsed
  optionsParsed?: Array<{id: string, text: string}>;
  scoringSchemaParsed?: Record<string, number>;
}

function QuestionView({ accessToken, sessionId }: Props) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    loadNextQuestion();
  }, []);
  
  const loadNextQuestion = async () => {
    const response = await fetch(
      `/public/access/${accessToken}/sessions/${sessionId}/next`
    );
    
    if (response.status === 204) {
      setDone(true);
      return;
    }
    
    const data = await response.json();
    
    // Parse JSON strings
    if (data.options) {
      data.optionsParsed = JSON.parse(data.options);
    }
    if (data.scoringSchema) {
      data.scoringSchemaParsed = JSON.parse(data.scoringSchema);
    }
    
    setQuestion(data);
  };
  
  if (done) {
    return <div>Assessment abgeschlossen! 🎉</div>;
  }
  
  if (!question) {
    return <div>Lade...</div>;
  }
  
  return (
    <div>
      <h2>Frage {question.index}</h2>
      <p>{question.text}</p>
      
      {/* Render basierend auf inputType */}
      {question.inputType === 'text_input' && (
        <textarea placeholder="Deine Antwort..." />
      )}
      
      {question.inputType === 'number_input' && (
        <input type="number" />
      )}
      
      {question.inputType === 'date_input' && (
        <input type="date" />
      )}
      
      {question.inputType === 'rating_scale' && (
        <input type="range" min="0" max="5" />
      )}
      
      {question.inputType === 'multiple_choice' && question.optionsParsed && (
        <div>
          {question.optionsParsed.map(opt => (
            <label key={opt.id}>
              <input type="radio" name="answer" value={opt.id} />
              {opt.text}
            </label>
          ))}
        </div>
      )}
      
      {question.inputType === 'multiple_select' && question.optionsParsed && (
        <div>
          {question.optionsParsed.map(opt => (
            <label key={opt.id}>
              <input type="checkbox" value={opt.id} />
              {opt.text}
            </label>
          ))}
        </div>
      )}
      
      {question.inputType === 'dropdown' && question.optionsParsed && (
        <select>
          <option value="">Bitte wählen...</option>
          {question.optionsParsed.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.text}
            </option>
          ))}
        </select>
      )}
      
      {question.inputType === 'ordering' && question.optionsParsed && (
        <DraggableList items={question.optionsParsed} />
      )}
    </div>
  );
}
```

---

## 📋 Response Felder Erklärung

| Feld | Typ | Beschreibung | Beispiel |
|------|-----|--------------|----------|
| `questionId` | UUID | Eindeutige ID der Frage | `"54c17854-..."` |
| `index` | Integer | Reihenfolge im Thema (1-basiert) | `1`, `2`, `3` |
| `text` | String | Fragetext | `"Was ist...?"` |
| `inputType` | String | Typ der Eingabe | `"text_input"`, `"multiple_choice"` |
| `questionTypeName` | String | Lesbarer Name des Typs | `"Text Input"`, `"Multiple Choice"` |
| `options` | String\|null | JSON Array als String | `"[{\"id\":\"opt1\",...}]"` |
| `scoringSchema` | String\|null | JSON Object als String | `"{\"opt1\":5,...}"` |
| `answered` | Boolean | Ob bereits beantwortet | `false` |

---

## 🎯 Verwendung im Frontend

### 1. **Question Type Rendering:**
```javascript
function renderQuestion(question) {
  switch(question.inputType) {
    case 'text_input':
      return <TextInput />;
    case 'number_input':
      return <NumberInput />;
    case 'date_input':
      return <DateInput />;
    case 'rating_scale':
      return <RatingInput />;
    case 'multiple_choice':
      return <RadioInput options={JSON.parse(question.options)} />;
    case 'multiple_select':
      return <CheckboxInput options={JSON.parse(question.options)} />;
    case 'dropdown':
      return <SelectInput options={JSON.parse(question.options)} />;
    case 'ordering':
      return <DragDropInput options={JSON.parse(question.options)} />;
    default:
      return <div>Unbekannter Typ</div>;
  }
}
```

### 2. **Answer Submission:**
```javascript
async function submitAnswer(accessToken, sessionId, questionId, value) {
  const response = await fetch(
    `/public/access/${accessToken}/sessions/${sessionId}/answers/${questionId}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value })
    }
  );
  
  return await response.json();
}
```

### 3. **Flow:**
```javascript
// 1. Nächste Frage laden
const question = await getNextQuestion(token, sessionId);

// 2. User antwortet
const answer = getUserInput(question.inputType);

// 3. Answer speichern
await submitAnswer(token, sessionId, question.questionId, answer);

// 4. Nächste Frage laden (zurück zu Schritt 1)
```

---

## ✅ Vorteile der neuen Response

1. ✅ **Keine zusätzlichen API Calls** - alle Daten in einem Request
2. ✅ **Frontend kann sofort rendern** - text, options, type alles da
3. ✅ **Kein separates Question-Loading** nötig
4. ✅ **Performance-Optimierung** - weniger HTTP Roundtrips
5. ✅ **Type-safe** - inputType zeigt welches UI Element gebraucht wird
6. ✅ **Options ready** - JSON als String, kann direkt geparst werden

---

## 🧪 Test mit Postman

```http
GET http://localhost:8080/public/access/{{ACCESS_TOKEN}}/sessions/{{SESSION_ID}}/next
```

**Expected Response:**
```json
{
  "questionId": "uuid-hier",
  "index": 1,
  "text": "Frage Text",
  "inputType": "multiple_choice",
  "questionTypeName": "Multiple Choice",
  "options": "[{\"id\":\"a\",\"text\":\"Option A\"}]",
  "scoringSchema": "{\"a\":5}",
  "answered": false
}
```

**Dann im Frontend:**
```javascript
const options = JSON.parse(response.options);
// [{id: "a", text: "Option A"}]

const scoring = JSON.parse(response.scoringSchema);
// {a: 5}
```

---

## 🚀 Ready für Frontend Implementation!

Jetzt hat das Frontend **alle Informationen** um:
- ✅ Die Frage anzuzeigen
- ✅ Das richtige Input-Widget zu wählen
- ✅ Optionen zu rendern (bei Choice-Typen)
- ✅ Die Antwort zu validieren
- ✅ Zur nächsten Frage zu navigieren

**Happy Coding!** 🎉
