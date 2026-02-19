import { Component, ElementRef, effect, inject, input } from '@angular/core';
import { icon as faIcon, config, type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowLeft,
  faBan,
  faBars,
  faCalendarDays,
  faCalendarXmark,
  faClipboardCheck,
  faClipboardList,
  faChalkboardUser,
  faChevronLeft,
  faChevronRight,
  faCircleCheck,
  faCircleInfo,
  faCirclePlus,
  faCircleUser,
  faCircleXmark,
  faFileInvoiceDollar,
  faFileLines,
  faFilePen,
  faFloppyDisk,
  faGauge,
  faGraduationCap,
  faKeyboard,
  faLayerGroup,
  faMoneyBillWave,
  faMicroscope,
  faMoon,
  faPenToSquare,
  faPlus,
  faRightFromBracket,
  faScaleBalanced,
  faShieldHalved,
  faSun,
  faTrash,
  faUser,
  faUserPlus,
  faUsers,
  faUsersSlash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

// Prevent FA from injecting its own <style> tag; we import the CSS globally
config.autoAddCss = false;

const ICONS: Record<string, IconDefinition> = {
  'arrow-left': faArrowLeft,
  ban: faBan,
  bars: faBars,
  'calendar-days': faCalendarDays,
  'calendar-xmark': faCalendarXmark,
  'clipboard-check': faClipboardCheck,
  'clipboard-list': faClipboardList,
  'chalkboard-user': faChalkboardUser,
  'chevron-left': faChevronLeft,
  'chevron-right': faChevronRight,
  'circle-check': faCircleCheck,
  'circle-info': faCircleInfo,
  'circle-plus': faCirclePlus,
  'circle-user': faCircleUser,
  'circle-xmark': faCircleXmark,
  'file-invoice-dollar': faFileInvoiceDollar,
  'file-lines': faFileLines,
  'file-pen': faFilePen,
  'floppy-disk': faFloppyDisk,
  gauge: faGauge,
  'graduation-cap': faGraduationCap,
  keyboard: faKeyboard,
  'layer-group': faLayerGroup,
  'money-bill-wave': faMoneyBillWave,
  microscope: faMicroscope,
  moon: faMoon,
  'pen-to-square': faPenToSquare,
  plus: faPlus,
  'right-from-bracket': faRightFromBracket,
  'scale-balanced': faScaleBalanced,
  'shield-halved': faShieldHalved,
  sun: faSun,
  trash: faTrash,
  user: faUser,
  'user-plus': faUserPlus,
  users: faUsers,
  'users-slash': faUsersSlash,
  xmark: faXmark,
};

/** Icons that represent a direction and should flip horizontally in RTL */
const RTL_FLIP_ICONS = new Set([
  'arrow-left',
  'chevron-left',
  'chevron-right',
  'right-from-bracket',
]);

@Component({
  selector: 'fa-icon',
  standalone: true,
  template: '',
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `,
})
export class IconComponent {
  private readonly el = inject(ElementRef);

  readonly icon = input.required<string>();

  constructor() {
    effect(() => {
      const hostEl = this.el.nativeElement as HTMLElement;
      hostEl.replaceChildren();

      const iconName = this.icon();
      const def = ICONS[iconName];
      if (!def) return;

      const result = faIcon(def);
      for (const node of Array.from(result.node)) {
        hostEl.appendChild(node);
      }

      hostEl.classList.toggle('rtl-flip', RTL_FLIP_ICONS.has(iconName));
    });
  }
}
