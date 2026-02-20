import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkTrapFocus, LiveAnnouncer } from '@angular/cdk/a11y';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { UserService } from '@core/services/user.service';
import { PermissionService } from '@core/services/permission.service';
import { RoleService } from '@core/services/role.service';
import { SchoolService } from '@core/services/school.service';
import type { User } from '@core/models/user';
import type { Role } from '@core/models/role';

@Component({
  selector: 'app-user-detail',
  imports: [DatePipe, RouterLink, TranslatePipe, IconComponent, CdkTrapFocus],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css',
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly schoolService = inject(SchoolService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly translate = inject(TranslateService);
  readonly permissionService = inject(PermissionService);

  readonly usersRoute = computed(() => `/schools/${this.schoolService.currentSchoolId()}/users`);
  readonly user = signal<User | null>(null);
  readonly availableRoles = signal<Role[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionLoading = signal(false);

  private get userId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadUser();
    this.loadRoles();
  }

  assignRole(roleId: string): void {
    this.actionLoading.set(true);
    this.userService.assignRole(this.userId, { roleId }).subscribe({
      next: (res) => {
        this.liveAnnouncer.announce(this.translate.instant('COMMON.SUCCESS'), 'polite');
        this.user.set(res.data);
        this.actionLoading.set(false);
      },
      error: () => this.actionLoading.set(false),
    });
  }

  readonly showRemoveRoleConfirm = signal(false);
  readonly removingRoleId = signal<string | null>(null);

  confirmRemoveRole(roleId: string): void {
    this.removingRoleId.set(roleId);
    this.showRemoveRoleConfirm.set(true);
  }

  cancelRemoveRole(): void {
    this.showRemoveRoleConfirm.set(false);
    this.removingRoleId.set(null);
  }

  removeRole(): void {
    const roleId = this.removingRoleId();
    if (!roleId) return;

    this.actionLoading.set(true);
    this.userService.removeRole(this.userId, roleId).subscribe({
      next: () => {
        this.liveAnnouncer.announce(this.translate.instant('COMMON.SUCCESS'), 'polite');
        this.user.update((u) =>
          u ? { ...u, roles: u.roles.filter((r) => r.roleId !== roleId) } : u,
        );
        this.actionLoading.set(false);
        this.showRemoveRoleConfirm.set(false);
        this.removingRoleId.set(null);
      },
      error: () => {
        this.actionLoading.set(false);
        this.showRemoveRoleConfirm.set(false);
        this.removingRoleId.set(null);
      },
    });
  }

  unassignedRoles(): Role[] {
    const assigned = new Set(this.user()?.roles.map((r) => r.roleId) ?? []);
    return this.availableRoles().filter((r) => !assigned.has(r.id));
  }

  private loadUser(): void {
    this.loading.set(true);
    this.error.set(null);
    this.userService.get(this.userId).subscribe({
      next: (res) => {
        this.user.set(res.data);
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
      next: (res) => this.availableRoles.set(res.data),
    });
  }
}
