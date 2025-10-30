# Methoden mit Permissions absichern - Kompletter Guide

## 📖 Übersicht: 3 Varianten

### Variante 1: ✅ Manuell im Service (Empfohlen für Prototyp)
**Pro**: Einfach, flexibel, klar ersichtlich
**Contra**: Etwas mehr Code

### Variante 2: ⚡ Annotation-basiert (Eleganter)
**Pro**: Weniger Code, deklarativ
**Contra**: Braucht AOP (AspectJ)

### Variante 3: 🔐 Spring Security (Production-Ready)
**Pro**: Framework-Standard, sehr mächtig
**Contra**: Komplex, Overkill für Prototyp

---

## Variante 1: Manueller Permission-Check

### Service-Beispiel
```java
@Service
public class AssessmentService {
    
    @Autowired
    private RolePermissionService rolePermissionService;
    
    @Autowired
    private AssessmentSessionRepository sessionRepository;
    
    // ========== CREATE ==========
    public AssessmentSession createSession(UUID userId, UUID themaId, UUID workerId, UUID companyId) {
        // 1. Permission Check
        if (!rolePermissionService.userHasPermission(userId, "create_assessment")) {
            throw new SecurityException("No permission to create assessment");
        }
        
        // 2. Business Logic
        AssessmentSession session = new AssessmentSession();
        session.setThemaId(themaId);
        session.setWorkerId(workerId);
        session.setCompanyId(companyId);
        session.setStatus("started");
        session.setTotalScore(0);
        session.setMaxPossibleScore(0);
        
        return sessionRepository.save(session);
    }
    
    // ========== READ ==========
    public AssessmentSession getSession(UUID userId, UUID sessionId) {
        // 1. Permission Check
        if (!rolePermissionService.userHasPermission(userId, "view_assessment")) {
            throw new SecurityException("No permission to view assessment");
        }
        
        // 2. Business Logic
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
    }
    
    // ========== UPDATE ==========
    public AssessmentSession updateSession(UUID userId, UUID sessionId, String newStatus) {
        // 1. Permission Check
        if (!rolePermissionService.userHasPermission(userId, "edit_assessment")) {
            throw new SecurityException("No permission to edit assessment");
        }
        
        // 2. Business Logic
        AssessmentSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
        
        session.setStatus(newStatus);
        return sessionRepository.save(session);
    }
    
    // ========== DELETE ==========
    public void deleteSession(UUID userId, UUID sessionId) {
        // 1. Permission Check
        if (!rolePermissionService.userHasPermission(userId, "delete_assessment")) {
            throw new SecurityException("No permission to delete assessment");
        }
        
        // 2. Business Logic
        sessionRepository.deleteById(sessionId);
    }
    
    // ========== COMPLEX: Multiple Permissions (OR) ==========
    public List<AssessmentSession> exportAllSessions(UUID userId) {
        // User needs EITHER export_data OR manage_companies permission
        boolean canExport = rolePermissionService.userHasPermission(userId, "export_data");
        boolean canManage = rolePermissionService.userHasPermission(userId, "manage_companies");
        
        if (!canExport && !canManage) {
            throw new SecurityException("No permission to export data");
        }
        
        return sessionRepository.findAll();
    }
    
    // ========== COMPLEX: Multiple Permissions (AND) ==========
    public void dangerousOperation(UUID userId) {
        // User needs BOTH delete_assessment AND manage_companies
        boolean canDelete = rolePermissionService.userHasPermission(userId, "delete_assessment");
        boolean canManage = rolePermissionService.userHasPermission(userId, "manage_companies");
        
        if (!canDelete || !canManage) {
            throw new SecurityException("Insufficient permissions for this operation");
        }
        
        // Critical operation here
    }
}
```

### Controller-Integration
```java
@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    
    @Autowired
    private AssessmentService assessmentService;
    
    // userId kommt aus Header oder Security Context
    @PostMapping
    public ResponseEntity<?> createSession(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody CreateSessionRequest request) {
        try {
            AssessmentSession session = assessmentService.createSession(
                userId, 
                request.getThemaId(), 
                request.getWorkerId(),
                request.getCompanyId()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
    
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getSession(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID sessionId) {
        try {
            AssessmentSession session = assessmentService.getSession(userId, sessionId);
            return ResponseEntity.ok(session);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> deleteSession(
            @RequestHeader("X-User-Id") UUID userId,
            @PathVariable UUID sessionId) {
        try {
            assessmentService.deleteSession(userId, sessionId);
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}
```

---

## Variante 2: Annotation-basiert (mit AOP)

### Setup (bereits erledigt ✅)
1. Dependency in `pom.xml`: `spring-boot-starter-aop`
2. Annotation: `@RequirePermission`
3. Aspect: `PermissionAspect` (interceptiert Methodenaufrufe)

