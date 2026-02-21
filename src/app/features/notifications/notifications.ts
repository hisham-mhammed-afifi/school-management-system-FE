import { Component, effect, inject, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { NotificationService } from '@core/services/notification.service';
import { PermissionService } from '@core/services/permission.service';
import { SchoolService } from '@core/services/school.service';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import type {
  Notification,
  ListNotificationsQuery,
  NotificationChannel,
} from '@core/models/notification';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-notifications',
  imports: [DatePipe, RouterLink, TranslatePipe, PaginationComponent, IconComponent],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly schoolService = inject(SchoolService);
  readonly permissionService = inject(PermissionService);

  readonly notifications = signal<Notification[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly query = signal<ListNotificationsQuery>({ page: 1, limit: 20 });

  readonly channels: NotificationChannel[] = ['in_app', 'sms', 'email', 'push'];

  constructor() {
    effect(() => {
      this.schoolService.currentSchoolId();
      untracked(() => {
        this.query.set({ page: 1, limit: 20 });
        this.loadNotifications();
      });
    });
  }

  onReadFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({
      ...q,
      isRead: value === '' ? undefined : value === 'true',
      page: 1,
    }));
    this.loadNotifications();
  }

  onChannelFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({
      ...q,
      channel: (value || undefined) as NotificationChannel | undefined,
      page: 1,
    }));
    this.loadNotifications();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadNotifications();
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
      },
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
      },
    });
  }

  private loadNotifications(): void {
    this.loading.set(true);
    this.error.set(null);

    this.notificationService.list(this.query()).subscribe({
      next: (res) => {
        this.notifications.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('NOTIFICATIONS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
