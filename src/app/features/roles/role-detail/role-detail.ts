import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { IconComponent } from '@shared/components/icon/icon';

import { RoleService } from '@core/services/role.service';
import { PermissionService } from '@core/services/permission.service';
import { SchoolService } from '@core/services/school.service';
import { SEED_ROLES } from '@core/models/role';
import type { Role, Permission } from '@core/models/role';

interface PermissionGroup {
  module: string;
  permissions: Permission[];
}

@Component({
  selector: 'app-role-detail',
  imports: [RouterLink, TranslatePipe, IconComponent],
  templateUrl: './role-detail.html',
  styleUrl: './role-detail.css',
})
export class RoleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly roleService = inject(RoleService);
  private readonly schoolService = inject(SchoolService);
  readonly permissionService = inject(PermissionService);

  readonly rolesRoute = computed(() => `/schools/${this.schoolService.currentSchoolId()}/roles`);
  readonly role = signal<Role | null>(null);
  readonly allPermissions = signal<Permission[]>([]);
  readonly selectedPermissionIds = signal<Set<string>>(new Set());
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly dirty = signal(false);

  readonly isSeedRole = computed(() => {
    const name = this.role()?.name;
    return name ? (SEED_ROLES as readonly string[]).includes(name) : false;
  });

  readonly permissionGroups = computed<PermissionGroup[]>(() => {
    const perms = this.allPermissions();
    const groups = new Map<string, Permission[]>();
    for (const p of perms) {
      const list = groups.get(p.module) ?? [];
      list.push(p);
      groups.set(p.module, list);
    }
    return [...groups.entries()]
      .map(([module, permissions]) => ({ module, permissions }))
      .sort((a, b) => a.module.localeCompare(b.module));
  });

  private get roleId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadRole();
    this.loadPermissions();
  }

  isChecked(permissionId: string): boolean {
    return this.selectedPermissionIds().has(permissionId);
  }

  togglePermission(permissionId: string): void {
    this.selectedPermissionIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
    this.dirty.set(true);
  }

  toggleModule(group: PermissionGroup): void {
    const allChecked = group.permissions.every((p) => this.selectedPermissionIds().has(p.id));
    this.selectedPermissionIds.update((ids) => {
      const next = new Set(ids);
      for (const p of group.permissions) {
        if (allChecked) {
          next.delete(p.id);
        } else {
          next.add(p.id);
        }
      }
      return next;
    });
    this.dirty.set(true);
  }

  isModuleFullyChecked(group: PermissionGroup): boolean {
    return group.permissions.every((p) => this.selectedPermissionIds().has(p.id));
  }

  isModulePartiallyChecked(group: PermissionGroup): boolean {
    const checked = group.permissions.filter((p) => this.selectedPermissionIds().has(p.id));
    return checked.length > 0 && checked.length < group.permissions.length;
  }

  savePermissions(): void {
    this.saving.set(true);
    this.roleService
      .setPermissions(this.roleId, { permissionIds: [...this.selectedPermissionIds()] })
      .subscribe({
        next: (res) => {
          this.role.set(res.data);
          this.dirty.set(false);
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      });
  }

  private loadRole(): void {
    this.loading.set(true);
    this.error.set(null);
    this.roleService.get(this.roleId).subscribe({
      next: (res) => {
        this.role.set(res.data);
        this.selectedPermissionIds.set(new Set(res.data.permissions?.map((p) => p.id) ?? []));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('ROLES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private loadPermissions(): void {
    this.roleService.listPermissions().subscribe({
      next: (res) => this.allPermissions.set(res.data),
    });
  }
}
