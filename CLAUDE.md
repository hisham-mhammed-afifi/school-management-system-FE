# CLAUDE.md

## Commands

```bash
npm start              # Dev server → http://localhost:4200
npm test               # Vitest unit tests
npm run test:coverage  # V8 coverage (80% thresholds)
npm run build          # Production build
npm run lint           # ESLint
npm run lint:fix       # ESLint auto-fix
npm run format         # Prettier
npm run e2e            # Playwright (Chrome, Firefox, WebKit)
```

After any code change, always run `npm run build` and `npm test` to verify. Run `npm run lint` if you touched `.ts` or `.html` files.

## Architecture

```
src/app/
├── core/          # Singletons: services, guards, interceptors — one instance app-wide
├── shared/        # Reusable components, directives, pipes — used across features
└── features/      # (future) Lazy-loaded feature modules
```

Path aliases — **always use them, never relative imports across boundaries**:

```
@core/*   → src/app/core/*
@shared/* → src/app/shared/*
@app/*    → src/app/*
@env      → src/environments/environment
```

## Principles

### Use Angular CDK Before Rolling Your Own

Angular CDK (`@angular/cdk`) is already installed. Before building custom behavior, check if CDK has it:

- **Overlay/popups** → `@angular/cdk/overlay` (not custom absolute positioning)
- **Drag & drop** → `@angular/cdk/drag-drop`
- **Virtual scroll** → `@angular/cdk/scrolling`
- **Focus trap / a11y** → `@angular/cdk/a11y` (FocusTrap, LiveAnnouncer, FocusMonitor)
- **Clipboard** → `@angular/cdk/clipboard`
- **Layout breakpoints** → `@angular/cdk/layout` (BreakpointObserver)
- **Bidi/RTL** → `@angular/cdk/bidi` (Dir directive — already used on root wrapper)
- **Stepper logic** → `@angular/cdk/stepper`
- **Table logic** → `@angular/cdk/table`
- **Text field auto-resize** → `@angular/cdk/text-field`

CDK gives you unstyled, accessible, tested primitives. Always prefer it over custom DOM manipulation, manual event listeners, or third-party libraries for things CDK already handles.

### Modern Angular Only

- **Standalone components only** — no NgModules, ever
- **`inject()` function** — never constructor injection
- **Signals for state** — `signal()`, `computed()`, `effect()` — not RxJS `BehaviorSubject`/`Subject` for component state
- **`@for` / `@if` / `@switch`** — never `*ngFor`, `*ngIf`, `ngSwitch`
- **Functional interceptors** — `HttpInterceptorFn`, not class-based `HttpInterceptor`
- **Functional guards** — `CanActivateFn`, not class-based `CanActivate`
- **Lazy loading** — `loadComponent()` with dynamic imports in routes
- **`DestroyRef`** for cleanup — not `OnDestroy` lifecycle hook
- **No filename suffixes** — `theme-toggle.ts` not `theme-toggle.component.ts`

### Styling Rules

- **Semantic tokens only** — use `bg-bg-primary`, `text-text-secondary`, `border-border`, `bg-accent`, `bg-danger`, `text-success-text`, etc.
- **Never hardcode Tailwind colors** — no `text-red-500`, `bg-gray-300`, `bg-green-100`. If a semantic token doesn't exist for your use case, add one to `:root` / `.dark` in `styles.css` and register it in `@theme`
- **Every UI must work in dark mode** — test with all three themes (light, system, dark)
- **`border-0` not `border-none`** when you need conditional borders (e.g., `not-first:border-s`) — `border-none` sets `border-style: none` which kills ALL borders
- **Transitions on specific elements** — use Tailwind's `transition-colors` per element, never apply `transition` to `*`
- **Shadows need dark variants** — use `shadow-card` (our semantic shadow), not `shadow-sm` (invisible in dark mode)

### RTL / Internationalization

- **Every layout must work in RTL** — switch to Arabic and verify
- **Logical CSS properties only** — `ps-5` not `pl-5`, `pe-3` not `pr-3`, `ms-2` not `ml-2`, `inset-inline-start` not `left`
- **No `left: -9999px`** for hiding elements — use `clip-path: inset(50%)` (the `left` technique causes horizontal scroll in RTL)
- **Email/URL inputs** get `dir="ltr"` — their content is always LTR regardless of page direction
- **Translation keys**: `SECTION.KEY` format (`AUTH.LOGIN`, `VALIDATION.REQUIRED`). Add keys to both `public/assets/i18n/en.json` and `ar.json`
- **`<router-outlet>`** must be inside the `[dir]` wrapper — otherwise routed content won't inherit direction

### Accessibility

- **Semantic HTML first** — `<nav>`, `<header>`, `<main>`, `<section>`, `<button>` (not `<div>` with click handlers)
- **Every interactive element needs keyboard support** — focusable, operable with Enter/Space
- **ARIA when HTML isn't enough** — `role`, `aria-label`, `aria-describedby`, `aria-checked`
- **Form inputs need labels** — `<label for="id">` with matching `id` on the input, or `sr-only` label for icon-only inputs
- **Never use `[innerHTML]`** — XSS risk. Use text interpolation `{{ }}` or sanitize explicitly. For icons, use Unicode characters or an icon library
- **Focus indicators** — global `*:focus-visible` is set. Don't add `outline-none` unless you provide an alternative visible indicator (e.g., `focus:border-accent focus:outline-none`)
- **Use CDK a11y** — `FocusTrap` for modals, `LiveAnnouncer` for screen reader announcements, `FocusMonitor` for focus origin tracking

### Testing

- **Every file gets a spec** — if you create `foo.ts`, create `foo.spec.ts`
- **Vitest + Angular TestBed** — `vi.spyOn()`, `vi.fn()`, `TestBed.flushEffects()`
- **HTTP tests** — `provideHttpClientTesting()` + `HttpTestingController`, always call `httpTesting.verify()` in `afterEach`
- **Test behavior, not implementation** — assert what the user sees or what the API receives, not internal signal values
- **Coverage thresholds are 80%** — don't drop below

### Production Safety

- **No `console.log`** — use `console.error` or `console.warn` only, and gate even those behind `!environment.production`
- **Environment config** — API URLs, feature flags, and secrets go in `src/environments/`, never hardcoded
- **Error handling** — HTTP errors are caught by `error.interceptor.ts` (401→login, 403→forbidden). Unhandled errors go to `GlobalErrorHandler`. Don't swallow errors silently

### Code Organization

- **Core vs Shared** — if it's a singleton service/interceptor/guard, it goes in `core/`. If it's a reusable UI component/directive/pipe, it goes in `shared/`
- **Feature modules** — each route/feature gets its own folder under `features/`, lazy-loaded via `loadComponent()`
- **Keep components small** — if a template exceeds ~80 lines, extract child components
- **Colocation** — component, spec, and styles live in the same folder

## Don'ts

- Don't use `NgModule`, `*ngFor`, `*ngIf`, `ngSwitch`, constructor injection
- Don't use `BehaviorSubject`/`Subject` for UI state — use signals
- Don't use hardcoded colors — always semantic tokens
- Don't use `[innerHTML]` — XSS vector
- Don't use `left`/`right`/`padding-left`/`margin-right` — use logical properties
- Don't use `border-none` when combining with conditional borders
- Don't use `left: -9999px` to hide elements
- Don't apply transitions to `*` or `*::before`/`*::after`
- Don't skip writing tests for new code
- Don't use relative imports across module boundaries — use path aliases
- Don't put `console.log` in production code
- Don't build custom solutions for things Angular CDK already provides
