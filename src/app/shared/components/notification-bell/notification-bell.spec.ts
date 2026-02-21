import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { NotificationBellComponent } from './notification-bell';

describe('NotificationBellComponent', () => {
  let fixture: ComponentFixture<NotificationBellComponent>;
  let component: NotificationBellComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushUnreadCount(count = 0): void {
    const req = httpTesting.expectOne('/api/v1/notifications/unread-count');
    req.flush({ success: true, data: { count } });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushUnreadCount();
    expect(component).toBeTruthy();
  });

  it('should load unread count on init', () => {
    fixture.detectChanges();
    flushUnreadCount(3);

    expect(component.unreadCount()).toBe(3);
  });

  it('should show badge when unread count > 0', () => {
    fixture.detectChanges();
    flushUnreadCount(5);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const badge = el.querySelector('.rounded-full.bg-danger');
    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe('5');
  });

  it('should not show badge when unread count is 0', () => {
    fixture.detectChanges();
    flushUnreadCount(0);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const badge = el.querySelector('.bg-danger');
    expect(badge).toBeNull();
  });

  it('should toggle dropdown on click', () => {
    fixture.detectChanges();
    flushUnreadCount();

    expect(component.dropdownOpen()).toBe(false);

    component.toggleDropdown();
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } });

    expect(component.dropdownOpen()).toBe(true);

    component.toggleDropdown();
    expect(component.dropdownOpen()).toBe(false);
  });

  it('should load recent notifications when dropdown opens', () => {
    fixture.detectChanges();
    flushUnreadCount();

    component.toggleDropdown();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('5');
    req.flush({
      success: true,
      data: [{ id: 'n1', title: 'Test', body: 'Hello', isRead: false }],
      meta: { page: 1, limit: 5, total: 1, totalPages: 1 },
    });

    expect(component.recentNotifications().length).toBe(1);
  });

  it('should close dropdown on escape key', () => {
    fixture.detectChanges();
    flushUnreadCount();

    component.dropdownOpen.set(true);
    component.onEscapeKey();

    expect(component.dropdownOpen()).toBe(false);
  });

  it('should mark all as read', () => {
    fixture.detectChanges();
    flushUnreadCount(3);

    component.recentNotifications.set([
      {
        id: 'n1',
        userId: 'u1',
        title: 'T',
        body: 'B',
        channel: 'in_app',
        isRead: false,
        schoolId: 's1',
        createdAt: '',
        updatedAt: '',
      },
    ]);
    component.markAllAsRead();

    const req = httpTesting.expectOne('/api/v1/notifications/read-all');
    req.flush({ success: true, data: { message: 'Done' } });

    expect(component.unreadCount()).toBe(0);
    expect(component.recentNotifications().every((n) => n.isRead)).toBe(true);
  });

  it('should show 99+ for large unread counts', () => {
    fixture.detectChanges();
    flushUnreadCount(150);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const badge = el.querySelector('.rounded-full.bg-danger');
    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe('99+');
  });
});
