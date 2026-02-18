import { Component, input, output, computed } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-pagination',
  imports: [TranslatePipe],
  template: `
    @if (totalPages() > 1) {
      <nav
        class="flex items-center justify-between pt-4"
        [attr.aria-label]="'COMMON.PAGINATION' | translate"
      >
        <p class="text-sm text-text-tertiary">
          {{ 'COMMON.SHOWING' | translate: { from: from(), to: to(), total: total() } }}
        </p>
        <div class="flex items-center gap-1">
          <button
            type="button"
            [disabled]="page() <= 1"
            (click)="goTo(page() - 1)"
            class="p-2 rounded-lg border-0 bg-transparent text-text-secondary cursor-pointer transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
            [attr.aria-label]="'COMMON.PREVIOUS' | translate"
          >
            <span class="material-icons text-xl leading-none">chevron_left</span>
          </button>
          @for (p of visiblePages(); track p) {
            @if (p === -1) {
              <span class="px-2 text-text-tertiary">...</span>
            } @else {
              <button
                type="button"
                (click)="goTo(p)"
                class="min-w-9 h-9 rounded-lg border-0 text-sm font-medium cursor-pointer transition-colors"
                [class]="
                  p === page()
                    ? 'bg-accent text-white'
                    : 'bg-transparent text-text-secondary hover:bg-surface-hover'
                "
                [attr.aria-current]="p === page() ? 'page' : null"
              >
                {{ p }}
              </button>
            }
          }
          <button
            type="button"
            [disabled]="page() >= totalPages()"
            (click)="goTo(page() + 1)"
            class="p-2 rounded-lg border-0 bg-transparent text-text-secondary cursor-pointer transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed"
            [attr.aria-label]="'COMMON.NEXT' | translate"
          >
            <span class="material-icons text-xl leading-none">chevron_right</span>
          </button>
        </div>
      </nav>
    }
  `,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly limit = input.required<number>();
  readonly total = input.required<number>();
  readonly pageChange = output<number>();

  readonly totalPages = computed(() => Math.ceil(this.total() / this.limit()) || 1);
  readonly from = computed(() => (this.page() - 1) * this.limit() + 1);
  readonly to = computed(() => Math.min(this.page() * this.limit(), this.total()));

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push(-1);
    pages.push(total);

    return pages;
  });

  goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.pageChange.emit(page);
    }
  }
}
