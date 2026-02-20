# CDK Migration Patterns

Step-by-step patterns for replacing custom implementations with CDK equivalents. All patterns use Angular 21 standalone components with `inject()`.

## Pattern 1: Custom Modal/Dialog to CDK Dialog

### Before (custom)

```typescript
@Component({
  selector: 'app-modal',
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div class="modal-container" role="dialog">
      <ng-content></ng-content>
    </div>
  `,
})
export class ModalComponent {
  @Output() closed = new EventEmitter<void>();
  close() {
    this.closed.emit();
  }
}
```

### After (CDK Dialog)

```typescript
// dialog-wrapper.component.ts
import { CdkDialogContainer, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  selector: 'app-dialog-container',
  standalone: true,
  template: `<ng-content></ng-content>`,
  host: { class: 'app-dialog-container' },
})
export class AppDialogContainer extends CdkDialogContainer {}

// dialog.service.ts
import { Dialog, DialogConfig } from '@angular/cdk/dialog';

@Injectable({ providedIn: 'root' })
export class AppDialogService {
  private dialog = inject(Dialog);

  open<T, D = unknown>(
    component: ComponentType<T>,
    config?: DialogConfig<D>,
  ): DialogRef<unknown, T> {
    return this.dialog.open(component, {
      ...config,
      container: AppDialogContainer,
      hasBackdrop: true,
      backdropClass: 'app-dialog-backdrop',
    });
  }
}

// usage in a dialog content component
@Component({ standalone: true, template: `...` })
export class ConfirmDialogComponent {
  data = inject<{ message: string }>(DIALOG_DATA);
  dialogRef = inject(DialogRef);

  confirm() {
    this.dialogRef.close(true);
  }
  cancel() {
    this.dialogRef.close(false);
  }
}
```

---

## Pattern 2: Custom Dropdown to CDK Overlay

### Before (custom)

```typescript
@Component({
  template: `
    <button (click)="toggle()">Open</button>
    <div *ngIf="isOpen" class="dropdown" [style.top.px]="top" [style.left.px]="left">
      <ng-content></ng-content>
    </div>
  `,
})
export class DropdownComponent {
  isOpen = false;
  top = 0;
  left = 0;

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      const rect = this.el.nativeElement.getBoundingClientRect();
      this.top = rect.bottom;
      this.left = rect.left;
    }
  }
}
```

### After (CDK Connected Overlay)

```typescript
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';

@Component({
  standalone: true,
  imports: [CdkConnectedOverlay, CdkOverlayOrigin],
  template: `
    <button cdkOverlayOrigin #trigger="cdkOverlayOrigin" (click)="isOpen = !isOpen">Open</button>
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="trigger"
      [cdkConnectedOverlayOpen]="isOpen"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayHasBackdrop]="true"
      cdkConnectedOverlayBackdropClass="cdk-overlay-transparent-backdrop"
      (backdropClick)="isOpen = false"
      (detach)="isOpen = false"
    >
      <div class="dropdown-panel">
        <ng-content></ng-content>
      </div>
    </ng-template>
  `,
})
export class DropdownComponent {
  isOpen = false;

  positions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }, // below-left
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }, // above-left
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top' }, // below-right
  ];
}
```

---

## Pattern 3: Custom Keyboard Navigation to CDK ListKeyManager

### Before (custom)

```typescript
@HostListener('keydown', ['$event'])
onKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      this.activeIndex = Math.min(this.activeIndex + 1, this.items.length - 1);
      break;
    case 'ArrowUp':
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      break;
  }
  this.items[this.activeIndex]?.nativeElement.focus();
}
```

### After (CDK FocusKeyManager)

```typescript
import { FocusKeyManager, FocusableOption } from '@angular/cdk/a11y';

// Each list item implements FocusableOption
@Component({
  selector: 'app-list-item',
  standalone: true,
  host: { tabindex: '-1' },
  template: `<ng-content></ng-content>`,
})
export class ListItemComponent implements FocusableOption {
  private el = inject(ElementRef);
  disabled = false;

