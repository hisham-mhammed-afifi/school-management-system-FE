import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { GuardianPortalService } from '@core/services/guardian-portal.service';
import type { Student } from '@core/models/student';

@Component({
  selector: 'app-parent-portal',
  imports: [RouterLink, TranslatePipe, IconComponent],
  templateUrl: './parent-portal.html',
  styleUrl: './parent-portal.css',
})
export class ParentPortalComponent implements OnInit {
  private readonly portalService = inject(GuardianPortalService);

  readonly children = signal<Student[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadChildren();
  }

  private loadChildren(): void {
    this.loading.set(true);
    this.error.set(null);

    this.portalService.listChildren().subscribe({
      next: (res) => {
        this.children.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('PARENT_PORTAL.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
