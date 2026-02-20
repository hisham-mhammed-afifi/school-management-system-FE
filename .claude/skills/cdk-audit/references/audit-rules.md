# CDK Audit Rules

Detection patterns for identifying custom code that should use CDK, and anti-patterns in existing CDK usage.

## Detection Rules: Custom Code That Should Use CDK

### RULE-A11Y-001: Custom Focus Trap

**Detect**: Manual Tab key trapping via keydown listeners that cycle focus.

```
grep -rn "keydown.*Tab\|event\.key.*Tab\|keyCode.*9" --include="*.ts"
```

**Replace with**: `cdkTrapFocus` directive.
**Severity**: Critical. Manual focus traps almost always have edge cases (new DOM elements, shadow DOM, dynamically added content).

### RULE-A11Y-002: Missing Focus Trap in Dialog

**Detect**: Any component with `role="dialog"` or modal behavior that does NOT import `A11yModule` or use `cdkTrapFocus`.

```bash
# Find dialog-like components
grep -rn 'role="dialog"\|\.modal\|\.dialog' --include="*.html" -l
# Cross-reference with CDK usage
for f in $(grep -rn 'role="dialog"\|\.modal\|\.dialog' --include="*.html" -l); do
  dir=$(dirname "$f")
  ts="$dir/$(basename "$f" .html).ts"
  if [ -f "$ts" ] && ! grep -q "cdkTrapFocus\|CdkTrapFocus\|FocusTrap\|DialogModule\|CdkDialogContainer" "$ts"; then
    echo "MISSING FOCUS TRAP: $f"
  fi
done
```

**Severity**: Critical. WCAG 2.4.3 Focus Order violation.

### RULE-A11Y-003: Custom Keyboard Navigation for Lists

**Detect**: Manual ArrowUp/ArrowDown/Home/End key handling in list-like components.

```
grep -rn "ArrowUp\|ArrowDown\|ArrowLeft\|ArrowRight\|Home\|End" --include="*.ts" | grep -v "node_modules\|\.spec\."
```

**Replace with**: `FocusKeyManager` or `ActiveDescendantKeyManager` for custom lists; `CdkListbox` for selection lists; `CdkMenu` for menus.
**Severity**: High. Manual implementations typically miss edge cases like wrap-around, disabled items, typeahead, and RTL support.

### RULE-A11Y-004: Missing Screen Reader Announcements

**Detect**: Dynamic content changes (toasts, snackbars, form errors, status updates) without `LiveAnnouncer` or `aria-live`.

```bash
# Look for toast/notification services that don't announce
grep -rn "toast\|snackbar\|notification\|alert" --include="*.ts" -l | while read f; do
  if ! grep -q "LiveAnnouncer\|aria-live" "$f"; then
    echo "MISSING ANNOUNCEMENT: $f"
  fi
done
```

**Severity**: Critical. Screen reader users won't know about important state changes.

### RULE-A11Y-005: Raw :focus Styling

**Detect**: CSS `:focus` selectors without CDK focus-origin classes.

```
grep -rn ":focus\b" --include="*.scss" --include="*.css" | grep -v "cdk-focused\|focus-visible\|focus-within"
```

**Replace with**: `FocusMonitor` with `.cdk-keyboard-focused` for keyboard-only focus rings.
**Severity**: Medium. Mouse users see distracting focus rings, keyboard users might see inadequate ones.

### RULE-OVERLAY-001: Custom Positioning System

**Detect**: Manual absolute/fixed positioning with JavaScript for floating UI.

```
grep -rn "position.*absolute\|position.*fixed" --include="*.ts" | grep -i "top\|left\|right\|bottom\|transform.*translate"
grep -rn "getBoundingClientRect\(\)" --include="*.ts" | grep -v "node_modules"
```

**Replace with**: CDK `Overlay` with `FlexibleConnectedPositionStrategy` or `GlobalPositionStrategy`.
**Severity**: High. Custom positioning misses viewport boundaries, scroll handling, RTL, resize.

### RULE-OVERLAY-002: Custom Backdrop

**Detect**: Manual backdrop div creation for modals.

```
grep -rn "backdrop\|overlay-bg\|modal-bg" --include="*.html" --include="*.scss" | grep -v "cdk-overlay"
```

**Replace with**: `OverlayConfig.hasBackdrop` and `OverlayConfig.backdropClass`.
**Severity**: Medium.

### RULE-DRAG-001: Custom Drag Implementation

**Detect**: Manual mousedown/mousemove/mouseup or touchstart/touchmove/touchend chains.

```
grep -rn "mousedown.*mousemove\|touchstart.*touchmove\|fromEvent.*mousedown" --include="*.ts"
grep -rn "cdkDrag" --include="*.html" -c  # compare with manual implementations
```

