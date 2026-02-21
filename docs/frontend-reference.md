# Frontend Architecture Reference

> Last updated: 2026-02-21
> THIS FILE IS THE SOURCE OF TRUTH. All agents must follow these patterns.

## Tech Stack

- **Angular**: 21 (latest)
- **UI Library**: Custom (no PrimeNG/Material — Tailwind + semantic tokens)
- **Styling**: Tailwind CSS 4.1 + CSS custom properties (semantic design tokens)
- **State Management**: Angular Signals (`signal()`, `computed()`, `effect()`)
- **i18n**: ngx-translate 17 (HTTP loader from JSON files)
- **Forms**: Reactive Forms (Angular built-in)
- **HTTP**: Angular `HttpClient` with functional interceptors
- **Testing**: Vitest 4 (unit) + Playwright 1.58 (e2e)
- **Build**: Angular CLI 21
- **CDK**: `@angular/cdk` installed (overlay, a11y, drag-drop, layout, bidi, etc.)
- **Other notable deps**: `@angular/cdk`, `@ngx-translate/core`, `@ngx-translate/http-loader`

## Project Structure

```
src/
├── main.ts                             # bootstrapApplication(App, appConfig)
├── index.html                          # HTML shell with dark-mode detection script
├── styles.css                          # Global styles: Tailwind imports + semantic tokens
├── app/
│   ├── app.ts                          # Root component (standalone, [dir] wrapper)
│   ├── app.html                        # Root template (skip-link + dir wrapper + router-outlet)
│   ├── app.css                         # :host { display: block; }
│   ├── app.spec.ts                     # Root component tests
│   ├── app.config.ts                   # Providers: router, http, i18n, error handler
│   ├── app.routes.ts                   # Full route config with lazy loading
│   ├── core/                           # Singletons: services, guards, interceptors
│   │   ├── services/
│   │   │   ├── auth.service.ts         # JWT auth: login, refresh, logout, user signal
│   │   │   ├── auth.service.spec.ts
│   │   │   ├── school.service.ts       # School context: currentSchoolId, isSuperAdmin
│   │   │   ├── school.service.spec.ts
│   │   │   ├── permission.service.ts   # Permission checks with super-admin bypass
│   │   │   ├── permission.service.spec.ts
│   │   │   ├── notification.service.ts # Notification CRUD + unread count
│   │   │   ├── notification.service.spec.ts
│   │   │   ├── theme.service.ts        # Theme management (signals + localStorage)
│   │   │   ├── theme.service.spec.ts
│   │   │   ├── translation.service.ts  # i18n + RTL management (signals)
│   │   │   ├── translation.service.spec.ts
│   │   │   ├── error-handler.service.ts # Global ErrorHandler implementation
│   │   │   └── error-handler.service.spec.ts
│   │   ├── interceptors/
│   │   │   ├── api.interceptor.ts      # Rewrites /api/* → environment.apiUrl + auth/school headers
│   │   │   ├── api.interceptor.spec.ts
│   │   │   ├── error.interceptor.ts    # 401→refresh→retry, session clear on failure
│   │   │   └── error.interceptor.spec.ts
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Protects authenticated routes, fetches user on refresh
│   │   │   ├── auth.guard.spec.ts
│   │   │   ├── guest.guard.ts          # Protects login (redirects authenticated → /schools)
│   │   │   ├── guest.guard.spec.ts
│   │   │   ├── permission.guard.ts     # Factory guard for permission-based route protection
│   │   │   ├── permission.guard.spec.ts
│   │   │   ├── school-context.guard.ts # Validates :schoolId accessible to current user
│   │   │   └── school-context.guard.spec.ts
│   │   └── models/
│   │       ├── auth.ts                 # LoginRequest, LoginResponse, AuthUser, UserProfile
│   │       ├── api.ts                  # ApiResponse, PaginatedResponse, error types
│   │       ├── notification.ts         # Notification, SendNotificationRequest
│   │       ├── school.ts              # School interface
│   │       └── user.ts               # User interface
│   ├── shared/                         # Reusable components, directives, pipes
│   │   └── components/
│   │       ├── layout/                 # Main app layout (sidebar + header + content)
│   │       │   ├── layout.ts
│   │       │   ├── layout.html
│   │       │   ├── layout.css
│   │       │   └── layout.spec.ts
│   │       ├── sidebar/                # Navigation sidebar with permission filtering
│   │       │   ├── sidebar.ts
│   │       │   ├── sidebar.html
│   │       │   ├── sidebar.css
│   │       │   └── sidebar.spec.ts
│   │       ├── notification-bell/      # Header notification dropdown with polling
│   │       │   ├── notification-bell.ts
│   │       │   ├── notification-bell.html
│   │       │   ├── notification-bell.css
│   │       │   └── notification-bell.spec.ts
│   │       ├── icon/                   # FontAwesome icon wrapper with RTL flip
│   │       │   ├── icon.ts
│   │       │   └── icon.spec.ts
│   │       ├── theme-toggle/
│   │       │   ├── theme-toggle.ts     # Light/Dark theme toggle
│   │       │   └── theme-toggle.spec.ts
│   │       └── language-switcher/
│   │           ├── language-switcher.ts # EN/AR toggle button
│   │           └── language-switcher.spec.ts
│   └── features/
│       ├── auth/login/                 # Login page
│       │   ├── login.ts
│       │   ├── login.html
│       │   ├── login.css
│       │   └── login.spec.ts
│       ├── school-picker/              # School selection for multi-school users
│       ├── dashboard/                  # Dashboard page
│       ├── users/                      # User CRUD (list, form, detail)
│       ├── students/                   # Student CRUD (list, form, detail)
│       ├── teachers/                   # Teacher CRUD (list, form, detail)
│       ├── class-sections/             # Class section CRUD
│       ├── subjects/                   # Subject CRUD
│       ├── timetable/                  # Timetable view
│       ├── attendance/                 # Attendance management
│       ├── grading-scales/             # Grading scale CRUD
│       ├── exams/                      # Exam CRUD
│       ├── grade-entry/                # Grade entry page
│       ├── report-cards/               # Report card list + detail
│       ├── fee-structures/             # Fee structure CRUD
│       ├── fee-invoices/               # Fee invoice CRUD
│       ├── notifications/              # Notification list + send
│       ├── parent-portal/              # Guardian portal (children, grades, attendance)
│       └── roles/                      # Role CRUD
└── environments/
    ├── environment.ts                  # { production: false, apiUrl: 'http://localhost:3000/api' }
    ├── environment.production.ts       # { production: true, apiUrl: '/api' }
    └── environment.staging.ts          # { production: true, apiUrl: 'https://staging-api.example.com/api' }
```

