import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { NotificationsComponent } from './notifications';

describe('NotificationsComponent', () => {
  let fixture: ComponentFixture<NotificationsComponent>;
  let component: NotificationsComponent;
  let httpTesting: HttpTestingController;

  const mockNotificationsResponse = {
    success: true,
    data: [
      {
        id: 'n1',
        userId: 'user-1',
        title: 'Welcome',
        body: 'Welcome to the platform',
        channel: 'in_app',
        isRead: false,
        schoolId: 'school-1',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
      {
        id: 'n2',
        userId: 'user-1',
        title: 'Update Available',
        body: 'A new update is available',
        channel: 'email',
        isRead: true,
        schoolId: 'school-1',
        createdAt: '2025-01-02T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      },
    ],
    meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    req.flush(mockNotificationsResponse);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load notifications on init', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    expect(req.request.method).toBe('GET');
    req.flush(mockNotificationsResponse);

    expect(component.notifications().length).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('NOTIFICATIONS.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should filter by read status', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onReadFilter({ target: { value: 'false' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    expect(req.request.params.get('isRead')).toBe('false');
    req.flush(mockNotificationsResponse);
  });

  it('should filter by channel', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onChannelFilter({ target: { value: 'in_app' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    expect(req.request.params.get('channel')).toBe('in_app');
    req.flush(mockNotificationsResponse);
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({
      ...mockNotificationsResponse,
      meta: { page: 2, limit: 20, total: 25, totalPages: 2 },
    });

    expect(component.query().page).toBe(2);
  });

  it('should mark a notification as read', () => {
    fixture.detectChanges();
    flushInitialRequests();

    const unreadNotification = component.notifications()[0];
    component.markAsRead(unreadNotification);

    const req = httpTesting.expectOne('/api/v1/notifications/n1/read');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { ...unreadNotification, isRead: true } });

    expect(component.notifications()[0].isRead).toBe(true);
  });

  it('should not send request for already-read notification', () => {
    fixture.detectChanges();
    flushInitialRequests();

    const readNotification = component.notifications()[1];
    component.markAsRead(readNotification);

    // No additional HTTP request should have been made
  });

  it('should mark all as read', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.markAllAsRead();

    const req = httpTesting.expectOne('/api/v1/notifications/read-all');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { message: 'Done' } });

    expect(component.notifications().every((n) => n.isRead)).toBe(true);
  });

  it('should render notifications list when data is loaded', () => {
    fixture.detectChanges();
    flushInitialRequests();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('[role="listitem"]');
    expect(items.length).toBe(2);
    expect(el.textContent).toContain('Welcome');
    expect(el.textContent).toContain('Update Available');
  });

  it('should show empty state when no notifications', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    req.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="listitem"]')).toBeNull();
  });
});
