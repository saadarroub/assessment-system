# @IdClass - Composite Primary Keys erklärt

## Was ist ein Composite Primary Key?

### Database Schema
In der Datenbank können **mehrere Spalten zusammen** den Primary Key bilden:

```sql
CREATE TABLE role_permission (
    role_id UUID,
    permission_id UUID,
    granted_at TIMESTAMP,
    
    PRIMARY KEY (role_id, permission_id)  -- ← 2 Spalten = 1 Key
);
```

**Bedeutung**: Die Kombination `(role_id, permission_id)` ist einzigartig.
- ✅ `(admin, create_assessment)` - OK
- ✅ `(admin, delete_assessment)` - OK
- ✅ `(viewer, view_assessment)` - OK
- ❌ `(admin, create_assessment)` - FEHLER (Duplikat!)

---

## JPA Mapping: 2 Varianten

### ❌ Variante 1: `@EmbeddedId` (komplexer)
```java
@Entity
public class RolePermission {
    
    @EmbeddedId  // Der Key ist ein eingebettetes Objekt
    private RolePermissionId id;
    
    // Problem: Umständlicher Zugriff
    // rolePermission.getId().getRoleId()
}
```

### ✅ Variante 2: `@IdClass` (einfacher) ← **Das nutzen wir!**
```java
@Entity
@IdClass(RolePermission.RolePermissionId.class)  // ← Externe Key-Klasse
public class RolePermission {
    
    @Id
    private UUID roleId;       // Normales Feld
    
    @Id
    private UUID permissionId; // Normales Feld
    
    // Einfacher Zugriff:
    // rolePermission.getRoleId()
}
```

---

## Die `IdClass` - Anforderungen

Die Klasse die als `@IdClass` dient **MUSS**:

### 1. `Serializable` implementieren
```java
public static class RolePermissionId implements Serializable {
    // Warum? JPA muss den Key für Caching/Sessions serialisieren
}
```

### 2. Gleiche Feldnamen wie in Entity
```java
// Entity:
@Entity
@IdClass(RolePermissionId.class)
public class RolePermission {
    @Id
    private UUID roleId;      // ← Name: "roleId"
    
    @Id
    private UUID permissionId; // ← Name: "permissionId"
}

// IdClass:
public static class RolePermissionId implements Serializable {
    private UUID roleId;       // ← Gleicher Name!
    private UUID permissionId; // ← Gleicher Name!
}
```

### 3. Default Constructor
```java
public RolePermissionId() {
    // Leerer Constructor für JPA
}
```

### 4. `equals()` und `hashCode()` überschreiben
```java
@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    RolePermissionId that = (RolePermissionId) o;
    return Objects.equals(roleId, that.roleId) 
        && Objects.equals(permissionId, that.permissionId);
}

@Override
public int hashCode() {
    return Objects.hash(roleId, permissionId);
}
```

**Warum?** JPA nutzt `equals()` und `hashCode()` für:
- Duplikaterkennung
- Collections (Set, Map)
- Cache-Keys

---

## Vollständiges Beispiel

```java
package com.assessment.backend.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "role_permission")
@IdClass(RolePermission.RolePermissionId.class)  // ← Key-Klasse definieren
public class RolePermission {

    // ========== COMPOSITE KEY FIELDS ==========
    @Id
    @Column(name = "role_id")
    private UUID roleId;

    @Id
    @Column(name = "permission_id")
    private UUID permissionId;

    // ========== RELATIONS ==========
    @ManyToOne
    @JoinColumn(name = "role_id", insertable = false, updatable = false)
    private Role role;

    @ManyToOne
    @JoinColumn(name = "permission_id", insertable = false, updatable = false)
    private Permission permission;

    // ========== OTHER FIELDS ==========
    @Column(name = "granted_at")
    private LocalDateTime grantedAt;

    // ========== CONSTRUCTORS ==========
    public RolePermission() {}

    public RolePermission(UUID roleId, UUID permissionId) {
        this.roleId = roleId;
        this.permissionId = permissionId;
    }

    // ========== GETTERS/SETTERS ==========
    // ... (wie üblich)

    // ========== COMPOSITE KEY CLASS ==========
    public static class RolePermissionId implements Serializable {
        
        private UUID roleId;
        private UUID permissionId;

        // Default Constructor
        public RolePermissionId() {}

        // Constructor mit Parametern
        public RolePermissionId(UUID roleId, UUID permissionId) {
            this.roleId = roleId;
            this.permissionId = permissionId;
        }

        // Getters/Setters
        public UUID getRoleId() { return roleId; }
        public void setRoleId(UUID roleId) { this.roleId = roleId; }
        public UUID getPermissionId() { return permissionId; }
        public void setPermissionId(UUID permissionId) { this.permissionId = permissionId; }

        // equals() - WICHTIG!
        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            RolePermissionId that = (RolePermissionId) o;
            return Objects.equals(roleId, that.roleId) 
                && Objects.equals(permissionId, that.permissionId);
        }

        // hashCode() - WICHTIG!
        @Override
        public int hashCode() {
            return Objects.hash(roleId, permissionId);
        }
    }
}
```

