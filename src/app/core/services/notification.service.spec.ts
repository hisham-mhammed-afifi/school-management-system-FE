import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(NotificationService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list notifications', () => {
    service.list({ page: 1, limit: 20 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('20');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list notifications with isRead filter', () => {
    service.list({ isRead: false }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    expect(req.request.params.get('isRead')).toBe('false');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should list notifications with channel filter', () => {
    service.list({ channel: 'in_app' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/notifications');
    expect(req.request.params.get('channel')).toBe('in_app');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get unread count', () => {
    service.getUnreadCount().subscribe();

    const req = httpTesting.expectOne('/api/v1/notifications/unread-count');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { count: 5 } });
  });

  it('should mark notification as read', () => {
    service.markAsRead('notif-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/notifications/notif-1/read');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ success: true, data: { id: 'notif-1', isRead: true } });
  });

  it('should mark all notifications as read', () => {
    service.markAllAsRead().subscribe();

    const req = httpTesting.expectOne('/api/v1/notifications/read-all');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ success: true, data: { message: 'All notifications marked as read' } });
  });

  it('should send notification', () => {
    const body = {
      userIds: ['user-1', 'user-2'],
      title: 'Test',
      body: 'Hello',
      channels: ['in_app' as const, 'email' as const],
    };
    service.send(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/notifications/send');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: { message: 'Notifications sent' } });
  });
});
