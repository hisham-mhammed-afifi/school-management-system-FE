# CDK Modules Catalog

Complete reference for all `@angular/cdk` entry points as of v21. Every directive is standalone and can be imported directly.

## Table of Contents

1. [a11y (Accessibility)](#a11y)
2. [accordion](#accordion)
3. [bidi (Bidirectionality)](#bidi)
4. [clipboard](#clipboard)
5. [coercion](#coercion)
6. [collections](#collections)
7. [dialog](#dialog)
8. [drag-drop](#drag-drop)
9. [layout](#layout)
10. [listbox](#listbox)
11. [menu](#menu)
12. [observers](#observers)
13. [overlay](#overlay)
14. [platform](#platform)
15. [portal](#portal)
16. [scrolling](#scrolling)
17. [stepper](#stepper)
18. [table](#table)
19. [text-field](#text-field)
20. [tree](#tree)
21. [testing (Component Harnesses)](#testing)

---

## a11y

**Import**: `import { ... } from '@angular/cdk/a11y';`

Provides tools for focus management, keyboard navigation, screen reader support, and high-contrast detection.

### Key exports

| Export                       | Type                       | Purpose                                                    |
| ---------------------------- | -------------------------- | ---------------------------------------------------------- |
| `FocusTrap`                  | Directive (`cdkTrapFocus`) | Traps Tab key focus within an element (modals, dialogs)    |
| `FocusMonitor`               | Service                    | Tracks focus origin (mouse, keyboard, touch, programmatic) |
| `LiveAnnouncer`              | Service                    | Announces messages via aria-live region for screen readers |
| `FocusKeyManager`            | Class                      | Manages focus across list items using roving tabindex      |
| `ActiveDescendantKeyManager` | Class                      | Manages active descendant for listbox/combobox patterns    |
| `InteractivityChecker`       | Service                    | Checks if element is visible, focusable, tabbable          |
| `HighContrastDetector`       | Service                    | Detects Windows High Contrast Mode                         |
| `InputModalityDetector`      | Service                    | Detects user input modality (mouse, keyboard, touch)       |
| `A11yModule`                 | Module                     | Groups all a11y directives                                 |

### CSS utilities

- `.cdk-visually-hidden` - Hides visually but remains accessible to screen readers
- `cdk-high-contrast` mixin - Targets Windows High Contrast Mode
- `.cdk-focused` / `.cdk-keyboard-focused` / `.cdk-mouse-focused` - Focus-origin styling

### Critical patterns

- FocusTrap in every dialog/modal
- LiveAnnouncer for toast notifications, dynamic list updates, form validation
- FocusMonitor for styling focus differently based on input method
- ListKeyManager for any list with arrow-key navigation

---

## accordion

**Import**: `import { CdkAccordion, CdkAccordionItem } from '@angular/cdk/accordion';`

Expandable section behavior without styling. Handles expand/collapse logic and multi-open control.

| Export             | Type      | Purpose                                                 |
| ------------------ | --------- | ------------------------------------------------------- |
| `CdkAccordion`     | Directive | Container that optionally enforces single-open behavior |
| `CdkAccordionItem` | Directive | Individual expandable item with open/close state        |

---

## bidi

**Import**: `import { BidiModule, Dir, Directionality } from '@angular/cdk/bidi';`

Layout direction (LTR/RTL) detection and management.

| Export           | Type                | Purpose                                          |
| ---------------- | ------------------- | ------------------------------------------------ |
| `Dir`            | Directive (`[dir]`) | Applies and responds to `dir` attribute changes  |
| `Directionality` | Service             | Injectable service to get current text direction |
| `BidiModule`     | Module              | Groups bidi exports                              |

### Critical patterns

- Use `Directionality` service for programmatic RTL checks, not DOM queries
- All overlay positioning must respect `Directionality` for RTL layouts
- Inject at app root with `<div dir="ltr">` or `<div dir="rtl">`

---

## clipboard

**Import**: `import { CdkCopyToClipboard, Clipboard } from '@angular/cdk/clipboard';`

System clipboard access.

| Export                         | Type                               | Purpose                                            |
| ------------------------------ | ---------------------------------- | -------------------------------------------------- |
| `CdkCopyToClipboard`           | Directive (`[cdkCopyToClipboard]`) | Copies text on click                               |
| `Clipboard`                    | Service                            | Programmatic clipboard copy (async, with fallback) |
| `CDK_COPY_TO_CLIPBOARD_CONFIG` | Token                              | Default config for copy attempts                   |

---

## coercion

**Import**: `import { coerceBooleanProperty, coerceNumberProperty, coerceArray, coerceStringArray, coerceCssPixelValue } from '@angular/cdk/coercion';`

Type coercion utilities for component `@Input` properties.

| Export                  | Purpose                                                 |
| ----------------------- | ------------------------------------------------------- |
| `coerceBooleanProperty` | Coerces value to boolean (handles empty string as true) |
| `coerceNumberProperty`  | Coerces value to number with fallback                   |
| `coerceArray`           | Wraps value in array if not already one                 |
| `coerceStringArray`     | Coerces value to string array                           |
| `coerceCssPixelValue`   | Coerces value to CSS pixel string                       |

**Note for Angular 21**: With `transform` on `input()` signals, coercion functions are used as input transforms:

```typescript
readonly disabled = input(false, { transform: booleanAttribute }); // Angular built-in
// or for CDK-style:
readonly count = input(0, { transform: numberAttribute });
```

---

## collections

**Import**: `import { SelectionModel, UniqueSelectionDispatcher, DataSource, ArrayDataSource } from '@angular/cdk/collections';`

Data collection utilities.

| Export                      | Type           | Purpose                                                   |
| --------------------------- | -------------- | --------------------------------------------------------- |
| `SelectionModel`            | Class          | Tracks single/multi selection state with change events    |
| `UniqueSelectionDispatcher` | Service        | Enforces single selection across components               |
| `DataSource`                | Abstract class | Base for connecting data to CDK table/tree/virtual scroll |
| `ArrayDataSource`           | Class          | Simple DataSource wrapping an array or Observable         |

### Critical patterns

- Use `SelectionModel` for checkbox lists, table row selection, multi-select UIs
- Use `DataSource` pattern for CDK table, CDK tree, and virtual scroll

---

## dialog

**Import**: `import { Dialog, DialogRef, DialogConfig, CdkDialogContainer, DIALOG_DATA, DEFAULT_DIALOG_CONFIG } from '@angular/cdk/dialog';`

Unstyled dialog/modal service with focus management, backdrop, and accessibility built in.

| Export                  | Type      | Purpose                                                           |
| ----------------------- | --------- | ----------------------------------------------------------------- |
| `Dialog`                | Service   | Opens dialogs programmatically                                    |
| `DialogRef`             | Class     | Reference to open dialog (close, afterClosed, etc.)               |
| `DialogConfig`          | Interface | Configuration (hasBackdrop, width, data, position strategy, etc.) |
| `CdkDialogContainer`    | Component | Default container; extendable for custom containers               |
| `DIALOG_DATA`           | Token     | Inject to access data passed to dialog                            |
| `DEFAULT_DIALOG_CONFIG` | Token     | Provide app-wide default dialog config                            |

### Built-in behavior

- Automatic focus trap (Tab stays inside dialog)
- Focus restoration to trigger element on close
- Escape key closes dialog (configurable)
- Backdrop click closes dialog (configurable)
- ARIA role="dialog" applied automatically
- Multiple dialogs stack correctly

---

## drag-drop

**Import**: `import { CdkDrag, CdkDropList, CdkDropListGroup, CdkDragHandle, CdkDragPreview, CdkDragPlaceholder, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';`

Declarative drag-and-drop with sorting, transferring, animations, and touch support.

| Export               | Type       | Purpose                                           |
| -------------------- | ---------- | ------------------------------------------------- |
| `CdkDrag`            | Directive  | Makes element draggable                           |
| `CdkDropList`        | Directive  | Drop zone that enables sorting                    |
| `CdkDropListGroup`   | Directive  | Auto-connects multiple drop lists                 |
| `CdkDragHandle`      | Directive  | Restricts drag to a handle element                |
| `CdkDragPreview`     | Directive  | Custom drag preview                               |
| `CdkDragPlaceholder` | Directive  | Custom placeholder in original position           |
| `moveItemInArray`    | Function   | Reorders items within one array                   |
| `transferArrayItem`  | Function   | Moves item between two arrays                     |
| `CdkDragDrop`        | Event type | Drop event with previousIndex, currentIndex, etc. |

### Critical patterns

- Always update data model in `cdkDropListDropped` handler
- Use `cdkDragHandle` for complex draggable items (prevents accidental drags)
- Add `cdkScrollable` to scrollable containers for auto-scroll during drag
- Set `cdkDragStartDelay` for touch devices to prevent accidental drags

---

## layout

**Import**: `import { BreakpointObserver, MediaMatcher, Breakpoints } from '@angular/cdk/layout';`

Responsive layout utilities.

| Export               | Type      | Purpose                                             |
| -------------------- | --------- | --------------------------------------------------- |
| `BreakpointObserver` | Service   | Observes media query matches reactively             |
| `MediaMatcher`       | Service   | Lower-level matchMedia wrapper                      |
| `Breakpoints`        | Constants | Predefined breakpoints (Handset, Tablet, Web, etc.) |

### Critical patterns

- Use `BreakpointObserver.observe()` instead of manual `window.matchMedia`
- Use `Breakpoints` constants instead of raw media query strings
- Results are Observable, integrates with async pipe and signals

---

## listbox

**Import**: `import { CdkListbox, CdkOption } from '@angular/cdk/listbox';`

Accessible listbox with keyboard navigation, selection, typeahead, and forms integration.

| Export       | Type      | Purpose                              |
| ------------ | --------- | ------------------------------------ |
| `CdkListbox` | Directive | Container with ARIA role="listbox"   |
| `CdkOption`  | Directive | Individual option with value binding |

### Features (automatic)

- Arrow key navigation (wrapping by default)
- Typeahead search
- Single or multi-select (`cdkListboxMultiple`)
- Roving tabindex or aria-activedescendant strategies
- Forms integration (ngModel, formControl)
- Disabled state for individual options and entire listbox

### Critical patterns

- Always provide `aria-label` or `aria-labelledby` on `cdkListbox`
- Use `cdkListboxCompareWith` for complex object values
- Use `cdkOptionTypeaheadLabel` when display text differs from search text

---

## menu

**Import**: `import { CdkMenuBar, CdkMenu, CdkMenuItem, CdkMenuTrigger, CdkContextMenuTrigger, CdkMenuItemCheckbox, CdkMenuItemRadio, CdkMenuGroup, CdkMenuTargetAim } from '@angular/cdk/menu';`

Accessible menus with full keyboard navigation, ARIA roles, submenus, and intelligent aim tracking.

| Export                  | Type                                     | Purpose                                   |
| ----------------------- | ---------------------------------------- | ----------------------------------------- |
| `CdkMenuBar`            | Directive                                | Horizontal menu bar (ARIA role="menubar") |
| `CdkMenu`               | Directive                                | Popup/dropdown menu (ARIA role="menu")    |
| `CdkMenuItem`           | Directive                                | Menu item with keyboard/click handling    |
| `CdkMenuTrigger`        | Directive (`[cdkMenuTriggerFor]`)        | Opens associated menu                     |
| `CdkContextMenuTrigger` | Directive (`[cdkContextMenuTriggerFor]`) | Right-click menu                          |
| `CdkMenuItemCheckbox`   | Directive                                | Toggleable menu item                      |
| `CdkMenuItemRadio`      | Directive                                | Radio-group menu item                     |
| `CdkMenuGroup`          | Directive                                | Groups radio items                        |
| `CdkMenuTargetAim`      | Directive                                | Intelligent submenu aim tracking          |

### Built-in behavior

- Full ARIA menubar/menu keyboard spec (arrows, Enter, Space, Escape, Home, End)
- Focus management between menu bar and submenus
- Automatic close on outside click
- Submenu cascade with intelligent aim prediction

---

## observers

**Import**: `import { CdkObserveContent } from '@angular/cdk/observers';`

DOM mutation observation.

| Export              | Type                              | Purpose                           |
| ------------------- | --------------------------------- | --------------------------------- |
| `CdkObserveContent` | Directive (`(cdkObserveContent)`) | Fires event on content mutation   |
| `ContentObserver`   | Service                           | Programmatic mutation observation |

---

## overlay

**Import**: `import { Overlay, OverlayModule, CdkConnectedOverlay, CdkOverlayOrigin, OverlayConfig, OverlayRef, ConnectedPosition, ScrollStrategy } from '@angular/cdk/overlay';`

Floating panel system for tooltips, dropdowns, dialogs, popovers. The foundation for all floating UI.

| Export                | Type      | Purpose                                                     |
| --------------------- | --------- | ----------------------------------------------------------- |
| `Overlay`             | Service   | Creates overlay instances programmatically                  |
| `CdkConnectedOverlay` | Directive | Declarative overlay connected to origin element             |
| `CdkOverlayOrigin`    | Directive | Marks the origin element for connected overlay              |
| `OverlayConfig`       | Class     | Width, height, position strategy, scroll strategy, backdrop |
| `OverlayRef`          | Class     | Reference to created overlay (attach, detach, dispose)      |

### Position Strategies

- `GlobalPositionStrategy` - Fixed position relative to viewport (dialogs, toasts)
- `FlexibleConnectedPositionStrategy` - Connected to origin element with fallbacks (dropdowns, tooltips)

### Scroll Strategies

- `RepositionScrollStrategy` - Repositions overlay on scroll (default for connected)
- `BlockScrollStrategy` - Prevents page scrolling (modals)
- `CloseScrollStrategy` - Closes overlay on scroll (tooltips)
- `NoopScrollStrategy` - Does nothing

### Critical patterns

- Always dispose OverlayRef in ngOnDestroy / DestroyRef
- Set scroll strategy explicitly based on use case
- Provide fallback positions for FlexibleConnectedPositionStrategy
- Import CDK overlay CSS: `@import '@angular/cdk/overlay-prebuilt.css';`
- Add `cdkScrollable` on scrollable ancestors for reposition/close strategies

---

## platform

**Import**: `import { Platform } from '@angular/cdk/platform';`

Browser/OS/rendering engine detection.

| Export                          | Type     | Purpose                                                                                    |
| ------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `Platform`                      | Service  | Properties: `isBrowser`, `EDGE`, `TRIDENT`, `BLINK`, `WEBKIT`, `IOS`, `FIREFOX`, `ANDROID` |
| `getSupportedInputTypes`        | Function | Returns supported HTML input types                                                         |
| `supportsPassiveEventListeners` | Function | Checks passive event listener support                                                      |
| `supportsScrollBehavior`        | Function | Checks native smooth scroll support                                                        |
| `getRtlScrollAxisType`          | Function | Returns RTL scroll behavior type                                                           |

---

## portal

**Import**: `import { CdkPortal, CdkPortalOutlet, ComponentPortal, TemplatePortal, DomPortal, PortalModule } from '@angular/cdk/portal';`

Dynamic content rendering into arbitrary DOM locations.

| Export            | Type      | Purpose                             |
| ----------------- | --------- | ----------------------------------- |
| `CdkPortal`       | Directive | Marks ng-template as a portal       |
| `CdkPortalOutlet` | Directive | Outlet where portals render         |
| `ComponentPortal` | Class     | Portal from a component type        |
| `TemplatePortal`  | Class     | Portal from a TemplateRef           |
| `DomPortal`       | Class     | Portal from an existing DOM element |

### Use cases

- Rendering content outside component hierarchy (overlay, sidebar, header)
- Dynamic component loading without ViewContainerRef boilerplate

---

## scrolling

**Import**: `import { CdkScrollable, ScrollDispatcher, CdkVirtualScrollViewport, CdkVirtualForOf, CdkFixedSizeVirtualScroll, ViewportRuler } from '@angular/cdk/scrolling';`

Scroll tracking and virtual scrolling for performance.

| Export                      | Type                          | Purpose                                                         |
| --------------------------- | ----------------------------- | --------------------------------------------------------------- |
| `CdkScrollable`             | Directive (`[cdkScrollable]`) | Registers scrollable element with dispatcher                    |
| `ScrollDispatcher`          | Service                       | Centralized scroll event stream                                 |
| `CdkVirtualScrollViewport`  | Component                     | Virtual scroll container                                        |
| `CdkVirtualForOf`           | Directive (`*cdkVirtualFor`)  | Virtual iteration (replaces \*ngFor for large lists)            |
| `CdkFixedSizeVirtualScroll` | Directive                     | Fixed-size item strategy                                        |
| `ViewportRuler`             | Service                       | Viewport size/scroll changes (replaces window resize listeners) |

### Critical patterns

- Use virtual scroll for lists > 100 items
- Set `itemSize` to match actual rendered item height
- Use `trackBy` with `*cdkVirtualFor`
- Add `cdkScrollable` to custom scroll containers (not just window)
- Use `ViewportRuler` instead of `window.addEventListener('resize', ...)`

---

## stepper

**Import**: `import { CdkStepper, CdkStep, CdkStepLabel, CdkStepHeader, CdkStepperNext, CdkStepperPrevious, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';`

Step-based wizard/workflow without styling.

| Export                   | Type      | Purpose                                       |
| ------------------------ | --------- | --------------------------------------------- |
| `CdkStepper`             | Component | Container managing step state                 |
| `CdkStep`                | Component | Individual step with optional form validation |
| `CdkStepLabel`           | Directive | Custom step label                             |
| `CdkStepperNext`         | Directive | "Next" button behavior                        |
| `CdkStepperPrevious`     | Directive | "Previous" button behavior                    |
| `STEPPER_GLOBAL_OPTIONS` | Token     | Global stepper config (linear, editable)      |

---

## table

**Import**: `import { CdkTable, CdkHeaderRow, CdkRow, CdkFooterRow, CdkColumnDef, CdkHeaderCell, CdkCell, CdkFooterCell, CdkHeaderRowDef, CdkRowDef, CdkFooterRowDef, CdkCellDef, CdkHeaderCellDef, CdkFooterCellDef, CdkTextColumn, CdkNoDataRow } from '@angular/cdk/table';`

Unstyled data table with flexible column/row definitions.

### Critical patterns

- Use `DataSource` for data (not raw arrays) when data is async or paginated
- Always provide `trackBy` function
- Use `CdkNoDataRow` for empty state
- Sticky headers/columns via `sticky` attribute on row/column defs

---

## text-field

**Import**: `import { CdkTextareaAutosize, AutofillMonitor, TextFieldModule } from '@angular/cdk/text-field';`

Text input utilities.

| Export                | Type                              | Purpose                            |
| --------------------- | --------------------------------- | ---------------------------------- |
| `CdkTextareaAutosize` | Directive (`cdkTextareaAutosize`) | Auto-grows textarea to fit content |
| `AutofillMonitor`     | Service                           | Detects browser autofill on inputs |

---

## tree

**Import**: `import { CdkTree, CdkTreeNode, CdkNestedTreeNode, CdkTreeNodeToggle, CdkTreeNodePadding, CdkTreeNodeOutlet } from '@angular/cdk/tree';`

Accessible tree view (file browser, org chart, etc.).

| Export               | Type      | Purpose                              |
| -------------------- | --------- | ------------------------------------ |
| `CdkTree`            | Component | Tree container with ARIA role="tree" |
| `CdkTreeNode`        | Directive | Tree node (flat or nested)           |
| `CdkNestedTreeNode`  | Directive | Node using nested DOM structure      |
| `CdkTreeNodeToggle`  | Directive | Expand/collapse toggle               |
| `CdkTreeNodePadding` | Directive | Indentation based on depth           |
| `CdkTreeNodeOutlet`  | Directive | Outlet for nested children           |

### Critical patterns

- Use flat tree for large datasets (better virtual scroll support)
- Provide `trackBy` for performance
- Use `DataSource` pattern for async/lazy loading of children
- Implement `TreeControl` for programmatic expand/collapse

---

## testing

**Import**: `import { TestbedHarnessEnvironment, ComponentHarness, HarnessPredicate } from '@angular/cdk/testing/testbed';`

Component test harnesses for writing resilient tests.

| Export                         | Type           | Purpose                                     |
| ------------------------------ | -------------- | ------------------------------------------- |
| `ComponentHarness`             | Abstract class | Base for creating test harnesses            |
| `HarnessPredicate`             | Class          | Filter harnesses by properties              |
| `TestbedHarnessEnvironment`    | Class          | Connects harnesses to TestBed               |
| `ProtractorHarnessEnvironment` | Class          | Connects harnesses to Protractor/Playwright |

### Why use harnesses

- Tests don't break when internal DOM structure changes
- Consistent API across unit and e2e tests
- All Angular Material components ship with harnesses