---

## Repository mit Composite Key

```java
@Repository
public interface RolePermissionRepository 
    extends JpaRepository<RolePermission, RolePermission.RolePermissionId> {
    //                                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //                                      ID-Typ ist die IdClass!
    
    // findById braucht jetzt ein RolePermissionId Objekt
    Optional<RolePermission> findById(RolePermission.RolePermissionId id);
    
    // Oder einzelne Felder nutzen (Spring Data Magic)
    List<RolePermission> findByRoleId(UUID roleId);
    boolean existsByRoleIdAndPermissionId(UUID roleId, UUID permissionId);
    void deleteByRoleIdAndPermissionId(UUID roleId, UUID permissionId);
}
```

---

## Verwendung in Services

### Entity speichern
```java
// Einfach - direkt mit UUIDs
RolePermission rp = new RolePermission(roleId, permissionId);
repository.save(rp);
```

### Entity finden per ID
```java
// Option 1: IdClass Objekt erstellen
RolePermission.RolePermissionId id = new RolePermission.RolePermissionId(roleId, permissionId);
Optional<RolePermission> rp = repository.findById(id);

// Option 2: Custom Query (einfacher!)
boolean exists = repository.existsByRoleIdAndPermissionId(roleId, permissionId);
```

### Entity löschen
```java
// Option 1: Mit IdClass
RolePermission.RolePermissionId id = new RolePermission.RolePermissionId(roleId, permissionId);
repository.deleteById(id);

// Option 2: Custom Delete (einfacher!)
repository.deleteByRoleIdAndPermissionId(roleId, permissionId);
```

---

## Andere Composite Key Beispiele im System

### UserRole
```java
@Entity
@IdClass(UserRole.UserRoleId.class)
public class UserRole {
    @Id
    private UUID userId;
    
    @Id
    private UUID roleId;
    
    // UserRoleId mit equals/hashCode...
}
```

### ThemaCatalog (kommt noch)
```java
@Entity
@IdClass(ThemaCatalog.ThemaCatalogId.class)
public class ThemaCatalog {
    @Id
    private UUID themaId;
    
    @Id
    private UUID catalogId;
    
    // ThemaCatalogId mit equals/hashCode...
}
```

### WorkerCatalog (3-Feld Composite Key!)
```java
@Entity
@IdClass(WorkerCatalog.WorkerCatalogId.class)
public class WorkerCatalog {
    @Id
    private UUID workerId;
    
    @Id
    private UUID catalogId;
    
    @Id
    private UUID companyId;  // 3 Felder zusammen = Key!
    
    // WorkerCatalogId mit 3 Feldern...
}
```

---

## Häufige Fehler

### ❌ Fehler 1: Feldnamen stimmen nicht überein
```java
// Entity:
@Id
private UUID roleId;

// IdClass:
private UUID role;  // ✗ Falscher Name! Muss "roleId" sein
```

### ❌ Fehler 2: `equals()` oder `hashCode()` fehlt
```java
public static class RolePermissionId implements Serializable {
    private UUID roleId;
    private UUID permissionId;
    
    // ✗ FEHLT: equals() und hashCode()
    // → JPA kann Duplikate nicht erkennen!
}
```

### ❌ Fehler 3: `Serializable` nicht implementiert
```java
public static class RolePermissionId {  // ✗ FEHLT: implements Serializable
    // ...
}
```

### ❌ Fehler 4: Kein Default Constructor
```java
public static class RolePermissionId implements Serializable {
    private UUID roleId;
    private UUID permissionId;
    
    // ✗ FEHLT: public RolePermissionId() {}
    
    public RolePermissionId(UUID roleId, UUID permissionId) {
        // Nur parametrisierter Constructor → JPA Error!
    }
}
```

---

## Warum Composite Keys?

### Vorteile
1. **Natürliche Beziehungen**: `(role_id, permission_id)` beschreibt die Beziehung perfekt
2. **Keine künstliche ID**: Kein zusätzliches `id` Feld nötig
3. **Performance**: Direkter Index auf beide Felder
4. **Datenintegrität**: Keine Duplikate möglich

### Nachteile
1. **Komplexer Code**: IdClass mit equals/hashCode nötig
2. **Repository Queries**: `findById()` braucht Composite-Objekt
3. **Foreign Keys**: Schwieriger wenn andere Tabellen darauf verweisen

---

## Zusammenfassung

**`@IdClass` nutzen wenn:**
- ✅ Join-Tabellen (Many-to-Many)
- ✅ Natürliche Composite Keys
- ✅ Keine künstliche ID gewünscht

**Anforderungen an IdClass:**
1. ✅ `implements Serializable`
2. ✅ Feldnamen = Entity-Feldnamen
3. ✅ Default Constructor
4. ✅ `equals()` und `hashCode()` überschreiben
5. ✅ Getters/Setters

**Im Projekt verwendet für:**
- `RolePermission` (role_id, permission_id)
- `UserRole` (user_id, role_id)
- `ThemaCatalog` (thema_id, catalog_id)
- `WorkerCatalog` (worker_id, catalog_id, company_id)