**Status**: Auth & Layout module complete. Core infrastructure, guards, interceptors, permission system, and notification service implemented. Feature CRUD pages scaffolded with routing.

## Path Aliases

| Alias       | Maps To                        | Usage                                  |
| ----------- | ------------------------------ | -------------------------------------- |
| `@core/*`   | `src/app/core/*`               | Services, guards, interceptors         |
| `@shared/*` | `src/app/shared/*`             | Reusable components, directives, pipes |
| `@app/*`    | `src/app/*`                    | Any app-level import                   |
| `@env`      | `src/environments/environment` | Environment config                     |

**Rule**: Always use path aliases. Never use relative imports across module boundaries.

## Routing

### Route Tree

```
/login                          → LoginComponent (guestGuard)
/schools                        → authGuard
  /                             → SchoolPickerComponent
  /:schoolId                    → LayoutComponent (schoolContextGuard)
    /dashboard                  → permissionGuard('dashboard.read')
    /users                      → permissionGuard('users.list')
      /new                      → permissionGuard('users.create')
      /:id                      → detail view
      /:id/edit                 → permissionGuard('users.update')
    /students                   → permissionGuard('students.list') [+ new, :id, :id/edit]
    /teachers                   → permissionGuard('teachers.list') [+ new, :id, :id/edit]
    /class-sections             → permissionGuard('class-sections.list') [+ new, :id, :id/edit]
    /subjects                   → permissionGuard('subjects.list') [+ new, :id, :id/edit]
    /timetable                  → permissionGuard('lessons.list')
    /attendance                 → permissionGuard('student-attendance.list')
    /grading-scales             → permissionGuard('grading-scales.list') [+ new, :id, :id/edit]
    /exams                      → permissionGuard('exams.list') [+ new, :id, :id/edit]
    /grade-entry                → permissionGuard('student-grades.list')
    /report-cards               → permissionGuard('report-cards.list') [+ :id]
    /fee-structures             → permissionGuard('fee-structures.list') [+ new, :id, :id/edit]
    /fee-invoices               → permissionGuard('fee-invoices.list') [+ new, :id]
    /notifications              → list [+ /send with permissionGuard('notifications.create')]
    /parent-portal              → guardian views [+ :studentId/grades, attendance, etc.]
    /roles                      → permissionGuard('roles.list') [+ new, :id, :id/edit]
    /                           → redirects to dashboard
/                               → redirects to /schools
/**                             → redirects to /schools
```

