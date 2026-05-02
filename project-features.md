# Project Testing Features - Angular Frontend

This document provides an in-depth explanation of the unit testing implementation for the JPMS Frontend application.

## 🧪 Testing Strategy

We use **Vitest** as our primary testing runner. Vitest provides a fast, modern testing experience with built-in support for JSDOM and seamless integration with Angular's signal-based architecture.

### Key Areas of Focus
1.  **Core Services:** Validating API interactions, state management (signals), and business logic.
2.  **Authentication Flow:** Ensuring secure login, registration, and token handling.
3.  **UI Components:** Testing form validations, event handling, and conditional rendering.
4.  **Security Guards:** Verifying that protected routes are correctly guarded based on user roles.

---

## 🛠️ Implementation Walkthrough

### 1. Service Testing (`AuthService`)
Services are the backbone of our application. We test them by mocking `HttpClient` to ensure no real network calls are made.

**Key Tests:**
- Successful login stores tokens in `localStorage`.
- Failed login returns appropriate error messages.
- `isLoggedIn` signal updates correctly based on authentication state.

### 2. Component Testing (`LoginComponent`)
We test components in isolation by mocking their injected services.

**Key Tests:**
- Form validation (email format, password length).
- Submission triggers the `AuthService.login` method.
- Loading states are correctly reflected in the UI.

### 3. Mocking Strategy
We use `vi.mock` and manual spies to isolate the code under test. All external dependencies (Router, AuthService, ToastService) are replaced with controlled mocks.

---

## 📂 New Files Created

- `src/app/core/auth/auth.service.spec.ts`: Unit tests for authentication logic.
- `src/app/core/services/admin.service.spec.ts`: Unit tests for administrative services.
- `src/app/pages/public/login/login.component.spec.ts`: Unit tests for the login interface.
- `src/app/pages/public/register/register.component.spec.ts`: Unit tests for the account creation interface.
- `src/app/core/auth/auth.guard.spec.ts`: Unit tests for route protection.

## 📊 Test Coverage & UI

We have integrated **Vitest UI** and **V8 Coverage** to provide a rich, visual overview of our testing status.

### How to use:
1.  Run `npm run test:ui` in the `jpms-frontend` directory.
2.  A browser window will open showing the Vitest dashboard.
3.  Navigate to the **"Coverage"** tab to see detailed metrics for:
    - **Lines:** Number of code lines executed.
    - **Functions:** Number of functions called.
    - **Branches:** Number of control structures (if/else) fully explored.

The coverage reports are generated automatically in the `jpms-frontend/coverage` folder.


---

# Backend Optimization - Lombok Integration

This document outlines the implementation of **Lombok** across the backend microservices to optimize code maintainability and reduce boilerplate.

## 🚀 Objectives
1.  **Reduce Verbosity:** Eliminate manual getters, setters, and constructors.
2.  **Standardize Patterns:** Ensure consistent logging and dependency injection.
3.  **Enhance Reliability:** Automatically update boilerplate when fields change.

---

## 🛠️ Implementation Strategy

We adopted a selective annotation strategy to maintain system stability while achieving maximum boilerplate reduction.

### 1. Data Transfer Objects (DTOs)
DTOs utilize the full power of Lombok for complete data encapsulation.
- **Annotations:** `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`
- **Impact:** Automatically generates all getters, setters, `toString`, `equals`, and `hashCode` methods.

### 2. JPA Entities
Entities are treated with care to avoid common JPA/Hibernate pitfalls (like circular references in `toString` or performance issues with `@Data`).
- **Annotations:** `@Getter`, `@Setter`, `@NoArgsConstructor`
- **Strict Controls:** 
    - No `@Data` annotation on entities.
    - Disabled setters for immutable fields like `createdAt` and `updatedAt`.
    - Preserved manual business-specific constructors where necessary.

### 3. Services & Listeners
Business logic components are optimized for clean dependency injection and modern logging.
- **Annotations:** `@Slf4j`, `@RequiredArgsConstructor`
- **Injection:** Replaced manual constructor injection and `@Autowired` fields with `private final` fields managed by Lombok.
- **Logging:** Standardized on SLF4J API, replacing manual `LogManager.getLogger()` declarations with the `log` object.

---

## 📂 Services Impacted

- **JPMS-AuthService:** User entities, Auth DTOs, and security services.
- **JPMS-JobService:** Job listings, search DTOs, and management logic.
- **JPMS-ApplicationService:** Application tracking and status management.
- **JPMS-AdminService:** Reporting, audit logging, and dashboard logic.
- **JPMS-NotificationService:** RabbitMQ listeners and email delivery services.
- **JPMS-ApiGateWay:** JWT filters and reactive fallback controllers.

---

## ✅ Best Practices Followed
1.  **Annotation Processing:** Enabled globally to ensure IDE and compiler compatibility.
2.  **No Logic Change:** Every refactoring step was validated to ensure zero disruption to business logic or API contracts.
3.  **Naming Convention:** Migrated from inconsistent logger names (e.g., `logger`) to the standard Lombok `log` reference.
