import { Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { NotificationService } from '@core/services/notification.service';
import { UserService } from '@core/services/user.service';
import { SchoolService } from '@core/services/school.service';
import type { User } from '@core/models/user';
import type { NotificationChannel } from '@core/models/notification';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-send-notification',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, IconComponent],
  templateUrl: './send-notification.html',
  styleUrl: './send-notification.css',
})
export class SendNotificationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly userService = inject(UserService);
  private readonly schoolService = inject(SchoolService);
  private readonly router = inject(Router);

  readonly notificationsRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/notifications`,
  );
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly users = signal<User[]>([]);
  readonly selectedUserIds = signal<Set<string>>(new Set());

  readonly channels: NotificationChannel[] = ['in_app', 'sms', 'email', 'push'];
  readonly selectedChannels = signal<Set<NotificationChannel>>(new Set(['in_app']));

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    body: ['', [Validators.required]],
  });

  constructor() {
    this.loadUsers();
  }

  toggleUser(userId: string): void {
    this.selectedUserIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }

  toggleChannel(channel: NotificationChannel): void {
    this.selectedChannels.update((chs) => {
      const next = new Set(chs);
      if (next.has(channel)) {
        next.delete(channel);
      } else {
        next.add(channel);
      }
      return next;
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.selectedUserIds().size === 0) {
      this.errorMessage.set('NOTIFICATIONS.SELECT_USERS_ERROR');
      return;
    }

    if (this.selectedChannels().size === 0) {
      this.errorMessage.set('NOTIFICATIONS.SELECT_CHANNELS_ERROR');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formVal = this.form.getRawValue();

    this.notificationService
      .send({
        userIds: [...this.selectedUserIds()],
        title: formVal.title,
        body: formVal.body,
        channels: [...this.selectedChannels()],
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/schools', this.schoolService.currentSchoolId(), 'notifications']);
        },
        error: (err: { error?: ApiErrorResponse }) => {
          this.saving.set(false);
          const body = err.error;
          this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
        },
      });
  }

  private loadUsers(): void {
    this.userService.list({ limit: 100 }).subscribe({
      next: (res) => this.users.set(res.data),
    });
  }
}