### Lazy Loading Pattern

- Use `loadComponent()` with dynamic imports in route definitions
- Each feature gets its own folder under `features/`
- Guards applied at route level

### Guards

| Guard                | Path                                  | Type             | Logic                                                                    |
| -------------------- | ------------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| `authGuard`          | `core/guards/auth.guard.ts`           | `CanActivateFn`  | Checks token; fetches user on refresh; redirects unauthenticated → login |
| `guestGuard`         | `core/guards/guest.guard.ts`          | `CanActivateFn`  | Allows unauthenticated; redirects authenticated → /schools               |
| `schoolContextGuard` | `core/guards/school-context.guard.ts` | `CanActivateFn`  | Validates :schoolId access; super admins bypass; redirects unauthorized  |
| `permissionGuard()`  | `core/guards/permission.guard.ts`     | Factory function | Checks user has required permission(s); super admins bypass              |

## Component Conventions

> Based on analysis of all existing components (App, ThemeToggle, LanguageSwitcher)

| Convention       | Pattern                 | Example                                                     |
| ---------------- | ----------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| Standalone       | **Yes, always**         | `standalone: true` (no NgModules, ever)                     |
| Inputs/Outputs   | **Signal-based**        | `input()`, `output()` (e.g., SidebarComponent)              |
| Change Detection | **Default**             | Not explicitly set on any component                         |
| Control Flow     | **`@for` / `@if`**      | `@for (option of options; track option.value)`              |
| DI Style         | **`inject()` function** | `protected readonly themeService = inject(ThemeService);`   |
| Template         | **External**            | `templateUrl: './app.html'` (except small inline templates) |
| Styles           | **External**            | `styleUrl: './app.css'` (minimal `:host` styles)            |
| Selector Prefix  | **`app-`**              | `selector: 'app-theme-toggle'`                              |
| File naming      | **No suffix**           | `theme-toggle.ts` not `theme-toggle.component.ts`           |
| Date formatting  | **Angular `DatePipe`**  | `{{ date                                                    | date: 'mediumDate' }}` — never render raw ISO strings |

**When creating new components, follow these exact patterns.**

### Component File Template

```typescript
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [
    /* dependencies */
  ],
  templateUrl: './my-component.html',
  styleUrl: './my-component.css',
})
export class MyComponent {
  private readonly someService = inject(SomeService);
  // Use signal() for local state
  // Use computed() for derived state
  // Use inject(DestroyRef) for cleanup
}
```

## Service Conventions

| Convention       | Pattern                                              |
| ---------------- | ---------------------------------------------------- |
| Injectable scope | `@Injectable({ providedIn: 'root' })` for singletons |
| State management | Signals: `signal()`, `computed()`, `effect()`        |
| Cleanup          | `inject(DestroyRef).onDestroy(() => ...)`            |
| HTTP calls       | Via `HttpClient` — see interceptor patterns below    |
| Storage          | localStorage with typed keys                         |

### HTTP Call Pattern (from interceptors)

