# Backend API Documentation

## Base URL
```
http://localhost:8080/api
```

---

## 🔐 Authentication Endpoints

### Login
**POST** `/auth/login`

Authentifiziert einen User basierend auf Email und Passwort.

**Request:**
```json
{
  "email": "sarah.schmidt@system.admin",
  "password": "test123"
}
```

**Response (Success - 200):**
```json
{
  "id": "10000000-0000-0000-0000-000000000001",
  "name": "Dr. Sarah Schmidt",
  "email": "sarah.schmidt@system.admin",
  "password": "test123",
  "createdAt": "2023-01-15T08:00:00",
  "updatedAt": "2025-07-27T01:00:01.399411"
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### Logout
**POST** `/auth/logout`

**Request:**
```json
{
  "token": "xyz"
}
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 👥 User Management Endpoints

### Get All Users
**GET** `/users`

**Response (200):**
```json
[
  {
    "id": "10000000-0000-0000-0000-000000000001",
    "name": "Dr. Sarah Schmidt",
    "email": "sarah.schmidt@system.admin",
    "createdAt": "2023-01-15T08:00:00",
    "updatedAt": "2025-07-27T01:00:01.399411"
  }
]
```

---

### Get User by ID
**GET** `/users/{id}`

**Path Parameter:**
- `id` (UUID): User ID

**Response (200):**
```json
{
  "id": "10000000-0000-0000-0000-000000000001",
  "name": "Dr. Sarah Schmidt",
  "email": "sarah.schmidt@system.admin",
  "createdAt": "2023-01-15T08:00:00",
  "updatedAt": "2025-07-27T01:00:01.399411"
}
```

**Response (404):** User not found

---

### Create User
**POST** `/users`

**Request:**
```json
{
  "name": "Anna Schmidt",
  "email": "anna@test.de",
  "password": "pass456"
}
```

**Response (201):**
```json
{
  "id": "generated-uuid",
  "name": "Anna Schmidt",
  "email": "anna@test.de",
  "password": "pass456",
  "createdAt": "2025-10-09T16:00:00",
  "updatedAt": "2025-10-09T16:00:00"
}
```

---

### Update User
**PUT** `/users/{id}`

**Path Parameter:**
- `id` (UUID): User ID

**Request:**
```json
{
  "name": "Anna Schmidt Updated",
  "email": "anna.updated@test.de",
  "password": "newpass123"
}
```

**Response (200):**
```json
{
  "id": "existing-uuid",
  "name": "Anna Schmidt Updated",
  "email": "anna.updated@test.de",
  "createdAt": "2025-10-09T16:00:00",
  "updatedAt": "2025-10-09T17:00:00"
}
```

---

### Delete User
**DELETE** `/users/{id}`

**Path Parameter:**
- `id` (UUID): User ID

**Response (204):** No Content

---

### Assign Role to User
**POST** `/users/{userId}/roles/{roleId}`

**Path Parameters:**
- `userId` (UUID): User ID
- `roleId` (UUID): Role ID

**Response (201):**
```json
{
  "userId": "user-uuid",
  "roleId": "role-uuid",
  "assignedAt": "2025-10-09T16:00:00"
}
```

---

### Remove Role from User
**DELETE** `/users/{userId}/roles/{roleId}`

**Path Parameters:**
- `userId` (UUID): User ID
- `roleId` (UUID): Role ID

**Response (204):** No Content

---

### Get User Roles
**GET** `/users/{userId}/roles`

**Path Parameter:**
- `userId` (UUID): User ID

**Response (200):**
```json
[
  {
    "userId": "user-uuid",
    "roleId": "role-uuid",
    "assignedAt": "2025-10-09T16:00:00"
  }
]
```

---

## 🏢 Company Management Endpoints

### Get All Companies
**GET** `/companies`

**Response (200):**
```json
[
  {
    "id": "c1000000-1111-2222-3333-444444444444",
    "name": "TechCorp Deutschland GmbH",
    "description": "Führendes Softwareentwicklungsunternehmen mit 500+ Mitarbeitern",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2025-07-27T01:00:01.399411"
  }
]
```

---

### Get Company by ID
**GET** `/companies/{id}`

**Path Parameter:**
- `id` (UUID): Company ID

**Response (200):**
```json
{
  "id": "c1000000-1111-2222-3333-444444444444",
  "name": "TechCorp Deutschland GmbH",
  "description": "Führendes Softwareentwicklungsunternehmen mit 500+ Mitarbeitern",
  "createdAt": "2023-01-01T00:00:00",
  "updatedAt": "2025-07-27T01:00:01.399411"
}
```

**Response (404):** Company not found

---

### Search Companies by Name
**GET** `/companies/search?name={searchTerm}`

**Query Parameter:**
- `name` (String): Search term (case-insensitive)

**Response (200):**
```json
[
  {
    "id": "c1000000-1111-2222-3333-444444444444",
    "name": "TechCorp Deutschland GmbH",
    "description": "Führendes Softwareentwicklungsunternehmen mit 500+ Mitarbeitern",
    "createdAt": "2023-01-01T00:00:00",
    "updatedAt": "2025-07-27T01:00:01.399411"
  }
]
```

---

### Create Company
**POST** `/companies`

**Request:**
```json
{
  "name": "ABC GmbH",
  "description": "Neue Firma"
}
```

**Response (201):**
```json
{
  "id": "generated-uuid",
  "name": "ABC GmbH",
  "description": "Neue Firma",
  "createdAt": "2025-10-09T16:00:00",
  "updatedAt": "2025-10-09T16:00:00"
}
```

