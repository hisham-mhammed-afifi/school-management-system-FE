import { Component, inject, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { SchoolService } from '@core/services/school.service';

@Component({
  selector: 'app-school-switcher',
  imports: [TranslatePipe],
  template: `
    <select
      (change)="onSchoolChange($event)"
      [attr.aria-label]="'SCHOOL.SELECT' | translate"
      class="cursor-pointer px-3 py-1.5 border border-border rounded-lg bg-surface text-sm text-text-primary transition-colors hover:bg-surface-hover focus:border-accent focus:outline-none"
    >
      <option value="" [selected]="!schoolService.selectedSchoolId()" disabled>
        {{ 'SCHOOL.SELECT_PLACEHOLDER' | translate }}
      </option>
      @for (school of schoolService.schools(); track school.id) {
        <option [value]="school.id" [selected]="school.id === schoolService.selectedSchoolId()">
          {{ school.name }}
        </option>
      }
    </select>
  `,
})
export class SchoolSwitcherComponent implements OnInit {
  readonly schoolService = inject(SchoolService);

  ngOnInit(): void {
    if (this.schoolService.schools().length === 0) {
      this.schoolService.fetchSchools().subscribe();
    }
  }

  onSchoolChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value) {
      this.schoolService.selectSchool(value);
    }
  }
}
