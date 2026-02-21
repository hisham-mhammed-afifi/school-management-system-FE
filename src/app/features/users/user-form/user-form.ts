import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { UserService } from '@core/services/user.service';
import { RoleService } from '@core/services/role.service';
import { SchoolService } from '@core/services/school.service';
import type { User } from '@core/models/user';
import type { Role } from '@core/models/role';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, IconComponent],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly roleService = inject(RoleService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly usersRoute = computed(() => `/schools/${this.schoolService.currentSchoolId()}/users`);
  readonly isEdit = signal(false);
  readonly userId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly roles = signal<Role[]>([]);
  readonly selectedRoleIds = signal<Set<string>>(new Set());

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.userId.set(id);
      this.form.controls.password.clearValidators();
      this.form.controls.password.updateValueAndValidity();
      this.loadUser(id);
    }
    this.loadRoles();
  }

  toggleRole(roleId: string): void {
    this.selectedRoleIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.isEdit() && this.selectedRoleIds().size === 0) {
      this.errorMessage.set('USERS.SELECT_ROLE_REQUIRED');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const formVal = this.form.getRawValue();

    if (this.isEdit()) {
      this.userService
        .update(this.userId()!, {
          email: formVal.email,
          phone: formVal.phone || undefined,
          isActive: formVal.isActive,
        })
        .subscribe({
          next: () =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'users',
              this.userId(),
            ]),
          error: (err) => this.handleError(err),
        });
    } else {
      this.userService
        .create({
          email: formVal.email,
          phone: formVal.phone || undefined,
          password: formVal.password,
          roleIds: [...this.selectedRoleIds()],
        })
        .subscribe({
          next: (res) =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'users',
              res.data.id,
            ]),
          error: (err) => this.handleError(err),
        });
    }
  }

  private loadUser(id: string): void {
    this.loading.set(true);
    this.userService.get(id).subscribe({
      next: (res) => {
        this.patchForm(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('USERS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private patchForm(user: User): void {
    this.form.patchValue({
      email: user.email,
      phone: user.phone ?? '',
      isActive: user.isActive,
    });
    this.selectedRoleIds.set(new Set(user.roles.map((r) => r.roleId)));
  }

  private loadRoles(): void {
    this.roleService.list({ limit: 100 }).subscribe({
      next: (res) => this.roles.set(res.data),
      error: () => this.errorMessage.set('ROLES.LOAD_ERROR'),
    });
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