---

### Update Company
**PUT** `/companies/{id}`

**Path Parameter:**
- `id` (UUID): Company ID

**Request:**
```json
{
  "name": "ABC GmbH Updated",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "id": "existing-uuid",
  "name": "ABC GmbH Updated",
  "description": "Updated description",
  "createdAt": "2025-10-09T16:00:00",
  "updatedAt": "2025-10-09T17:00:00"
}
```

---

### Delete Company
**DELETE** `/companies/{id}`

**Path Parameter:**
- `id` (UUID): Company ID

**Response (204):** No Content

---

## 👷 Worker Management Endpoints

### Get All Workers
**GET** `/workers`

**Response (200):**
```json
[
  {
    "id": "11100000-1111-2222-3333-444444444444",
    "name": "Max Mustermann",
    "workSpaceRef": "Software Development",
    "companyId": "c1000000-1111-2222-3333-444444444444",
    "email": "max.mustermann@techcorp.de",
    "createdAt": "2023-01-10T00:00:00",
    "updatedAt": "2025-07-27T01:00:01.399411"
  }
]
```

---

### Get Worker by ID
**GET** `/workers/{id}`

**Path Parameter:**
- `id` (UUID): Worker ID

**Response (200):**
```json
{
  "id": "11100000-1111-2222-3333-444444444444",
  "name": "Max Mustermann",
  "workSpaceRef": "Software Development",
  "companyId": "c1000000-1111-2222-3333-444444444444",
  "email": "max.mustermann@techcorp.de",
  "createdAt": "2023-01-10T00:00:00",
  "updatedAt": "2025-07-27T01:00:01.399411"
}
```

**Response (404):** Worker not found

---

### Get Workers by Company
**GET** `/workers/company/{companyId}`

**Path Parameter:**
- `companyId` (UUID): Company ID

**Response (200):**
```json
[
  {
    "id": "11100000-1111-2222-3333-444444444444",
    "name": "Max Mustermann",
    "workSpaceRef": "Software Development",
    "companyId": "c1000000-1111-2222-3333-444444444444",
    "email": "max.mustermann@techcorp.de",
    "createdAt": "2023-01-10T00:00:00",
    "updatedAt": "2025-07-27T01:00:01.399411"
  }
]
```

---

### Get Workers by Workspace
**GET** `/workers/workspace/{workSpaceRef}`

**Path Parameter:**
- `workSpaceRef` (String): Workspace reference (z.B. "IT", "HR", "Sales")

**Response (200):**
```json
[
  {
    "id": "11100000-1111-2222-3333-444444444444",
    "name": "Max Mustermann",
    "workSpaceRef": "Software Development",
    "companyId": "c1000000-1111-2222-3333-444444444444",
    "email": "max.mustermann@techcorp.de",
    "createdAt": "2023-01-10T00:00:00",
    "updatedAt": "2025-07-27T01:00:01.399411"
  }
]
```

---

### Create Worker
**POST** `/workers`

**Request:**
```json
{
  "name": "John Doe",
  "workSpaceRef": "IT",
  "companyId": "c1000000-1111-2222-3333-444444444444",
  "email": "john@example.com"
}
```

**Response (201):**
```json
{
  "id": "generated-uuid",
  "name": "John Doe",
  "workSpaceRef": "IT",
  "companyId": "c1000000-1111-2222-3333-444444444444",
  "email": "john@example.com",
  "createdAt": "2025-10-09T16:00:00",
  "updatedAt": "2025-10-09T16:00:00"
}
```

---

### Update Worker
**PUT** `/workers/{id}`

**Path Parameter:**
- `id` (UUID): Worker ID

**Request:**
```json
{
  "name": "John Doe Updated",
  "workSpaceRef": "HR",
  "companyId": "c1000000-1111-2222-3333-444444444444",
  "email": "john.updated@example.com"
}
```

**Response (200):**
```json
{
  "id": "existing-uuid",
  "name": "John Doe Updated",
  "workSpaceRef": "HR",
  "companyId": "c1000000-1111-2222-3333-444444444444",
  "email": "john.updated@example.com",
  "createdAt": "2025-10-09T16:00:00",
  "updatedAt": "2025-10-09T17:00:00"
}
```

---

### Delete Worker
**DELETE** `/workers/{id}`

**Path Parameter:**
- `id` (UUID): Worker ID

**Response (204):** No Content

---

## 📊 Available Test Data

### Test Users (for Login)
```
Email: sarah.schmidt@system.admin
Password: test123
Role: admin

Email: elena.richter@techcorp.de  
Password: test123
Role: company_manager
```

### Test Companies (IDs)
```
c1000000-1111-2222-3333-444444444444 - TechCorp Deutschland GmbH
c2000000-1111-2222-3333-444444444444 - ConsultCorp International
c3000000-1111-2222-3333-444444444444 - Innovate Solutions España
c4000000-1111-2222-3333-444444444444 - Digital France SARL
c5000000-1111-2222-3333-444444444444 - StartupIO
```

---

## 🔒 Security Notes

**Aktueller Prototyp-Status:**
- Alle Endpoints sind **OHNE Authentifizierung** zugänglich
- Kein Token/Session erforderlich
- CORS ist für alle Origins aktiviert (`*`)

**Für Produktion später hinzufügen:**
- JWT Token-basierte Authentifizierung
- Authorization Header: `Bearer {token}`
- Role-based Access Control (RBAC)
- HTTPS statt HTTP

