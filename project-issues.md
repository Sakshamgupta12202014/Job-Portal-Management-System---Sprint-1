# Project Issues Log

This file contains only the latest correct solutions for issues encountered during development.

---

### === Issue: Frontend-Backend Communication Failure (CORS) ===

**Problem Description:**
The Angular frontend (`localhost:4200`) was unable to fetch data from the API Gateway (`localhost:9090`) because the browser blocked the requests due to CORS (Cross-Origin Resource Sharing) restrictions.

**Root Cause:**
The API Gateway was not configured to permit incoming requests from the frontend's origin.

**Files Modified:**
- `JPMS-ApiGateWay/src/main/resources/application.yml`

**Code Changes:**
```yaml
spring:
  cloud:
    gateway:
      globalcors:
        corsConfigurations:
          '[/**]':
            allowedOrigins: "http://localhost:4200"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - PATCH
              - OPTIONS
            allowedHeaders: "*"
            allowCredentials: true
```

**Final Working Solution:**
Added a global CORS configuration to the API Gateway to whitelist the frontend origin and allow all standard HTTP methods.

---

### === Issue: 401 Unauthorized for Public Platform Statistics ===

**Problem Description:**
Guest users on the homepage could not see the platform statistics (total jobs, users, etc.) because the API Gateway required a JWT token for all requests to the Admin Service.

**Root Cause:**
The `/api/admin/public/stats` route was not included in the Gateway's public route whitelist, and the Admin Service lacked a public endpoint for this data.

**Files Modified:**
- `JPMS-AdminService/src/main/java/com/capg/jobportal/controller/AdminController.java`
- `JPMS-ApiGateWay/src/main/java/com/capg/jobportal/filter/GatewayJwtFilter.java`

**Code Changes:**
*GatewayJwtFilter.java:*
```java
private boolean isPublicRoute(String path, String method) {
    if (path.equals("/api/admin/public/stats")) return true;
    // ... other public routes
}
```

*AdminController.java:*
```java
@GetMapping("/public/stats")
public ResponseEntity<PlatformReport> getPublicStats() {
    return ResponseEntity.ok(adminService.getPlatformReport());
}
```

**Final Working Solution:**
Created a specific public endpoint in the Admin Service and updated the Gateway's security filter to bypass authentication for this route.

---

### === Issue: ERR_EMPTY_RESPONSE in Docker Networking ===

**Problem Description:**
When running the system via Docker Compose, the frontend received an `ERR_EMPTY_RESPONSE` when trying to call backend services.

**Root Cause:**
The API Gateway was configured to connect to Eureka using `localhost:8761`. Inside a Docker container, `localhost` refers to the container itself, but Eureka is running in its own container named `eureka-server`.

**Files Modified:**
- `JPMS-ApiGateWay/src/main/resources/application.yml`

**Code Changes:**
```yaml
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
```

**Final Working Solution:**
Changed the Eureka Discovery URL from `localhost` to the Docker service name `eureka-server` to allow proper inter-container communication.

---

### === Issue: TypeScript Compilation Errors (Signal & Router) ===

**Problem Description:**
The Angular application failed to build (`ng serve`) with errors: `Object is possibly 'undefined'` and `No overload matches this call` (invalid `inject` usage).

**Root Cause:**
- TypeScript strict checks were flaggin an optional `skills` field being split without a null check.
- An attempt was made to use the `inject()` function inside a class method (`onSubmit`), which is only allowed in constructor/initializer contexts.

**Files Modified:**
- `jpms-frontend/src/app/pages/job-seeker/profile/seeker-profile.component.ts`
- `jpms-frontend/src/app/pages/shared/edit-profile/edit-profile.component.ts`

**Code Changes:**
*seeker-profile.component.ts:*
```typescript
@for (skill of profile()!.skills!.split(','); track skill) {
```

*edit-profile.component.ts:*
```typescript
next: () => {
  this.toast.success('Profile updated successfully!');
  window.history.back(); // Removed invalid inject/router call
},
```

**Final Working Solution:**
Added non-null assertions for the skills signal and simplified navigation by using `window.history.back()` instead of a complex router injection.
