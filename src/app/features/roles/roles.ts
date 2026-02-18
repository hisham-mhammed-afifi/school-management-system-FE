import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { RoleService } from '@core/services/role.service';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import { SEED_ROLES } from '@core/models/role';
import type { Role, ListRolesQuery } from '@core/models/role';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-roles',
  imports: [RouterLink, TranslatePipe, PaginationComponent],
  templateUrl: './roles.html',
  styleUrl: './roles.css',
})
export class RolesComponent implements OnInit {
  private readonly roleService = inject(RoleService);

  readonly roles = signal<Role[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ListRolesQuery>({ page: 1, limit: 20 });

  ngOnInit(): void {
    this.loadRoles();
  }

  isSeedRole(name: string): boolean {
    return (SEED_ROLES as readonly string[]).includes(name);
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.update((q) => ({ ...q, search: value || undefined, page: 1 }));
    this.loadRoles();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadRoles();
  }

  deleteRole(role: Role): void {
    this.roleService.delete(role.id).subscribe({
      next: () => this.loadRoles(),
    });
  }

  private loadRoles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.roleService.list(this.query()).subscribe({
      next: (res) => {
        this.roles.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('ROLES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
