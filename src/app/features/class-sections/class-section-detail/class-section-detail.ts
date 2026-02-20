import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { ClassSectionService } from '@core/services/class-section.service';
import { PermissionService } from '@core/services/permission.service';
import { SchoolService } from '@core/services/school.service';
import type { ClassSection } from '@core/models/class-section';

@Component({
  selector: 'app-class-section-detail',
  imports: [RouterLink, TranslatePipe, IconComponent],
  templateUrl: './class-section-detail.html',
  styleUrl: './class-section-detail.css',
})
export class ClassSectionDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly classSectionService = inject(ClassSectionService);
  private readonly schoolService = inject(SchoolService);
  readonly permissionService = inject(PermissionService);

  readonly listRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/class-sections`,
  );
  readonly section = signal<ClassSection | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deleting = signal(false);
  readonly showDeleteConfirm = signal(false);

  private get sectionId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadSection();
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteSection(): void {
    this.deleting.set(true);
    this.classSectionService.delete(this.sectionId).subscribe({
      next: () => {
        this.router.navigate([this.listRoute()]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  private loadSection(): void {
    this.loading.set(true);
    this.error.set(null);
    this.classSectionService.get(this.sectionId).subscribe({
      next: (res) => {
        this.section.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('CLASS_SECTIONS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
