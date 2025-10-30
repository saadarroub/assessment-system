# Permission & Role System - Dokumentation

## Architektur

```
User → UserRole → Role → RolePermission → Permission
```

### Entitäten

#### 1. Permission
- **Tabelle**: `permission`
- **Felder**: id, name (unique), description, created_at
- **Zweck**: Definiert einzelne Berechtigungen (z.B. "create_assessment", "manage_users")

#### 2. RolePermission
- **Tabelle**: `role_permission`
- **Composite Key**: (role_id, permission_id)
- **Felder**: role_id, permission_id, granted_at
- **Zweck**: Many-to-Many Verknüpfung zwischen Rollen und Permissions

### Datenfluss

1. **User bekommt Rollen** via `UserRole` (user_id, role_id)
2. **Rolle bekommt Permissions** via `RolePermission` (role_id, permission_id)
3. **User erbt alle Permissions** seiner Rollen automatisch

## API Endpoints

### Permission Management

#### GET /api/permissions
Alle Permissions abrufen
```bash
curl http://localhost:8080/api/permissions
```

#### GET /api/permissions/{id}
Einzelne Permission per ID
```bash
curl http://localhost:8080/api/permissions/07133552-0ce0-4e33-95b0-dd4b1502793d
```

#### GET /api/permissions/by-name/{name}
Permission per Name finden
```bash
curl http://localhost:8080/api/permissions/by-name/create_assessment
```

#### POST /api/permissions
Neue Permission anlegen
```bash
curl -X POST http://localhost:8080/api/permissions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "view_reports",
    "description": "Kann Reports einsehen"
  }'
```

#### PUT /api/permissions/{id}
Permission aktualisieren
```bash
curl -X PUT http://localhost:8080/api/permissions/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "view_reports",
    "description": "Kann alle Reports einsehen und exportieren"
  }'
```

#### DELETE /api/permissions/{id}
Permission löschen
```bash
curl -X DELETE http://localhost:8080/api/permissions/{id}
```

---

### Role-Permission Assignment

#### GET /api/role-permissions/roles/{roleId}/permissions
Alle Permissions einer Rolle
```bash
curl http://localhost:8080/api/role-permissions/roles/56f3d4e4-68b6-41fd-b141-10270d6383f3/permissions
```

**Response**:
```json
[
  {
    "roleId": "56f3d4e4-68b6-41fd-b141-10270d6383f3",
    "permissionId": "07133552-0ce0-4e33-95b0-dd4b1502793d",
    "grantedAt": "2025-07-17T03:23:47.988778",
    "permission": {
      "id": "07133552-0ce0-4e33-95b0-dd4b1502793d",
      "name": "create_assessment",
      "description": "Create new assessments"
    }
  }
]
```

#### GET /api/role-permissions/permissions/{permissionId}/roles
Alle Rollen die eine Permission haben
```bash
curl http://localhost:8080/api/role-permissions/permissions/07133552-0ce0-4e33-95b0-dd4b1502793d/roles
```

#### POST /api/role-permissions/grant
Permission einer Rolle zuweisen
```bash
curl -X POST http://localhost:8080/api/role-permissions/grant \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "88e1c1e3-7286-45e8-b7b2-d01602594ca8",
    "permissionId": "6aa8f33a-3fac-4085-a091-26bbeef5ad30"
  }'
```

#### DELETE /api/role-permissions/revoke
Permission von Rolle entfernen
```bash
curl -X DELETE http://localhost:8080/api/role-permissions/revoke \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "88e1c1e3-7286-45e8-b7b2-d01602594ca8",
    "permissionId": "6aa8f33a-3fac-4085-a091-26bbeef5ad30"
  }'
```

---

### User Permission Queries

#### GET /api/role-permissions/users/{userId}/permissions
Alle Permissions eines Users (über seine Rollen aggregiert)
```bash
curl http://localhost:8080/api/role-permissions/users/10000000-0000-0000-0000-000000000001/permissions
```

