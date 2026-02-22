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

- Users are identified by email (unique per school context)
- A user must have at least one role when created
- A user can have roles across multiple schools
- User deletion is soft-delete (sets `isActive = false`, not hard delete)
- Password is required on creation, not editable by admin after creation
- User profile linking: a user can be linked to at most ONE of `teacherId`, `studentId`, or `guardianId`
- `super_admin` users bypass all permission checks
- `super_admin` is identified by the `super_admin` role (not by absence of schools)
- Seed roles (protected): `super_admin`, `school_admin`, `principal`, `teacher`, `student`, `guardian`, `accountant`
- Seed roles cannot be renamed or deleted
- Roles with assigned users cannot be deleted
- Custom roles can be created per school (premium feature)
- Permissions follow `module.action` format (e.g., `users.list`, `students.create`)
- Permissions are assigned to roles and flattened into the JWT

### Students

- Students are identified by `studentCode` (unique per school, immutable after creation)
- A student has a lifecycle status: `active` → `graduated` | `withdrawn` | `suspended` | `transferred`
- Status transitions are validated by the backend (finite state machine)
- Student deletion is soft-delete (sets `deletedAt`, not hard delete)
- Required fields on creation: studentCode, firstName, lastName, dateOfBirth, gender, admissionDate
- Optional fields: nationalId, nationality, religion, bloodType, address, phone, email, photoUrl, medicalNotes
- Student data includes sensitive PII (national ID, medical notes, contact info) — must be permission-gated
- A student can have guardians linked via the student-guardian relationship (not yet implemented in frontend)
- A student is enrolled in a class section via the enrollment entity (not yet implemented in frontend)

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

| Decision                                                          | Rationale                                                                                                                              | Date       |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Use `shareReplay(1)` on token refresh observable                  | Prevents duplicate refresh requests when multiple 401s fire concurrently                                                               | 2026-02-21 |
| Detect super admin by role name, not schools.length               | `user.schools.length === 0` is fragile — deactivated users with no schools would be misidentified                                      | 2026-02-21 |
| Separate `LoginResponseUser` type from `AuthUser`                 | Backend login response has flat `schoolId`, not `schools[]` array. `AuthUser` is built from `/auth/me` profile                         | 2026-02-21 |
| Remove `role="navigation"` from sidebar `<aside>`                 | Inner `<nav>` already provides navigation landmark; double nesting confuses screen readers                                             | 2026-02-21 |
| Wildcard route redirects to `/schools` not `/login`               | Authenticated users hitting unknown URLs get a redirect chain (login → guestGuard → schools). Direct redirect is cleaner               | 2026-02-21 |
| Remove forgot password button until flow is implemented           | Dead button with no handler is misleading UX                                                                                           | 2026-02-21 |
| Notification bell dropdown should migrate to CDK Overlay          | CLAUDE.md mandates CDK for popups. Current manual `@HostListener` approach works but lacks CDK benefits (focus trap, z-index stacking) | 2026-02-21 |
| Add `permissionGuard` to detail routes                            | User/role detail routes were unprotected — any authenticated user could view details without `*.read` permission                       | 2026-02-21 |
| Convert template methods to `computed()` signals                  | Methods called in templates re-evaluate on every change detection cycle; `computed()` memoizes until dependencies change               | 2026-02-21 |
| Validate role selection client-side before create                 | Backend requires `roleIds` min 1; client-side validation gives immediate feedback instead of generic 400 error                         | 2026-02-21 |
| Confirmation modals should use shared CDK Overlay component       | 11 files use manual `fixed inset-0` overlay pattern. Shared component with CDK Overlay is the right approach (incremental migration)   | 2026-02-21 |
| Soft-delete messages should reflect deactivation, not destruction | Backend uses soft-delete for students (sets `deletedAt`). UI messages should say "deactivated" not "cannot be undone"                  | 2026-02-21 |
| Always show error feedback on failed mutations                    | Silent modal dismissal on delete failure gives no user feedback. All mutation errors must set an error signal                          | 2026-02-21 |

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

### Users & Roles (Module 2)

#### Users CRUD

- [x] List users with pagination, search, role filter, and status filter
- [x] Create user with email, phone, password, and role assignment
- [x] Edit user email, phone, and active status
- [x] View user details with assigned roles
- [x] Assign roles to user from detail page
- [x] Remove roles from user with confirmation
- [x] Permission-based UI (create/edit buttons hidden without permission)
- [x] Loading, error, and empty states handled
- [x] Data reloads on school context change
- [x] Validate at least one role selected before create
- [x] Detail route requires `users.read` permission

#### Roles CRUD

- [x] List roles with pagination and search
- [x] Create custom role with name
- [x] Edit custom role name
- [x] Delete custom role with confirmation
- [x] View role details with permission management
- [x] Toggle individual permissions or entire modules
- [x] Indeterminate checkbox state for partially-selected modules
- [x] Seed role protection (no edit/delete)
- [x] Permission-based UI
- [x] Loading, error, and empty states handled
- [x] Detail route requires `roles.read` permission

### Students (Module 3)

#### Students CRUD

- [x] List students with pagination, search, and status filter
- [x] Create student with all required and optional fields
- [x] Edit student (all fields except studentCode)
- [x] View student details with organized info cards
- [x] Delete student with confirmation modal (soft delete)
- [x] Status displayed with color-coded badges and icons
- [x] Permission-based UI (create/edit/delete buttons hidden without permission)
- [x] Loading, error, and empty states handled
- [x] Data reloads on school context change
- [x] Dates formatted with Angular DatePipe
- [x] RTL support (dir="ltr" on email/phone, logical properties)
- [x] Detail route requires `students.read` permission
- [x] Delete failure shows error message
- [ ] Guardian management on student detail (deferred)
- [ ] Class section filter on list (deferred)
- [ ] Enrollment management (deferred)
