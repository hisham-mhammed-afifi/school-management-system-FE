import { Injectable, inject, computed } from '@angular/core';

import { AuthService } from '@core/services/auth.service';
import { SchoolService } from '@core/services/school.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly authService = inject(AuthService);
  private readonly schoolService = inject(SchoolService);

  private readonly userPermissions = computed(() => this.authService.user()?.permissions ?? []);

  readonly isSuperAdmin = this.schoolService.isSuperAdmin;

  hasPermission(permission: string): boolean {
    if (this.isSuperAdmin()) return true;
    return this.userPermissions().includes(permission);
  }

  hasAnyPermission(...permissions: string[]): boolean {
    if (this.isSuperAdmin()) return true;
    const perms = this.userPermissions();
    return permissions.some((p) => perms.includes(p));
  }

  hasRole(role: string): boolean {
    const user = this.authService.user();
    if (!user) return false;
    return user.roles.includes(role);
  }
}