  focus() {
    this.el.nativeElement.focus();
  }
  getLabel() {
    return this.el.nativeElement.textContent?.trim() ?? '';
  }
}

// Parent list component
@Component({
  standalone: true,
  imports: [ListItemComponent],
  template: `
    <div role="listbox" (keydown)="keyManager.onKeydown($event)">
      @for (item of items; track item.id) {
        <app-list-item>{{ item.name }}</app-list-item>
      }
    </div>
  `,
})
export class ListComponent implements AfterViewInit {
  @ViewChildren(ListItemComponent) listItems!: QueryList<ListItemComponent>;
  keyManager!: FocusKeyManager<ListItemComponent>;

  ngAfterViewInit() {
    this.keyManager = new FocusKeyManager(this.listItems)
      .withWrap()
      .withHomeAndEnd()
      .withTypeAhead();
  }
}
```

---

## Pattern 4: Custom Selection List to CDK Listbox

### Before (custom)

```html
<ul>
  <li
    *ngFor="let opt of options"
    [class.selected]="isSelected(opt)"
    (click)="toggleSelection(opt)"
    (keydown.enter)="toggleSelection(opt)"
    tabindex="0"
  >
    {{ opt.label }}
  </li>
</ul>
```

### After (CDK Listbox)

```typescript
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';

@Component({
  standalone: true,
  imports: [CdkListbox, CdkOption],
  template: `
    <ul
      cdkListbox
      aria-label="Choose an option"
      [cdkListboxValue]="selectedValues"
      (cdkListboxValueChange)="onSelectionChange($event)"
    >
      @for (opt of options; track opt.value) {
        <li [cdkOption]="opt.value">{{ opt.label }}</li>
      }
    </ul>
  `,
})
export class SelectionListComponent {
  selectedValues: string[] = [];

  onSelectionChange(event: CdkListboxValueChange<string>) {
    this.selectedValues = event.value;
  }
}
```

This gives you for free: arrow key navigation, typeahead, Home/End, ARIA roles, disabled state, multi-select support, form control binding.

---

## Pattern 5: Custom Menu to CDK Menu

### Before (custom)

```html
<button (click)="menuOpen = !menuOpen">Actions</button>
<div *ngIf="menuOpen" class="menu-panel" (document:click)="menuOpen = false">
  <button (click)="edit()">Edit</button>
  <button (click)="delete()">Delete</button>
</div>
```

### After (CDK Menu)

```typescript
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';

@Component({
  standalone: true,
  imports: [CdkMenu, CdkMenuItem, CdkMenuTrigger],
  template: `
    <button [cdkMenuTriggerFor]="actionsMenu">Actions</button>

    <ng-template #actionsMenu>
      <div cdkMenu>
        <button cdkMenuItem (cdkMenuItemTriggered)="edit()">Edit</button>
        <button cdkMenuItem (cdkMenuItemTriggered)="delete()">Delete</button>
      </div>
    </ng-template>
  `,
})
```

This gives you for free: ARIA roles, keyboard nav (arrows, Enter, Space, Escape), focus management, outside click close, submenu support.

---

## Pattern 6: Custom Scroll Tracking to CDK Scrollable

### Before (custom)

```typescript
@HostListener('window:scroll', ['$event'])
onScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  this.isSticky = scrollTop > 100;
}
```

### After (CDK ScrollDispatcher)

```typescript
import { ScrollDispatcher, CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  standalone: true,
  imports: [CdkScrollable],
  template: `
    <div cdkScrollable class="scroll-container">
      <!-- content -->
    </div>
  `,
})
export class StickyHeaderComponent {
  private scrollDispatcher = inject(ScrollDispatcher);
  private destroyRef = inject(DestroyRef);

  isSticky = signal(false);