### Service mit Annotation
```java
@Service
public class AssessmentService {
    
    @Autowired
    private AssessmentSessionRepository sessionRepository;
    
    // ========== CREATE mit Annotation ==========
    @RequirePermission("create_assessment")
    public AssessmentSession createSession(
            UUID userId,  // ← MUSS erster Parameter sein!
            UUID themaId, 
            UUID workerId, 
            UUID companyId) {
        
        // Kein manueller Permission-Check nötig - wird automatisch geprüft!
        
        AssessmentSession session = new AssessmentSession();
        session.setThemaId(themaId);
        session.setWorkerId(workerId);
        session.setCompanyId(companyId);
        session.setStatus("started");
        
        return sessionRepository.save(session);
    }
    
    // ========== READ mit Annotation ==========
    @RequirePermission("view_assessment")
    public AssessmentSession getSession(UUID userId, UUID sessionId) {
        return sessionRepository.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));
    }
    
    // ========== DELETE mit Annotation ==========
    @RequirePermission("delete_assessment")
    public void deleteSession(UUID userId, UUID sessionId) {
        sessionRepository.deleteById(sessionId);
    }
    
    // ========== Multiple Permissions (OR-Logik) ==========
    @RequirePermission(value = {"export_data", "manage_companies"}, requireAll = false)
    public List<AssessmentSession> exportAllSessions(UUID userId) {
        return sessionRepository.findAll();
    }
    
    // ========== Multiple Permissions (AND-Logik) ==========
    @RequirePermission(value = {"delete_assessment", "manage_companies"}, requireAll = true)
    public void dangerousOperation(UUID userId) {
        // Critical operation
    }
}
```

**Wichtig**: 
- `userId` MUSS der **erste Parameter** sein
- Der `PermissionAspect` extrahiert automatisch die userId
- Bei Fehler: `SecurityException` wird geworfen

---

## Vergleich: Manuell vs. Annotation

### ✅ Manuell
```java
public void deleteSession(UUID userId, UUID sessionId) {
    if (!rolePermissionService.userHasPermission(userId, "delete_assessment")) {
        throw new SecurityException("No permission");
    }
    sessionRepository.deleteById(sessionId);
}
```

**Pro**: 
- Explizit, klar ersichtlich
- Keine Magic/Aspect nötig
- Einfaches Debugging

**Contra**:
- Mehr Code
- Permission-Check bei jeder Methode wiederholen

---

### ⚡ Annotation
```java
@RequirePermission("delete_assessment")
public void deleteSession(UUID userId, UUID sessionId) {
    sessionRepository.deleteById(sessionId);
}
```

**Pro**:
- Weniger Code
- Deklarativ (lesbar)
- Zentrale Logik im Aspect

**Contra**:
- "Magic" (nicht sofort ersichtlich wo Check passiert)
- Aspect kann debuggen erschweren
- userId muss erster Parameter sein

---

## Real-World Beispiele

### Beispiel 1: Worker Management
```java
@Service
public class WorkerService {
    
    @Autowired
    private RolePermissionService rolePermissionService;
    
    @Autowired
    private WorkerRepository workerRepository;
    
    // Nur Company Manager und Admin können Worker erstellen
    public Worker createWorker(UUID userId, Worker worker) {
        boolean canManage = rolePermissionService.userHasPermission(userId, "manage_companies");
        
        if (!canManage) {
            throw new SecurityException("Only company managers can create workers");
        }
        
        return workerRepository.save(worker);
    }
    
    // Jeder kann Worker ansehen (aber nur eigene Company)
    public List<Worker> getWorkersByCompany(UUID userId, UUID companyId) {
        // Hier könntest du auch checken ob User zu dieser Company gehört
        return workerRepository.findByCompanyId(companyId);
    }
    
    // Nur Admin kann alle Worker löschen
    public void deleteAllWorkers(UUID userId) {
        if (!rolePermissionService.userHasPermission(userId, "manage_users")) {
            throw new SecurityException("Only admins can delete all workers");
        }
        
        workerRepository.deleteAll();
    }
}
```

### Beispiel 2: Catalog Management
```java
@Service
public class CatalogService {
    
    @Autowired
    private RolePermissionService rolePermissionService;
    
    @Autowired
    private CatalogRepository catalogRepository;
    
    // Catalog erstellen: nur assessor+
    @RequirePermission("create_assessment")
    public Catalog createCatalog(UUID userId, Catalog catalog) {
        return catalogRepository.save(catalog);
    }
    
    // Catalog ansehen: jeder eingeloggte User
    public Catalog getCatalog(UUID userId, UUID catalogId) {
        // Kein Permission-Check - jeder darf lesen
        return catalogRepository.findById(catalogId)
            .orElseThrow(() -> new RuntimeException("Catalog not found"));
    }
    
    // Catalog editieren: nur assessor+
    @RequirePermission(value = {"edit_assessment", "create_assessment"}, requireAll = false)
    public Catalog updateCatalog(UUID userId, UUID catalogId, Catalog updates) {
        Catalog catalog = getCatalog(userId, catalogId);
        catalog.setTitle(updates.getTitle());
        catalog.setDescription(updates.getDescription());
        return catalogRepository.save(catalog);
    }
    
    // Catalog löschen: nur admin
    public void deleteCatalog(UUID userId, UUID catalogId) {
        if (!rolePermissionService.userHasPermission(userId, "delete_assessment")) {
            throw new SecurityException("Only admins can delete catalogs");
        }
        catalogRepository.deleteById(catalogId);
    }
}
```

