---
name: cdk-audit
description: Audit Angular projects for proper usage of @angular/cdk modules and identify opportunities to replace custom implementations with CDK primitives. Use this skill whenever the user mentions CDK audit, CDK review, CDK usage, CDK best practices, "are we using CDK correctly", "should we use CDK here", accessibility audit, a11y review, overlay review, custom dialog review, custom dropdown review, virtual scroll performance, drag and drop implementation, keyboard navigation, focus management, or any review of Angular UI patterns that the CDK already solves. Also trigger when a user is building custom UI behaviors (modals, dropdowns, tooltips, menus, drag-drop, focus traps, scroll tracking, clipboard, steppers, tables, trees, listboxes) that the CDK provides out of the box.
---

# CDK Audit Skill

Audit Angular 21 projects for correct and comprehensive usage of `@angular/cdk`. Identifies missed opportunities where custom code can be replaced by CDK primitives, and flags incorrect CDK usage patterns.

## Reference Files

Read the appropriate reference file BEFORE producing any audit findings for that category.

| File                               | Content                                                                       | When to Read                     |
| ---------------------------------- | ----------------------------------------------------------------------------- | -------------------------------- |
| `references/cdk-modules.md`        | Complete catalog of all 21 CDK modules with directives, services, and imports | Always read first                |
| `references/audit-rules.md`        | Detection patterns, anti-patterns, and fix recommendations per module         | When producing findings          |
| `references/migration-patterns.md` | Step-by-step patterns for replacing custom code with CDK equivalents          | When writing fix recommendations |

## Workflow

### 1. Scan the Project

Run these checks to understand current CDK usage:

```bash
# Check if @angular/cdk is installed
cat package.json | grep -E '"@angular/cdk"'

# Check CDK version alignment with Angular
cat package.json | grep -E '"@angular/(core|cdk|material)"'

# Find all CDK imports across the project
grep -r "from '@angular/cdk/" --include="*.ts" -l

# Break down by module
for module in a11y accordion bidi clipboard coercion collections dialog drag-drop layout listbox menu observers overlay platform portal scrolling stepper table text-field tree testing; do
  count=$(grep -r "from '@angular/cdk/$module'" --include="*.ts" -l 2>/dev/null | wc -l)
  if [ "$count" -gt 0 ]; then
    echo "CDK/$module: $count files"
  fi
done

# Find custom implementations that CDK could replace
echo "--- Potential CDK opportunities ---"

# Custom focus trap implementations
grep -rn "tabindex\|focus()\|addEventListener.*focus\|addEventListener.*blur\|document\.activeElement" --include="*.ts" --include="*.html" -l | head -20

# Custom scroll tracking
grep -rn "scroll.*addEventListener\|fromEvent.*scroll\|window\.scroll\|scrollTop\|scrollLeft\|IntersectionObserver" --include="*.ts" -l | head -20

# Custom overlay/modal/dialog
grep -rn "position.*fixed\|position.*absolute\|z-index.*[5-9][0-9][0-9]\|z-index.*[0-9][0-9][0-9][0-9]\|backdrop\|modal\|overlay" --include="*.ts" --include="*.html" --include="*.scss" -l | head -20

# Custom drag and drop
grep -rn "draggable\|dragstart\|dragend\|dragover\|mousedown.*mousemove\|touchstart.*touchmove" --include="*.ts" --include="*.html" -l | head -20

# Custom clipboard
grep -rn "navigator\.clipboard\|document\.execCommand.*copy\|execCommand.*copy" --include="*.ts" -l | head -20

# Custom media queries / breakpoints
grep -rn "matchMedia\|window\.innerWidth\|window\.innerHeight\|@media" --include="*.ts" --include="*.scss" -l | head -20

# Custom virtual scroll / infinite scroll
grep -rn "infinite.scroll\|virtual.scroll\|IntersectionObserver\|scrollHeight\|offsetHeight" --include="*.ts" --include="*.html" -l | head -20

# Custom keyboard navigation
grep -rn "keydown\|keyup\|keypress\|ArrowUp\|ArrowDown\|ArrowLeft\|ArrowRight\|Key\." --include="*.ts" --include="*.html" -l | head -20

# Custom text autosize
grep -rn "autosize\|auto-resize\|textarea.*height\|scrollHeight.*textarea" --include="*.ts" --include="*.html" --include="*.scss" -l | head -20

# Custom stepper/wizard
grep -rn "stepper\|wizard\|step.*next\|step.*previous\|active.*step" --include="*.ts" --include="*.html" -l | head -20

# Custom bidirectional text
grep -rn "dir=\|direction.*rtl\|direction.*ltr\|getComputedStyle.*direction" --include="*.ts" --include="*.html" -l | head -20

# ARIA attributes applied manually (could use CDK)
grep -rn "aria-live\|aria-activedescendant\|role=\"listbox\"\|role=\"menu\"\|role=\"dialog\"\|role=\"tree\"" --include="*.html" -l | head -20
```

