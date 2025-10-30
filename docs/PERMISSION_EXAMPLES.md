# Permission System - Praktische Beispiele

## Szenario: Neuer Mitarbeiter mit eingeschränkten Rechten

### Schritt 1: User anlegen
```bash
POST /api/users
{
  "name": "Lisa Müller",
  "email": "lisa.mueller@techcorp.de",
  "password": "test123"
}
# Response: userId = "abc-123-def"
```

### Schritt 2: Rolle "viewer" zuweisen
```bash
POST /api/user-roles
{
  "userId": "abc-123-def",
  "roleId": "678b9b15-4eea-457d-8d0d-48ddbe47058e"  # viewer role
}
```

### Schritt 3: Permissions prüfen
```bash
# Welche Permissions hat Lisa?
GET /api/role-permissions/users/abc-123-def/permissions

# Response:
[
  {
    "id": "6fd4f962-489f-47fb-b675-07d5bc060ef5",
    "name": "view_assessment",
    "description": "View assessments"
  },
  {
    "id": "a6fdaa54-6518-4675-b6b0-379bb90334b8",
    "name": "view_reports",
    "description": "View assessment reports"
  }
]
```

### Schritt 4: Permission-Check in Anwendung
```bash
# Kann Lisa Assessments erstellen?
GET /api/role-permissions/users/abc-123-def/check/create_assessment
# Response: { "hasPermission": false }

# Kann Lisa Assessments ansehen?
GET /api/role-permissions/users/abc-123-def/check/view_assessment
# Response: { "hasPermission": true }
```

---

## Szenario: Rolle anpassen (Company Manager bekommt Delete-Rechte)

### Aktueller Stand prüfen
```bash
# Welche Permissions hat company_manager?
GET /api/role-permissions/roles/88e1c1e3-7286-45e8-b7b2-d01602594ca8/permissions

# Response zeigt: create, edit, view, export - KEIN delete
```

### Delete-Permission hinzufügen
```bash
POST /api/role-permissions/grant
{
  "roleId": "88e1c1e3-7286-45e8-b7b2-d01602594ca8",  # company_manager
  "permissionId": "6aa8f33a-3fac-4085-a091-26bbeef5ad30"  # delete_assessment
}

# Response 201 Created:
{
  "roleId": "88e1c1e3-7286-45e8-b7b2-d01602594ca8",
  "permissionId": "6aa8f33a-3fac-4085-a091-26bbeef5ad30",
  "grantedAt": "2025-10-09T16:30:00"
}
```

### Verifizieren
```bash
# Alle company_managers haben jetzt automatisch delete_assessment!
# z.B. User "Elena Richter" (20000000-0000-0000-0000-000000000001)
GET /api/role-permissions/users/20000000-0000-0000-0000-000000000001/check/delete_assessment
# Response: { "hasPermission": true }
```

---

## Szenario: Custom Permission erstellen

### Use Case: "Bulk Worker Import" Permission

```bash
# 1. Neue Permission anlegen
POST /api/permissions
{
  "name": "import_workers",
  "description": "Can import workers in bulk via CSV"
}
# Response: permissionId = "new-permission-123"

# 2. Nur Admin und Company Manager bekommen diese Permission
POST /api/role-permissions/grant
{
  "roleId": "56f3d4e4-68b6-41fd-b141-10270d6383f3",  # admin
  "permissionId": "new-permission-123"
}

POST /api/role-permissions/grant
{
  "roleId": "88e1c1e3-7286-45e8-b7b2-d01602594ca8",  # company_manager
  "permissionId": "new-permission-123"
}

# 3. Im WorkerController absichern
```

Java Code:
```java
@PostMapping("/import")
public ResponseEntity<?> importWorkers(
    @RequestHeader("X-User-Id") UUID userId,
    @RequestBody List<Worker> workers
) {
    // Permission check
    if (!rolePermissionService.userHasPermission(userId, "import_workers")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body("No permission to import workers");
    }
    
    // Proceed with import
    workerService.bulkImport(workers);
    return ResponseEntity.ok("Import successful");
}
```

---

## Szenario: User mit mehreren Rollen

### Setup
```bash
# User bekommt 2 Rollen: assessor + viewer
POST /api/user-roles
{
  "userId": "multi-role-user-id",
  "roleId": "c4fb42fa-2e7d-430c-a1d4-c45c0b276b12"  # assessor
}

POST /api/user-roles
{
  "userId": "multi-role-user-id",
  "roleId": "678b9b15-4eea-457d-8d0d-48ddbe47058e"  # viewer
}
```