```typescript
// API interceptor:
// - Skips non-API requests (e.g., translation JSON files)
// - Rewrites /api/* URLs to environment.apiUrl
// - Attaches Authorization: Bearer {token} header
// - Attaches X-School-Id header when in school context

// Error interceptor:
// - 401 (not login/refresh) → auto-refresh token → retry original request
// - Refresh failure → clear session → redirect to /login
// - All other errors re-thrown (not swallowed)
```

### Base URL Configuration

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Backend runs on port 3000
};
```

**When creating new services, follow these exact patterns.**

## Styling Conventions

### Structure

- **Global**: `src/styles.css` — Tailwind imports + semantic tokens in `:root` and `.dark`
- **Component**: External CSS files (minimal, usually just `:host { display: block; }`)
- **Approach**: Tailwind utility classes directly in templates

### Semantic Design Tokens

All colors use CSS custom properties. **Never hardcode Tailwind colors** (no `text-red-500`, `bg-gray-300`).

#### Available Tokens

| Token                 | Light Value | Dark Value | Usage                           |
| --------------------- | ----------- | ---------- | ------------------------------- |
| `bg-bg-primary`       | white       | #0f172a    | Page background                 |
| `bg-bg-secondary`     | #f1f5f9     | #1e293b    | Secondary backgrounds           |
| `text-text-primary`   | #0f172a     | #f8fafc    | Primary text                    |
| `text-text-secondary` | #475569     | #94a3b8    | Secondary text                  |
| `border-border`       | #e2e8f0     | #334155    | Borders                         |
| `bg-accent`           | #2563eb     | #3b82f6    | Primary accent (buttons, links) |
| `bg-accent-hover`     | #1d4ed8     | #2563eb    | Accent hover                    |
| `text-accent-text`    | white       | white      | Text on accent                  |
| `bg-danger`           | #dc2626     | #ef4444    | Danger/delete                   |
| `bg-danger-hover`     | #b91c1c     | #dc2626    | Danger hover                    |
| `text-danger-text`    | white       | white      | Text on danger                  |
| `bg-success-bg`       | #f0fdf4     | #052e16    | Success background              |
| `text-success-text`   | #166534     | #4ade80    | Success text                    |
| `bg-error-bg`         | #fef2f2     | #450a0a    | Error background                |
| `text-error-text`     | #991b1b     | #fca5a5    | Error text                      |
| `bg-info-bg`          | #eff6ff     | #172554    | Info background                 |
| `text-info-text`      | #1e40af     | #93c5fd    | Info text                       |
| `bg-surface`          | #f8fafc     | #1e293b    | Card/surface background         |
| `bg-surface-hover`    | #f1f5f9     | #334155    | Surface hover                   |
| `shadow-card`         | custom      | custom     | Card shadow                     |

#### Gradient Tokens

| Token                    | Usage                |
| ------------------------ | -------------------- |
| `--color-gradient-start` | Gradient backgrounds |
| `--color-gradient-end`   | Gradient backgrounds |

### RTL / Logical Properties

| Do                       | Don't                             |
| ------------------------ | --------------------------------- |
| `ps-5`                   | `pl-5`                            |
| `pe-3`                   | `pr-3`                            |
| `ms-2`                   | `ml-2`                            |
| `me-2`                   | `mr-2`                            |
| `text-start`             | `text-left`                       |
| `inset-inline-start`     | `left`                            |
| `border-s`               | `border-l`                        |
| `not-first:border-s`     | `not-first:border-l`              |
| `clip-path: inset(50%)`  | `left: -9999px` (for hiding)      |
| `border-0` (conditional) | `border-none` (kills all borders) |

### Dark Mode

- Toggle via `.dark` class on `<html>` element
- Three modes: Light, System (OS preference), Dark
- Theme stored in localStorage key `'theme'`
- CSS variables swap automatically between `:root` and `.dark` selectors

### Responsive Approach

- Mobile-first with Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- CDK `BreakpointObserver` available for programmatic breakpoints

**When writing styles, follow these exact patterns.**

## Shared Components Library

| Component        | Path                                                       | Purpose                              | Inputs                               | Outputs                             |
| ---------------- | ---------------------------------------------------------- | ------------------------------------ | ------------------------------------ | ----------------------------------- |
| Layout           | `shared/components/layout/layout.ts`                       | Main app shell (sidebar+header+main) | None (route component)               | None                                |
| Sidebar          | `shared/components/sidebar/sidebar.ts`                     | Nav sidebar with permission filter   | `open: boolean`                      | `closed: void`                      |
| NotificationBell | `shared/components/notification-bell/notification-bell.ts` | Header notification dropdown         | None                                 | None                                |
| Icon             | `shared/components/icon/icon.ts`                           | FontAwesome wrapper with RTL flip    | `icon: string`                       | None                                |
| ThemeToggle      | `shared/components/theme-toggle/theme-toggle.ts`           | Light/Dark theme toggle              | None (reads from ThemeService)       | None (writes to ThemeService)       |
| LanguageSwitcher | `shared/components/language-switcher/language-switcher.ts` | EN/AR language toggle                | None (reads from TranslationService) | None (writes to TranslationService) |

## Core Services

| Service             | Path                                     | Purpose                                                                    |
| ------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| AuthService         | `core/services/auth.service.ts`          | JWT auth: login, refresh (shared), logout, user signal, token storage      |
| SchoolService       | `core/services/school.service.ts`        | School context from URL, isSuperAdmin, platform school fetch               |
| PermissionService   | `core/services/permission.service.ts`    | Permission/role checks with super-admin bypass                             |
| NotificationService | `core/services/notification.service.ts`  | Notification CRUD, unread count, mark read, send                           |
| ThemeService        | `core/services/theme.service.ts`         | Theme management: signal-based, localStorage, OS preference, `.dark` class |
| TranslationService  | `core/services/translation.service.ts`   | i18n + RTL: signal-based, localStorage, document.dir/lang                  |
| GlobalErrorHandler  | `core/services/error-handler.service.ts` | Catches unhandled errors, gates console behind `!production`               |

### ThemeService API

```typescript
// Types
type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