  constructor() {
    this.scrollDispatcher
      .scrolled()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const scrollTop = document.documentElement.scrollTop;
        this.isSticky.set(scrollTop > 100);
      });
  }
}
```

---

## Pattern 7: Manual Resize to ViewportRuler

### Before

```typescript
ngOnInit() {
  window.addEventListener('resize', this.onResize.bind(this));
}
ngOnDestroy() {
  window.removeEventListener('resize', this.onResize.bind(this));
}
onResize() {
  this.isMobile = window.innerWidth < 768;
}
```

### After

```typescript
import { ViewportRuler } from '@angular/cdk/scrolling';

export class ResponsiveComponent {
  private viewportRuler = inject(ViewportRuler);
  private destroyRef = inject(DestroyRef);

  isMobile = signal(false);

  constructor() {
    this.checkViewport();
    this.viewportRuler
      .change(150) // debounce 150ms
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.checkViewport());
  }

  private checkViewport() {
    const { width } = this.viewportRuler.getViewportSize();
    this.isMobile.set(width < 768);
  }
}
```

---

## Pattern 8: Custom Drag-Drop to CDK DragDrop

### Before (manual mouse events)

```typescript
isDragging = false;
startX = 0; startY = 0;

onMouseDown(e: MouseEvent) {
  this.isDragging = true;
  this.startX = e.clientX;
  this.startY = e.clientY;
}
onMouseMove(e: MouseEvent) {
  if (!this.isDragging) return;
  const dx = e.clientX - this.startX;
  const dy = e.clientY - this.startY;
  this.el.nativeElement.style.transform = `translate(${dx}px, ${dy}px)`;
}
```

### After (CDK DragDrop)

```typescript
import { CdkDrag, CdkDropList, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  standalone: true,
  imports: [CdkDrag, CdkDropList],
  template: `
    <div cdkDropList (cdkDropListDropped)="drop($event)">
      @for (item of items; track item.id) {
        <div cdkDrag>
          <div cdkDragHandle class="drag-handle">&#x2630;</div>
          {{ item.name }}
        </div>
      }
    </div>
  `,
})
export class SortableListComponent {
  items = [...];

  drop(event: CdkDragDrop<typeof this.items>) {
    moveItemInArray(this.items, event.previousIndex, event.currentIndex);
  }
}
```

---

## Pattern 9: Manual Breakpoints to BreakpointObserver

### Before

```typescript
ngOnInit() {
  this.checkBreakpoint();
  window.addEventListener('resize', () => this.checkBreakpoint());
}

checkBreakpoint() {
  if (window.innerWidth < 600) this.layout = 'mobile';
  else if (window.innerWidth < 960) this.layout = 'tablet';
  else this.layout = 'desktop';
}
```

### After

```typescript
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';

export class ResponsiveComponent {
  private breakpointObserver = inject(BreakpointObserver);

