// TODO: Migrate dropdown to @angular/cdk/overlay for proper focus trapping, z-index stacking, and escape handling
import { Component, DestroyRef, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { NotificationService } from '@core/services/notification.service';
import { SchoolService } from '@core/services/school.service';
import type { Notification } from '@core/models/notification';

@Component({
  selector: 'app-notification-bell',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBellComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly schoolService = inject(SchoolService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly el = inject(ElementRef);
  private readonly router = inject(Router);

  readonly unreadCount = signal(0);
  readonly recentNotifications = signal<Notification[]>([]);
  readonly dropdownOpen = signal(false);
  readonly loading = signal(false);

  private pollInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadUnreadCount();
    this.startPolling();

    this.destroyRef.onDestroy(() => {
      this.stopPolling();
    });
  }

  toggleDropdown(): void {
    const isOpen = !this.dropdownOpen();
    this.dropdownOpen.set(isOpen);
    if (isOpen) {
      this.loadRecent();
    }
  }

  closeDropdown(): void {
    this.dropdownOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeDropdown();
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    if (notification.isRead) return;

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        this.recentNotifications.update((list) =>
          list.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
        );
        this.unreadCount.update((c) => Math.max(0, c - 1));
      },
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.recentNotifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
        this.unreadCount.set(0);
      },
    });
  }

  viewAll(): void {
    this.closeDropdown();
    const schoolId = this.schoolService.currentSchoolId();
    if (schoolId) {
      this.router.navigate(['/schools', schoolId, 'notifications']);
    }
  }

  private loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (res) => {
        this.unreadCount.set(res.data.count);
      },
    });
  }

  private loadRecent(): void {
    this.loading.set(true);
    this.notificationService.list({ page: 1, limit: 5 }).subscribe({
      next: (res) => {
        this.recentNotifications.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private startPolling(): void {
    this.pollInterval = setInterval(() => {
      this.loadUnreadCount();
    }, 30000);
  }

  private stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}