// Signals (read in templates)
theme: Signal<Theme>                    // Current user preference
resolvedTheme: Signal<ResolvedTheme>    // Resolved actual theme
osDark: Signal<boolean>                 // OS dark mode preference

// Methods
setTheme(theme: Theme): void            // Set and persist theme
```

### TranslationService API

```typescript
// Types
type AppLanguage = 'en' | 'ar';

// Signals (read in templates)
currentLang: Signal<AppLanguage>        // Current language
direction: Signal<Direction>            // 'ltr' or 'rtl'

// Properties
availableLanguages: readonly AppLanguage[]  // ['en', 'ar']

// Methods
init(): void                            // Call once at app startup
switchLanguage(lang: AppLanguage): void  // Change language
```

## Interceptors

| Name             | Path                                     | Type                | Purpose                                                       |
| ---------------- | ---------------------------------------- | ------------------- | ------------------------------------------------------------- |
| apiInterceptor   | `core/interceptors/api.interceptor.ts`   | `HttpInterceptorFn` | Rewrites `/api/*` URLs, attaches Bearer + X-School-Id headers |
| errorInterceptor | `core/interceptors/error.interceptor.ts` | `HttpInterceptorFn` | 401→refresh→retry, clear session on failure, re-throws errors |

**Registration order** in `app.config.ts`: `withInterceptors([apiInterceptor, errorInterceptor])`

## Guards

| Name      | Path                        | Type            | Purpose                                                   |
| --------- | --------------------------- | --------------- | --------------------------------------------------------- |
| authGuard | `core/guards/auth.guard.ts` | `CanActivateFn` | Placeholder — always returns false, redirects to `/login` |

## Models & Interfaces

All IDs are UUIDs (strings). All dates are ISO date strings.

| Model             | Path                          | Key types                                                                            |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| `auth.ts`         | `core/models/auth.ts`         | `LoginRequest`, `LoginResponse`, `AuthUser`, `UserProfile`, `mapProfileToAuthUser()` |
| `api.ts`          | `core/models/api.ts`          | `ApiResponse<T>`, `PaginatedResponse<T>`, `ApiErrorResponse`                         |
| `notification.ts` | `core/models/notification.ts` | `Notification`, `SendNotificationRequest`, `UnreadCountResponse`                     |
| `school.ts`       | `core/models/school.ts`       | `School`                                                                             |
| `user.ts`         | `core/models/user.ts`         | `User`                                                                               |

## i18n

### Translation Files

| File    | Path                         |
| ------- | ---------------------------- |
| English | `public/assets/i18n/en.json` |
| Arabic  | `public/assets/i18n/ar.json` |

### Key Structure

```
SECTION.KEY format:
  COMMON.APP_NAME, COMMON.SAVE, COMMON.CANCEL, COMMON.DELETE, ...
  AUTH.LOGIN, AUTH.LOGOUT, AUTH.EMAIL, AUTH.PASSWORD, ...
  NAV.HOME, NAV.ABOUT, NAV.SETTINGS, NAV.PROFILE
  VALIDATION.REQUIRED, VALIDATION.MIN_LENGTH, VALIDATION.MAX_LENGTH, VALIDATION.INVALID_EMAIL
```

### Usage in Templates

```html
<!-- Pipe (for inline text) -->
{{ 'AUTH.LOGIN' | translate }}

<!-- Directive (for element content) -->
<span [translate]="'NAV.HOME'"></span>

<!-- With interpolation -->
{{ 'AUTH.WELCOME' | translate:{ name: userName } }}
```

### Adding New Keys

Add to both `en.json` and `ar.json` using `SECTION.KEY` format.

## Testing Conventions

| Convention     | Pattern                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------- |
| Framework      | Vitest 4 with Angular TestBed                                                                  |
| Mocking        | `vi.spyOn()`, `vi.fn()`, `vi.mockImplementation()`                                             |
| Signal effects | `TestBed.flushEffects()`                                                                       |
| HTTP testing   | `provideHttpClientTesting()` + `HttpTestingController` + `httpTesting.verify()` in `afterEach` |
| Setup          | `beforeEach`: clear localStorage, reset document state, mock `window.matchMedia`               |
| Cleanup        | `afterEach`: restore mocks, clear localStorage, verify HTTP                                    |
| Coverage       | 80% thresholds (statements, branches, functions, lines)                                        |
| File naming    | `foo.spec.ts` alongside `foo.ts`                                                               |

### Test File Template

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('MyService', () => {
  let service: MyService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## Environment & Build

### Scripts

| Command                 | Purpose                              |
| ----------------------- | ------------------------------------ |
| `npm start`             | Dev server → http://localhost:4200   |
| `npm test`              | Vitest unit tests                    |
| `npm run test:coverage` | V8 coverage (80% thresholds)         |
| `npm run build`         | Production build                     |
| `npm run lint`          | ESLint                               |
| `npm run lint:fix`      | ESLint auto-fix                      |
| `npm run format`        | Prettier                             |
| `npm run e2e`           | Playwright (Chrome, Firefox, WebKit) |

### Environment Variables

| Variable   | Dev                         | Production | Staging                               |
| ---------- | --------------------------- | ---------- | ------------------------------------- |
| production | false                       | true       | true                                  |
| apiUrl     | `http://localhost:3000/api` | `/api`     | `https://staging-api.example.com/api` |

### Build Verification

After any code change, always run:

```bash
npm run build && npm test
```

Run `npm run lint` if you touched `.ts` or `.html` files.

## Naming Conventions

| Category            | Pattern                           | Example                                                        |
| ------------------- | --------------------------------- | -------------------------------------------------------------- |
| Files               | kebab-case, **no suffix**         | `theme-toggle.ts`, not `theme-toggle.component.ts`             |
| Spec files          | Same name + `.spec`               | `theme-toggle.spec.ts`                                         |
| Component selectors | `app-` prefix                     | `app-theme-toggle`                                             |
| Services            | `*.service.ts`                    | `theme.service.ts`                                             |
| Interceptors        | `*.interceptor.ts`                | `api.interceptor.ts`                                           |
| Guards              | `*.guard.ts`                      | `auth.guard.ts`                                                |
| Feature folders     | Under `features/`                 | `features/dashboard/`                                          |
| Component folders   | Under `shared/components/`        | `shared/components/theme-toggle/`                              |
| Interfaces/Models   | Under `core/models/`              | `core/models/student.ts` (not yet created)                     |
| Path aliases        | Always for cross-boundary imports | `import { ThemeService } from '@core/services/theme.service';` |

## Feature Modules (Existing)

| Feature        | Path                       | Status     | Key components                         |
| -------------- | -------------------------- | ---------- | -------------------------------------- |
| Auth (Login)   | `features/auth/login/`     | Complete   | Login form, validation, error display  |
| School Picker  | `features/school-picker/`  | Complete   | Multi-school/super-admin school picker |
| Dashboard      | `features/dashboard/`      | Scaffolded | Route exists, component ready          |
| Users          | `features/users/`          | Scaffolded | List, form, detail routes              |
| Students       | `features/students/`       | Scaffolded | List, form, detail routes              |
| Teachers       | `features/teachers/`       | Scaffolded | List, form, detail routes              |
| Class Sections | `features/class-sections/` | Scaffolded | List, form, detail routes              |
| Subjects       | `features/subjects/`       | Scaffolded | List, form, detail routes              |
| Timetable      | `features/timetable/`      | Scaffolded | Single page route                      |
| Attendance     | `features/attendance/`     | Scaffolded | Single page route                      |
| Grading Scales | `features/grading-scales/` | Scaffolded | List, form, detail routes              |
| Exams          | `features/exams/`          | Scaffolded | List, form, detail routes              |
| Grade Entry    | `features/grade-entry/`    | Scaffolded | Single page route                      |
| Report Cards   | `features/report-cards/`   | Scaffolded | List, detail routes                    |
| Fee Structures | `features/fee-structures/` | Scaffolded | List, form, detail routes              |
| Fee Invoices   | `features/fee-invoices/`   | Scaffolded | List, form, detail routes              |
| Notifications  | `features/notifications/`  | Scaffolded | List, send routes                      |
| Parent Portal  | `features/parent-portal/`  | Scaffolded | Child grades, attendance, etc.         |
| Roles          | `features/roles/`          | Scaffolded | List, form, detail routes              |

**Auth & Layout module complete.** Core infrastructure and routing established. Feature pages scaffolded with lazy-loaded routes.

---

## Gaps (Backend Features Without Frontend Implementation)

Cross-referenced with `docs/backend-reference.md`:

### Authentication (Partially Complete)

- [x] Login page (POST /auth/login)
- [x] Auth service (token storage, refresh, logout)
- [x] Permission system (guards, service, super-admin bypass)
- [ ] Forgot/reset password flow
- [ ] Profile update page (PATCH /auth/me — change password/phone)

### Academic Structure

- [ ] Academic year management
- [ ] Term management
- [ ] Department management

### People Management

- [ ] Guardian CRUD + student-guardian linking
- [ ] Enrollment management + bulk promotion

### Scheduling

- [ ] Period set / working day / period configuration
- [ ] Time slot generation
- [ ] Room management
- [ ] Lesson CRUD + bulk create + auto-generate
- [ ] Substitution management

### Daily Operations

- [ ] Teacher attendance
- [ ] Teacher availability
- [ ] Teacher leave management (request, approve, reject)

### Finance

- [ ] Fee category management
- [ ] Fee discount management
- [ ] Fee payment recording
- [ ] Financial reports (outstanding, collection, balances, breakdown)

### Communication

- [ ] Announcement management (draft, publish, target)
- [ ] Academic calendar / events

### Platform & Admin

- [ ] Platform admin (school management, super admin dashboard)
- [ ] Audit log viewer

### Self-Service Portals

- [ ] Teacher portal (my classes, timetable, leaves, substitutions)
- [ ] Student portal (my grades, attendance, report cards, invoices)