**Response**:
```json
[
  {
    "id": "07133552-0ce0-4e33-95b0-dd4b1502793d",
    "name": "create_assessment",
    "description": "Create new assessments"
  },
  {
    "id": "51e649a7-93b8-4469-bba1-1ba5c689abbe",
    "name": "edit_assessment",
    "description": "Edit existing assessments"
  }
]
```

#### GET /api/role-permissions/check?roleId={roleId}&permissionId={permissionId}
Prüfen ob Rolle eine Permission hat
```bash
curl "http://localhost:8080/api/role-permissions/check?roleId=56f3d4e4-68b6-41fd-b141-10270d6383f3&permissionId=07133552-0ce0-4e33-95b0-dd4b1502793d"
```

**Response**:
```json
{
  "hasPermission": true
}
```

#### GET /api/role-permissions/users/{userId}/check/{permissionName}
Prüfen ob User eine Permission hat (über seine Rollen)
```bash
curl http://localhost:8080/api/role-permissions/users/10000000-0000-0000-0000-000000000001/check/create_assessment
```

**Response**:
```json
{
  "hasPermission": true
}
```

---

## Datenbank Schema (aus init.sql)

### Vorhandene Permissions
```sql
-- Admin bekommt alle Permissions
create_assessment, edit_assessment, delete_assessment, view_assessment
manage_users, manage_companies, view_reports, export_data
```

### Vorhandene Rollen
```sql
admin             -- Alle Permissions
company_manager   -- create/edit/view assessments, view/export reports
assessor          -- create/edit/view assessments
viewer            -- view assessments, view reports
```

---

## Verwendung im Code

### In Services prüfen ob User Permission hat
```java
@Autowired
private RolePermissionService rolePermissionService;

public void createAssessment(UUID userId, Assessment assessment) {
    // Check permission
    if (!rolePermissionService.userHasPermission(userId, "create_assessment")) {
        throw new RuntimeException("User does not have permission to create assessments");
    }
    
    // Proceed with creation
    // ...
}
```

### Alle User-Permissions abrufen
```java
List<Permission> userPermissions = rolePermissionService.getPermissionsForUser(userId);
```

---

## Typische Workflows

### 1. Neue Permission anlegen
```bash
# 1. Permission erstellen
POST /api/permissions
{
  "name": "delete_workers",
  "description": "Can delete worker records"
}

# 2. Permission an Admin-Rolle zuweisen
POST /api/role-permissions/grant
{
  "roleId": "56f3d4e4-68b6-41fd-b141-10270d6383f3",  # admin
  "permissionId": "{neue-permission-id}"
}
```

### 2. Rolle-Permissions anpassen
```bash
# Permissions einer Rolle auflisten
GET /api/role-permissions/roles/{roleId}/permissions

# Neue Permission hinzufügen
POST /api/role-permissions/grant

# Permission entfernen
DELETE /api/role-permissions/revoke
```

### 3. User-Permissions prüfen
```bash
# Alle Permissions eines Users
GET /api/role-permissions/users/{userId}/permissions

# Spezifische Permission prüfen
GET /api/role-permissions/users/{userId}/check/create_assessment
```

---

## Fehlerbehandlung

### 409 Conflict
- Permission mit gleichem Namen existiert bereits
- Permission bereits der Rolle zugewiesen

### 404 Not Found
- Permission/Role ID nicht gefunden
- Permission nicht der Rolle zugewiesen (bei revoke)

### 400 Bad Request
- Fehlende roleId/permissionId in Request

---

## Migration & Seeding

Die Datenbank ist bereits mit Permissions/RolePermissions aus `init.sql` befüllt:
- 8 Permissions definiert
- 4 Rollen mit verschiedenen Permission-Sets
- User-Role-Assignments vorhanden

**Keine zusätzliche Migration nötig** - Spring Boot erkennt die Entities automatisch.

