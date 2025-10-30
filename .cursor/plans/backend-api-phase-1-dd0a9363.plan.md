<!-- dd0a9363-d51f-4344-bdd6-387b0fe63008 5c2f05ea-822a-45c4-94ef-1ee076ad0d4e -->
# Backend API - Phase 1 Prototyp

## Scope: Was wird implementiert

### Auth & User Management

- **Users** (id, name, email, created_at, updated_at)
- **Role** (id, name, description, created_at)
- **UserRole** (user_id, role_id, assigned_at)
- Login/Logout Endpoints mit Spring Security

### Business Entities

- **Company** (id, name, description, created_at, updated_at)
- **Worker** (id, name, work_space_ref, company_id, email, created_at, updated_at)

## Implementierung: Klassische Architektur (ohne DTOs)

### 1. Entities erstellen (`backend/src/main/java/com/assessment/backend/entity/`)

- `User.java` - JPA Entity mit UUID, Timestamps
- `Role.java` - JPA Entity
- `UserRole.java` - JPA Entity (composite key)
- `Company.java` - JPA Entity
- `Worker.java` - JPA Entity mit @ManyToOne zu Company

### 2. Repositories (`backend/src/main/java/com/assessment/backend/repository/`)

- `UserRepository.java` extends JpaRepository
- `RoleRepository.java` extends JpaRepository
- `UserRoleRepository.java` extends JpaRepository
- `CompanyRepository.java` extends JpaRepository
- `WorkerRepository.java` extends JpaRepository

### 3. Services (`backend/src/main/java/com/assessment/backend/service/`)

- `AuthService.java` - Login/Logout Logik
- `UserService.java` - CRUD User + Role Assignment
- `CompanyService.java` - CRUD Company
- `WorkerService.java` - CRUD Worker
- **Entities direkt als Parameter und Rückgabewerte verwenden**

### 4. Controllers (`backend/src/main/java/com/assessment/backend/controller/`)

- `AuthController.java` - POST `/api/auth/login`, POST `/api/auth/logout`
- `UserController.java` - GET, POST, PUT, DELETE `/api/users`
- `CompanyController.java` - GET, POST, PUT, DELETE `/api/companies`
- `WorkerController.java` - GET, POST, PUT, DELETE `/api/workers`
- **Entities direkt als @RequestBody und ResponseEntity verwenden**

### 5. Security Config (`backend/src/main/java/com/assessment/backend/security/`)

- Basic Spring Security Setup
- JWT oder Session-based Auth (einfach halten)
- CORS Configuration

### 6. Application Properties

- `application.yaml` - DB Connection (PostgreSQL)
- JPA/Hibernate Settings

## Testing mit Postman

- Auth: Login → Token erhalten
- Companies: CRUD testen
- Workers: CRUD testen (mit company_id)
- User Management: User erstellen, Rollen zuweisen

---

## 📝 NOTIZEN FÜR SPÄTER (Phase 2+)

### Zu ergänzen:

1. **Permission System**

- Permission Entity + RolePermission (granulare Rechte)
- @PreAuthorize Annotations in Controllers

2. **Assessment Content**

- Thema, Catalog, ThemaCatalog
- WorkerCatalog (Katalog zu Worker zuweisen)
- Question, QuestionType, QuestionNode, QuestionCondition

3. **Assessment Execution**

- AssessmentSession, Answer
- Flow Logic für conditional questions

4. **Audit & Logging**

- AuditLog Entity
- AOP für automatisches Logging

### Zu refactoren:

1. **DTO Layer einführen**

- DTOs für API Communication
- MapStruct für Mapping
- Entity/DTO Trennung

2. **Exception Handling**

- @ControllerAdvice für globale Exception Behandlung
- Custom Exceptions (ResourceNotFoundException, etc.)

3. **Validation**

- @Valid Annotations
- Custom Validators

4. **Pagination & Filtering**

- Pageable in Repositories
- Search/Filter Support

5. **Response Wrapper**

- Einheitliche API Response Structure
- ApiResponse<T> wrapper

6. **Security Enhancement**

- Method-level security
- Role-based access control per endpoint
- Password encryption (BCrypt)

7. **Code Quality**

- Lombok für Boilerplate reduction
- Unit & Integration Tests

### To-dos

- [ ] Create all JPA entities (User, Role, UserRole, Company, Worker)
- [ ] Create Spring Data JPA repositories
- [ ] Implement service layer - Entities direkt verwenden
- [ ] Create REST controllers - Entities als Request/Response
- [ ] Configure Spring Security for auth
- [ ] Test all endpoints with Postman