  layout = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web])
      .pipe(
        map((result) => {
          if (result.breakpoints[Breakpoints.Handset]) return 'mobile';
          if (result.breakpoints[Breakpoints.Tablet]) return 'tablet';
          return 'desktop';
        }),
      ),
    { initialValue: 'desktop' },
  );
}
```

---

## Pattern 10: Manual Clipboard to CDK Clipboard

### Before

```typescript
copyToClipboard(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
```

### After (directive)

```html
<button [cdkCopyToClipboard]="textToCopy" (cdkCopyToClipboardCopied)="onCopied($event)">
  Copy
</button>
```

### After (service)

```typescript
import { Clipboard } from '@angular/cdk/clipboard';

export class MyComponent {
  private clipboard = inject(Clipboard);

  copy(text: string) {
    const success = this.clipboard.copy(text);
    if (success) {
      /* show toast */
    }
  }
}
```

---

## Pattern 11: Focus Trap for Custom Modal

### Before

```typescript
// No focus trap at all, or manual implementation
```

### After

```typescript
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  standalone: true,
  imports: [A11yModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-content"
           cdkTrapFocus
           cdkTrapFocusAutoCapture
           (click)="$event.stopPropagation()">
        <h2 id="dialog-title">{{ title }}</h2>
        <!-- content -->
        <button (click)="close()">Close</button>
      </div>
    </div>
  `,
  host: {
    'role': 'dialog',
    'aria-modal': 'true',
    '[attr.aria-labelledby]': '"dialog-title"',
  },
})
```

---

## Pattern 12: LiveAnnouncer for Dynamic Content

### Before (no announcement)

```typescript
showNotification(message: string) {
  this.notificationMessage = message;
  this.showToast = true;
  setTimeout(() => this.showToast = false, 3000);
}
```

### After

```typescript
import { LiveAnnouncer } from '@angular/cdk/a11y';

export class NotificationService {
  private liveAnnouncer = inject(LiveAnnouncer);

  showNotification(message: string) {
    this.notificationMessage = message;
    this.showToast = true;
    this.liveAnnouncer.announce(message, 'polite');
    setTimeout(() => (this.showToast = false), 3000);
  }
}
```

---

## Pattern 13: Virtual Scroll for Long Lists

### Before (rendering all items)

```html
@for (item of items; track item.id) {
<app-card [data]="item"></app-card>
}
```

### After (CDK virtual scroll)

```typescript
import { CdkVirtualScrollViewport, CdkVirtualForOf, CdkFixedSizeVirtualScroll } from '@angular/cdk/scrolling';

@Component({
  standalone: true,
  imports: [CdkVirtualScrollViewport, CdkVirtualForOf, CdkFixedSizeVirtualScroll],
  template: `
    <cdk-virtual-scroll-viewport itemSize="72" class="list-viewport">
      <app-card *cdkVirtualFor="let item of items; trackBy: trackById" [data]="item"></app-card>
    </cdk-virtual-scroll-viewport>
  `,
  styles: [`.list-viewport { height: 600px; }`],
})
export class ItemListComponent {
  items = [...]; // can be thousands

  trackById(index: number, item: any) { return item.id; }
}
```

---

## Pattern 14: Context Menu with CDK

### Before (custom)

```typescript
@HostListener('contextmenu', ['$event'])
onRightClick(event: MouseEvent) {
  event.preventDefault();
  this.menuX = event.clientX;
  this.menuY = event.clientY;
  this.showMenu = true;
}
```

### After (CDK Context Menu)

```typescript
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';

@Component({
  standalone: true,
  imports: [CdkContextMenuTrigger, CdkMenu, CdkMenuItem],
  template: `
    <div [cdkContextMenuTriggerFor]="contextMenu" class="content-area">
      Right-click here
    </div>

    <ng-template #contextMenu>
      <div cdkMenu>
        <button cdkMenuItem (cdkMenuItemTriggered)="cut()">Cut</button>
        <button cdkMenuItem (cdkMenuItemTriggered)="copy()">Copy</button>
        <button cdkMenuItem (cdkMenuItemTriggered)="paste()">Paste</button>
      </div>
    </ng-template>
  `,
})
```

---

## General Migration Checklist

When migrating any custom implementation to CDK:

1. **Install if needed**: `ng add @angular/cdk` or `npm i @angular/cdk`
2. **Import overlay CSS** (if using overlay/dialog/menu): Add `@import '@angular/cdk/overlay-prebuilt.css';` to global styles
3. **Import as standalone**: All CDK v21 directives are standalone, import directly in component `imports` array
4. **Use inject()**: Prefer `inject(Service)` over constructor injection
5. **Clean up**: Use `DestroyRef` + `takeUntilDestroyed()` for subscriptions
6. **Test**: CDK components ship with test harnesses; use them
7. **Verify a11y**: Run `axe-core` or screen reader testing after migration
8. **Verify RTL**: If app supports RTL, test overlay positions and layout