**Replace with**: `CdkDrag`, `CdkDropList`, etc.
**Severity**: High. Manual drag misses touch support, accessibility, auto-scroll, animation, and edge cases.

### RULE-DRAG-002: HTML5 Native Drag Without CDK

**Detect**: Native HTML5 draggable API usage.

```
grep -rn 'draggable="true"\|dragstart\|dragend\|dragover\|ondrop' --include="*.html" --include="*.ts"
```

**Replace with**: CDK `CdkDrag` which provides consistent behavior across browsers, touch support, and better UX.
**Severity**: Medium.

### RULE-SCROLL-001: Custom Virtual Scroll

**Detect**: Custom infinite scroll or virtualization logic.

```
grep -rn "IntersectionObserver\|infinite.scroll\|virtual.scroll\|scrollHeight.*clientHeight" --include="*.ts" | grep -v "node_modules"
```

**Replace with**: `CdkVirtualScrollViewport` with `*cdkVirtualFor`.
**Severity**: High. CDK virtual scroll is well-tested and handles edge cases.

### RULE-SCROLL-002: Manual Scroll Listeners

**Detect**: Direct scroll event listeners on elements.

```
grep -rn "addEventListener.*scroll\|fromEvent.*scroll\|HostListener.*scroll\|scroll.*subscribe" --include="*.ts" | grep -v "node_modules"
```

**Replace with**: `cdkScrollable` directive + `ScrollDispatcher` service.
**Severity**: Medium. ScrollDispatcher debounces and centralizes scroll handling.

### RULE-SCROLL-003: Manual Window Resize Handling

**Detect**: Direct window resize listeners.

```
grep -rn "addEventListener.*resize\|fromEvent.*resize\|window\.innerWidth\|window\.innerHeight" --include="*.ts" | grep -v "node_modules"
```

**Replace with**: `ViewportRuler` service from `@angular/cdk/scrolling`.
**Severity**: Medium.

### RULE-LAYOUT-001: Manual Media Queries in TypeScript

**Detect**: `window.matchMedia` calls in component code.

```
grep -rn "matchMedia\|window\.innerWidth\|screen\.width" --include="*.ts" | grep -v "node_modules"
```

**Replace with**: `BreakpointObserver.observe()`.
**Severity**: Medium. BreakpointObserver is reactive and testable.

### RULE-CLIP-001: Custom Clipboard

**Detect**: Manual clipboard API usage.

```
grep -rn "navigator\.clipboard\|execCommand.*copy\|document\.execCommand" --include="*.ts"
```

**Replace with**: `Clipboard` service or `CdkCopyToClipboard` directive.
**Severity**: Low. CDK clipboard handles fallbacks for older browsers.

### RULE-PLATFORM-001: Custom Browser Detection

**Detect**: Manual user agent sniffing or feature detection.

```
grep -rn "navigator\.userAgent\|navigator\.platform\|window\.chrome\|window\.safari" --include="*.ts"
```

**Replace with**: `Platform` service.
**Severity**: Low.

### RULE-TEXT-001: Custom Textarea Autosize

**Detect**: Manual textarea height adjustment.

```
grep -rn "scrollHeight.*textarea\|textarea.*style\.height\|autosize.*textarea\|auto-resize" --include="*.ts" --include="*.html"
```

**Replace with**: `cdkTextareaAutosize` directive.
**Severity**: Medium.

### RULE-OBSERVE-001: Custom MutationObserver

**Detect**: Manual MutationObserver setup.

```
grep -rn "MutationObserver\|new MutationObserver" --include="*.ts" | grep -v "node_modules"
```

**Replace with**: `cdkObserveContent` directive or `ContentObserver` service.
**Severity**: Low. CDK handles setup/teardown and debouncing.

### RULE-TABLE-001: Missing DataSource Pattern

**Detect**: CdkTable or MatTable bound directly to arrays.

```
grep -rn "\[dataSource\]=\"\w\+$\|dataSource.*=.*\[\]" --include="*.html" --include="*.ts"
```

**Replace with**: `DataSource` class that handles connect/disconnect lifecycle.
**Severity**: Medium for simple tables, High for tables with async data, sorting, pagination.

### RULE-BIDI-001: Hardcoded LTR Assumptions

**Detect**: Hardcoded left/right positioning without RTL consideration.

```
grep -rn "margin-left\|padding-left\|margin-right\|padding-right\|text-align.*left\|text-align.*right\|float.*left\|float.*right" --include="*.scss" | grep -v "node_modules\|margin-left.*margin-right\|padding-left.*padding-right"
```

**Suggest**: Consider using logical properties (`margin-inline-start`) and `Directionality` service for programmatic direction checks.
**Severity**: Medium (if app supports RTL), Low (if LTR only).

### RULE-DIALOG-001: Custom Dialog Service

**Detect**: Custom modal/dialog service that manages overlay, backdrop, focus manually.