### Ergebnis: Union aller Permissions
```bash
GET /api/role-permissions/users/multi-role-user-id/permissions

# Response: DISTINCT Kombination aus beiden Rollen
[
  { "name": "create_assessment" },  # von assessor
  { "name": "edit_assessment" },    # von assessor
  { "name": "view_assessment" },    # von beiden (dedupliziert)
  { "name": "view_reports" }        # von viewer
]
```

---

## Szenario: Permission entfernen (Security Downgrade)

### Use Case: "assessor" soll nicht mehr editieren können

```bash
# 1. Aktuelle Permissions prüfen
GET /api/role-permissions/roles/c4fb42fa-2e7d-430c-a1d4-c45c0b276b12/permissions
# zeigt: create_assessment, edit_assessment, view_assessment

# 2. Edit-Permission entfernen
DELETE /api/role-permissions/revoke
{
  "roleId": "c4fb42fa-2e7d-430c-a1d4-c45c0b276b12",  # assessor
  "permissionId": "51e649a7-93b8-4469-bba1-1ba5c689abbe"  # edit_assessment
}
# Response 204 No Content

# 3. Alle assessor-User verlieren sofort edit_assessment!
```

---

## Szenario: Debug - Welche User haben eine bestimmte Permission?

```bash
# 1. Welche Rollen haben "delete_assessment"?
GET /api/role-permissions/permissions/6aa8f33a-3fac-4085-a091-26bbeef5ad30/roles

# Response:
[
  {
    "roleId": "56f3d4e4-68b6-41fd-b141-10270d6383f3",
    "role": { "name": "admin" }
  }
]

# 2. Welche User haben die "admin" Rolle?
GET /api/user-roles?roleId=56f3d4e4-68b6-41fd-b141-10270d6383f3

# Response:
[
  { "userId": "10000000-0000-0000-0000-000000000001", "user": { "name": "Dr. Sarah Schmidt" } },
  { "userId": "10000000-0000-0000-0000-000000000002", "user": { "name": "Michael Weber" } }
]

# → Sarah und Michael können löschen
```

---

## Best Practices

### ✅ DO's
1. **Granulare Permissions**: Lieber viele kleine Permissions als wenige große
   ```
   ✓ create_assessment, edit_assessment, delete_assessment
   ✗ manage_assessment (zu breit)
   ```

2. **Naming Convention**: `verb_noun` Format
   ```
   ✓ view_reports, export_data, manage_users
   ✗ reports, data, users
   ```

3. **Role-Based statt User-Based**: Permissions immer an Rollen, niemals direkt an User
   ```
   ✓ User → Role → Permission
   ✗ User → Permission (direct)
   ```

### ❌ DON'Ts
1. **Keine Permission-Duplikate**: Name muss unique sein
2. **Keine Permissions löschen** wenn noch Rollen sie nutzen (Cascade Delete beachten!)
3. **Keine Permission-Namen ändern** ohne Code-Anpassung (hart gecoded in Services)

---

## Integration mit anderen Services

### Example: AssessmentSessionService
```java
@Service
public class AssessmentSessionService {
    
    @Autowired
    private RolePermissionService rolePermissionService;
    
    public AssessmentSession startSession(UUID userId, UUID themaId, UUID workerId) {
        // Check permission
        if (!rolePermissionService.userHasPermission(userId, "create_assessment")) {
            throw new SecurityException("No permission to start assessment");
        }
        
        // Create session
        AssessmentSession session = new AssessmentSession();
        session.setThemaId(themaId);
        session.setWorkerId(workerId);
        session.setStatus("started");
        
        return sessionRepository.save(session);
    }
    
    public void deleteSession(UUID userId, UUID sessionId) {
        // Check permission
        if (!rolePermissionService.userHasPermission(userId, "delete_assessment")) {
            throw new SecurityException("No permission to delete assessment");
        }
        
        sessionRepository.deleteById(sessionId);
    }
}
```

---

## Monitoring & Audit

### Alle Permission-Changes tracken
```java
// In RolePermissionService nach grant/revoke:
auditLogService.log(
    userId, 
    "GRANT_PERMISSION", 
    "role_permission", 
    rolePermissionId,
    Map.of(
        "roleId", roleId,
        "permissionId", permissionId,
        "roleName", role.getName(),
        "permissionName", permission.getName()
    )
);
```

### Permission-Usage Reports
```sql
-- Welche Permissions werden nie genutzt?
SELECT p.* FROM permission p
LEFT JOIN role_permission rp ON p.id = rp.permission_id
WHERE rp.permission_id IS NULL;

-- Welche Rolle hat die meisten Permissions?
SELECT r.name, COUNT(rp.permission_id) as perm_count
FROM role r
JOIN role_permission rp ON r.id = rp.role_id
GROUP BY r.id, r.name
ORDER BY perm_count DESC;
```

