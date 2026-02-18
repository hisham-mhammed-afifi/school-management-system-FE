import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { UserService } from '@core/services/user.service';
import { RoleService } from '@core/services/role.service';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import type { User, ListUsersQuery } from '@core/models/user';
import type { Role } from '@core/models/role';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-users',
  imports: [RouterLink, TranslatePipe, PaginationComponent],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);

  readonly users = signal<User[]>([]);
  readonly roles = signal<Role[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly query = signal<ListUsersQuery>({ page: 1, limit: 20 });

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.update((q) => ({ ...q, search: value || undefined, page: 1 }));
    this.loadUsers();
  }

  onRoleFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({ ...q, roleId: value || undefined, page: 1 }));
    this.loadUsers();
  }

  onStatusFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({
      ...q,
      isActive: value === '' ? undefined : value === 'true',
      page: 1,
    }));
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.list(this.query()).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('USERS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private loadRoles(): void {
    this.roleService.list({ limit: 100 }).subscribe({
      next: (res) => this.roles.set(res.data),
    });
  }
}