---

## Best Practices

### ✅ DO's
1. **Immer userId als Parameter übergeben**
   ```java
   public void method(UUID userId, ...) { }  // ✓ Gut
   ```

2. **Aussagekräftige Exception-Messages**
   ```java
   throw new SecurityException("User " + userId + " lacks permission: create_assessment");
   ```

3. **Permission-Check VOR Business-Logic**
   ```java
   // ✓ Permission zuerst
   checkPermission(userId, "edit");
   doBusinessLogic();
   ```

4. **OR-Logik für flexible Zugriffe**
   ```java
   if (hasPermission("export") || hasPermission("admin")) { ... }
   ```

### ❌ DON'Ts
1. **Keine Hard-coded Rollen**
   ```java
   if (user.getRole().equals("admin")) { ... }  // ✗ Schlecht - nutze Permissions!
   ```

2. **Keine Permission-Checks nach Datenänderung**
   ```java
   // ✗ Schlecht
   data.save();
   checkPermission();  // Zu spät!
   ```

3. **Keine verschachtelten Permission-Checks**
   ```java
   // ✗ Unübersichtlich
   if (hasA()) {
       if (hasB()) {
           if (hasC()) { ... }
       }
   }
   ```

---

## Testing

### Unit Test für Permission-Check
```java
@SpringBootTest
class AssessmentServiceTest {
    
    @Autowired
    private AssessmentService assessmentService;
    
    @Autowired
    private RolePermissionService rolePermissionService;
    
    @Test
    void testCreateSession_WithPermission_Success() {
        // Admin User (has all permissions)
        UUID adminUserId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        
        AssessmentSession session = assessmentService.createSession(
            adminUserId, 
            UUID.randomUUID(), 
            UUID.randomUUID(),
            UUID.randomUUID()
        );
        
        assertNotNull(session);
        assertEquals("started", session.getStatus());
    }
    
    @Test
    void testCreateSession_WithoutPermission_ThrowsException() {
        // Viewer User (no create permission)
        UUID viewerUserId = UUID.fromString("40000000-0000-0000-0000-000000000001");
        
        assertThrows(SecurityException.class, () -> {
            assessmentService.createSession(
                viewerUserId, 
                UUID.randomUUID(), 
                UUID.randomUUID(),
                UUID.randomUUID()
            );
        });
    }
    
    @Test
    void testUserPermissions() {
        UUID adminId = UUID.fromString("10000000-0000-0000-0000-000000000001");
        
        assertTrue(rolePermissionService.userHasPermission(adminId, "create_assessment"));
        assertTrue(rolePermissionService.userHasPermission(adminId, "delete_assessment"));
        assertTrue(rolePermissionService.userHasPermission(adminId, "manage_users"));
    }
}
```

---

## Migration von bestehenden Services

### Vorher (kein Permission-Check)
```java
@Service
public class WorkerService {
    public Worker createWorker(Worker worker) {
        return workerRepository.save(worker);
    }
}
```

### Nachher (mit Permission-Check)
```java
@Service
public class WorkerService {
    
    @Autowired
    private RolePermissionService rolePermissionService;
    
    // Variante A: Manuell
    public Worker createWorker(UUID userId, Worker worker) {
        if (!rolePermissionService.userHasPermission(userId, "manage_companies")) {
            throw new SecurityException("No permission to create workers");
        }
        return workerRepository.save(worker);
    }
    
    // Variante B: Annotation
    @RequirePermission("manage_companies")
    public Worker createWorkerAnnotated(UUID userId, Worker worker) {
        return workerRepository.save(worker);
    }
}
```

**Controller anpassen**:
```java
@PostMapping("/workers")
public ResponseEntity<?> createWorker(
        @RequestHeader("X-User-Id") UUID userId,  // ← neu
        @RequestBody Worker worker) {
    try {
        Worker created = workerService.createWorker(userId, worker);
        return ResponseEntity.ok(created);
    } catch (SecurityException e) {
        return ResponseEntity.status(403).body(e.getMessage());
    }
}
```

---

## Empfehlung für deinen Prototyp

**Für schnellen Prototyp → Variante 1 (Manuell)**
```java
if (!rolePermissionService.userHasPermission(userId, "permission_name")) {
    throw new SecurityException("No permission");
}
```

**Warum?**
- ✅ Einfach zu verstehen
- ✅ Kein zusätzliches Framework-Wissen nötig
- ✅ Debugging ist straightforward
- ✅ Flexibel für komplexe Logik

**Später für Production → Variante 2 (Annotation) oder Spring Security**

