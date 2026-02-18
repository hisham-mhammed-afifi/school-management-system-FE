import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { RoleService } from '@core/services/role.service';
import { SEED_ROLES } from '@core/models/role';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-role-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './role-form.html',
  styleUrl: './role-form.css',
})
export class RoleFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly roleService = inject(RoleService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isEdit = signal(false);
  readonly roleId = signal<string | null>(null);
  readonly isSeedRole = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.roleId.set(id);
      this.loadRole(id);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSeedRole()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const { name } = this.form.getRawValue();

    if (this.isEdit()) {
      this.roleService.update(this.roleId()!, { name }).subscribe({
        next: () => this.router.navigate(['/roles', this.roleId()]),
        error: (err) => this.handleError(err),
      });
    } else {
      this.roleService.create({ name }).subscribe({
        next: (res) => this.router.navigate(['/roles', res.data.id]),
        error: (err) => this.handleError(err),
      });
    }
  }

  private loadRole(id: string): void {
    this.loading.set(true);
    this.roleService.get(id).subscribe({
      next: (res) => {
        this.form.patchValue({ name: res.data.name });
        this.isSeedRole.set((SEED_ROLES as readonly string[]).includes(res.data.name));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('ROLES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