```
grep -rn "class.*DialogService\|class.*ModalService" --include="*.ts" | grep -v "node_modules"
```

**Replace with**: CDK `Dialog` service.
**Severity**: High. CDK Dialog handles focus trap, focus restore, escape key, backdrop click, stacking, and ARIA automatically.

### RULE-MENU-001: Custom Menu/Dropdown

**Detect**: Custom dropdown menu with manual keyboard navigation and outside-click handling.

```
grep -rn "dropdown\|popover\|context-menu" --include="*.ts" --include="*.html" -l | while read f; do
  if ! grep -q "cdkMenu\|CdkMenu\|CdkMenuTrigger" "$f"; then
    echo "CUSTOM MENU: $f"
  fi
done
```

**Replace with**: `CdkMenu`, `CdkMenuBar`, `CdkMenuTrigger`, `CdkContextMenuTrigger`.
**Severity**: High. Custom menus almost always fail ARIA menu keyboard spec.

---

## Anti-Patterns in Existing CDK Usage

### ANTI-OVERLAY-001: Missing Overlay Disposal

**Detect**: OverlayRef created but not disposed on component destroy.

```bash
grep -rn "overlay\.create\|this\.overlay" --include="*.ts" -l | while read f; do
  if ! grep -q "overlayRef\.dispose\|overlayRef\.detach\|ngOnDestroy\|DestroyRef" "$f"; then
    echo "LEAK: $f"
  fi
done
```

**Impact**: Memory leak, zombie overlays.

### ANTI-OVERLAY-002: Missing Scroll Strategy

**Detect**: Connected overlays without explicit scroll strategy.

```
grep -rn "cdkConnectedOverlay" --include="*.html" | grep -v "cdkConnectedOverlayScrollStrategy"
```

**Impact**: Default reposition may not be appropriate. Tooltips should close on scroll. Modals should block scroll.

### ANTI-OVERLAY-003: Missing Fallback Positions

**Detect**: Connected overlay with only one position.

```
grep -rn "cdkConnectedOverlayPositions" --include="*.html"
```

Verify each has at least 2 positions for edge cases.
**Impact**: Overlay gets clipped at viewport edges.

### ANTI-DRAG-001: Missing Data Model Update

**Detect**: `cdkDropListDropped` handler that doesn't call `moveItemInArray` or `transferArrayItem`.

```
grep -rn "cdkDropListDropped" --include="*.html" --include="*.ts"
```

**Impact**: Items snap back to original position after drop.

### ANTI-SCROLL-001: Wrong itemSize

**Detect**: `CdkVirtualScrollViewport` with `itemSize` that doesn't match actual rendered item height.
Check if `[itemSize]` value matches the CSS height of list items.
**Impact**: Scroll position jumps, items overlap or have gaps.

### ANTI-SCROLL-002: Missing cdkScrollable

**Detect**: Scrollable containers (overflow: auto/scroll) that are ancestors of CDK overlays or drag-drop but lack `cdkScrollable`.
**Impact**: Overlay reposition and drag auto-scroll don't work inside custom scroll containers.

### ANTI-A11Y-001: FocusMonitor Not Cleaned Up

**Detect**: `FocusMonitor.monitor()` called without corresponding `stopMonitoring()`.

```bash
grep -rn "focusMonitor\.monitor\|_focusMonitor\.monitor" --include="*.ts" -l | while read f; do
  if ! grep -q "stopMonitoring" "$f"; then
    echo "LEAK: $f"
  fi
done
```

**Impact**: Memory leak, stale event listeners.

### ANTI-TABLE-001: Missing trackBy on CdkTable

**Detect**: CdkTable without trackBy function.

```
grep -rn "cdk-table\|cdkTable\|CdkTable" --include="*.html" --include="*.ts" | grep -v "trackBy"
```

**Impact**: Entire table re-renders on data changes.

### ANTI-DIALOG-001: Data via Global State

**Detect**: Dialog components that access data via shared services or route params instead of `DIALOG_DATA`.
**Impact**: Tight coupling, testability issues, race conditions with multiple dialogs.

### ANTI-LISTBOX-001: Missing aria-label

**Detect**: `cdkListbox` without `aria-label` or `aria-labelledby`.

```
grep -rn "cdkListbox" --include="*.html" | grep -v "aria-label"
```

**Impact**: WCAG violation. Screen readers can't describe the listbox purpose.

### ANTI-MENU-001: Missing cdkMenuTargetAim

**Detect**: Nested menus (submenu triggers) without `cdkMenuTargetAim`.

```bash
# Find menus with submenus
grep -rn "cdkMenuTriggerFor" --include="*.html" -l | while read f; do
  if ! grep -q "cdkMenuTargetAim" "$f"; then
    echo "MISSING AIM: $f"
  fi
done
```

**Impact**: Submenus close prematurely when user moves mouse diagonally toward them.