### 2. Categorize Findings

After scanning, organize findings into these categories (by severity):

**Critical** (breaks accessibility or has bugs the CDK solves)

- Missing focus management in dialogs/modals
- Custom keyboard navigation that doesn't follow ARIA spec
- Missing live announcements for screen readers
- Missing focus traps in modal dialogs
- No bidirectional (RTL) support where needed

**High** (reinventing the wheel with inferior results)

- Custom overlay/positioning system when CDK Overlay exists
- Custom drag-and-drop when CDK DragDrop exists
- Custom virtual scroll when CDK ScrollingModule exists
- Custom dialog service when CDK Dialog exists
- Custom menu with keyboard nav when CDK Menu exists

**Medium** (missed optimization or convenience)

- Manual media query handling instead of BreakpointObserver
- Manual clipboard API instead of CdkCopyToClipboard
- Manual scroll event listeners instead of cdkScrollable/ScrollDispatcher
- Manual content mutation observation instead of cdkObserveContent
- Manual platform detection instead of Platform service
- Manual textarea autosize instead of cdkTextareaAutosize

**Low** (style/consistency improvements)

- Not using coercion utilities for @Input transforms
- Not using DataSource pattern for tables/lists
- Not using SelectionModel for multi-select state
- Not using ComponentHarness for testing

### 3. Produce the Audit Report

For each finding, provide:

1. **What**: Brief description of what was found
2. **Where**: File path(s) and line number(s)
3. **Why it matters**: Impact on a11y, perf, maintenance, or correctness
4. **CDK replacement**: Which CDK module/directive/service to use
5. **How to fix**: Concrete code diff showing the migration (read `references/migration-patterns.md`)

### 4. CDK Usage Quality Check

For CDK modules already in use, verify best practices:

**a11y module**

- FocusTrap used in all modal/dialog components
- LiveAnnouncer used for dynamic content changes
- FocusMonitor used for focus-origin styling (not raw :focus)
- ListKeyManager used for any keyboard-navigable list

**overlay module**

- Position strategy appropriate for use case (connected vs global)
- Scroll strategy explicitly set (not relying on default)
- Overlay properly disposed on component destroy
- Backdrop configured for modals
- cdkScrollable on scrollable ancestors

**drag-drop module**

- cdkDropListData bound for data model updates
- cdkDropListDropped handler calls moveItemInArray/transferArrayItem
- cdkDragHandle used for complex draggable content
- cdkScrollable on scroll containers during drag

**dialog module**

- Focus returned to trigger element on close
- Escape key closes dialog
- Backdrop click behavior configured
- Data passed via injection, not global state

**scrolling module**

- itemSize accurately reflects actual item height
- trackBy used with cdkVirtualFor
- cdkScrollable placed on all scrollable containers
- ViewportRuler used instead of window resize events

**table module**

- DataSource pattern used (not raw arrays)
- trackBy function provided
- Sticky headers/footers used via cdkHeaderRow
- Sorting and pagination handled at DataSource level

**menu module**

- cdkMenuBar for horizontal nav menus
- cdkMenu for dropdown/popup menus
- cdkContextMenuTrigger for right-click menus
- cdkMenuTargetAim for intelligent submenu tracking
- cdkMenuItemCheckbox/Radio for toggle items

**listbox module**

- cdkListbox with proper aria-label/aria-labelledby
- cdkOption values unique within listbox
- cdkListboxMultiple for multi-select
- Form control binding (ngModel or formControl)

**bidi module**

- Dir directive used at app root
- Directionality service injected (not raw DOM dir attribute)
- All overlay positions respect RTL

### 5. Summary Score

Provide a summary at the end:

```
CDK Audit Summary
=================
Modules installed: @angular/cdk@X.X.X
Angular version:   @angular/core@X.X.X

CDK Modules in Use:  X / 21
CDK Usage Quality:   X / 10

Findings:
  Critical: X
  High:     X
  Medium:   X
  Low:      X

Top 3 Quick Wins:
1. [description] - estimated effort: [low/medium/high]
2. [description] - estimated effort: [low/medium/high]
3. [description] - estimated effort: [low/medium/high]

Modules to Consider Adopting:
- [module]: [reason based on what the project is doing manually]
```

### 6. Iterative Mode

If the user wants to fix issues interactively:

1. Start with Critical findings
2. Read `references/migration-patterns.md` for the relevant module
3. Show the exact code change needed
4. Verify the fix compiles: `npx ng build --configuration=production 2>&1 | head -50`
5. Move to the next finding

When fixing, always:

- Import CDK directives/services as standalone imports (Angular 21 pattern)
- Use `inject()` function, not constructor injection
- Clean up subscriptions in `DestroyRef` or `takeUntilDestroyed()`
- Preserve existing component tests and update them to use CDK test harnesses where possible
