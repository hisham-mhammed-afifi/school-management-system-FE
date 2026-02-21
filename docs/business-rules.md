# Business Rules & Decisions Log

> Maintained by Tech Lead Agent. Updated as features are reviewed and built.

## Domain Rules

### Authentication

- JWT access tokens expire in 1h, refresh tokens in 7d (HS256)
- Login is rate-limited: 10 attempts per 15 minutes per IP
- Refresh is rate-limited: 30 attempts per 15 minutes per IP
- Token refresh is automatic on 401 (except `/auth/login` and `/auth/refresh` endpoints)
- Session is cleared on refresh failure, user redirected to login
- Forgot/reset password endpoints exist but frontend flow not yet implemented

### Users & Roles

- A user can have roles across multiple schools
- `super_admin` users bypass all permission checks
- `super_admin` is identified by the `super_admin` role (not by absence of schools)
- Seed roles (protected): `super_admin`, `school_admin`, `principal`, `teacher`, `student`, `guardian`, `accountant`
- Custom roles can be created per school (premium feature)
- Permissions are assigned to roles and flattened into the JWT

### School Context

- Single-school users go directly to their dashboard after login
- Multi-school users and super admins go to the school picker
- Super admins can access any school; regular users only their assigned schools
- `X-School-Id` header is attached to all API requests when inside a school context
- Super admins must have `X-School-Id` for school-scoped operations

### Navigation & Permissions

- Sidebar items are filtered by permissions AND roles
- Parent Portal is visible only to users with the `guardian` role
- Notifications nav item has no permission gate (visible to all authenticated users)
- School name in sidebar links to school picker only for super admins and multi-school users

### Subscription Feature Gates

| Feature                 | Minimum Plan |
| ----------------------- | ------------ |
| `report_cards`          | basic        |
| `fee_management`        | basic        |
| `auto_scheduling`       | premium      |
| `per_lesson_attendance` | premium      |
| `online_payment`        | premium      |
| `sms_notifications`     | premium      |
| `custom_roles`          | premium      |
| `audit_logs`            | premium      |
| `api_access`            | enterprise   |

Plan hierarchy: `free` < `basic` < `premium` < `enterprise`

---

## Architecture Decisions

| Decision                                                 | Rationale                                                                                                                              | Date       |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Use `shareReplay(1)` on token refresh observable         | Prevents duplicate refresh requests when multiple 401s fire concurrently                                                               | 2026-02-21 |
| Detect super admin by role name, not schools.length      | `user.schools.length === 0` is fragile — deactivated users with no schools would be misidentified                                      | 2026-02-21 |
| Separate `LoginResponseUser` type from `AuthUser`        | Backend login response has flat `schoolId`, not `schools[]` array. `AuthUser` is built from `/auth/me` profile                         | 2026-02-21 |
| Remove `role="navigation"` from sidebar `<aside>`        | Inner `<nav>` already provides navigation landmark; double nesting confuses screen readers                                             | 2026-02-21 |
| Wildcard route redirects to `/schools` not `/login`      | Authenticated users hitting unknown URLs get a redirect chain (login → guestGuard → schools). Direct redirect is cleaner               | 2026-02-21 |
| Remove forgot password button until flow is implemented  | Dead button with no handler is misleading UX                                                                                           | 2026-02-21 |
| Notification bell dropdown should migrate to CDK Overlay | CLAUDE.md mandates CDK for popups. Current manual `@HostListener` approach works but lacks CDK benefits (focus trap, z-index stacking) | 2026-02-21 |

---

## Feature Acceptance Criteria

### Auth & Layout (Module 1)

- [x] User can log in with email/password
- [x] Invalid credentials show error message
- [x] Form validates email format and required fields
- [x] Single-school user redirected to dashboard after login
- [x] Multi-school user redirected to school picker after login
- [x] Token refresh happens automatically on 401
- [x] Session clears and redirects to login on refresh failure
- [x] Logout clears tokens and navigates to login
- [x] Sidebar shows nav items filtered by permissions
- [x] Parent Portal nav visible only to guardians
- [x] School name links to picker for multi-school users
- [x] Mobile sidebar with overlay and toggle
- [x] Notification bell with unread count and dropdown
- [x] Theme toggle (light/dark) in header
- [x] Language switcher (EN/AR) in header
- [x] RTL layout works correctly
- [x] Dark mode works correctly
- [ ] Forgot/reset password flow (deferred)
- [ ] Profile update page (deferred)
