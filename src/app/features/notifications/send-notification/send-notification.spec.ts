import { TestBed, ComponentFixture } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SchoolService } from '@core/services/school.service';
import { SendNotificationComponent } from './send-notification';

describe('SendNotificationComponent', () => {
  let fixture: ComponentFixture<SendNotificationComponent>;
  let component: SendNotificationComponent;
  let httpTesting: HttpTestingController;

  const mockUsersResponse = {
    success: true,
    data: [
      {
        id: 'u1',
        email: 'admin@test.com',
        phone: null,
        isActive: true,
        roles: [],
        lastLoginAt: null,
      },
      {
        id: 'u2',
        email: 'teacher@test.com',
        phone: null,
        isActive: true,
        roles: [],
        lastLoginAt: null,
      },
    ],
    meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendNotificationComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: SchoolService,
          useValue: { currentSchoolId: signal('school-1') },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(SendNotificationComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushUsers(): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    req.flush(mockUsersResponse);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushUsers();
    expect(component).toBeTruthy();
  });

  it('should load users on init', () => {
    fixture.detectChanges();
    flushUsers();

    expect(component.users().length).toBe(2);
  });

  it('should have in_app channel selected by default', () => {
    fixture.detectChanges();
    flushUsers();

    expect(component.selectedChannels().has('in_app')).toBe(true);
  });

  it('should toggle user selection', () => {
    fixture.detectChanges();
    flushUsers();

    component.toggleUser('u1');
    expect(component.selectedUserIds().has('u1')).toBe(true);

    component.toggleUser('u1');
    expect(component.selectedUserIds().has('u1')).toBe(false);
  });

  it('should toggle channel selection', () => {
    fixture.detectChanges();
    flushUsers();

    component.toggleChannel('email');
    expect(component.selectedChannels().has('email')).toBe(true);

    component.toggleChannel('email');
    expect(component.selectedChannels().has('email')).toBe(false);
  });

  it('should not submit with invalid form', () => {
    fixture.detectChanges();
    flushUsers();

    component.onSubmit();

    expect(component.saving()).toBe(false);
    expect(component.form.controls.title.touched).toBe(true);
  });

  it('should show error when no users selected', () => {
    fixture.detectChanges();
    flushUsers();

    component.form.controls.title.setValue('Test');
    component.form.controls.body.setValue('Hello');
    component.onSubmit();

    expect(component.errorMessage()).toBe('NOTIFICATIONS.SELECT_USERS_ERROR');
  });

  it('should show error when no channels selected', () => {
    fixture.detectChanges();
    flushUsers();

    component.form.controls.title.setValue('Test');
    component.form.controls.body.setValue('Hello');
    component.selectedUserIds.set(new Set(['u1']));
    component.selectedChannels.set(new Set());
    component.onSubmit();

    expect(component.errorMessage()).toBe('NOTIFICATIONS.SELECT_CHANNELS_ERROR');
  });

  it('should submit notification successfully', () => {
    fixture.detectChanges();
    flushUsers();

    component.form.controls.title.setValue('Test Notification');
    component.form.controls.body.setValue('This is a test');
    component.selectedUserIds.set(new Set(['u1', 'u2']));
    component.selectedChannels.set(new Set(['in_app', 'email']));
    component.onSubmit();

    const req = httpTesting.expectOne('/api/v1/notifications/send');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('Test Notification');
    expect(req.request.body.body).toBe('This is a test');
    expect(req.request.body.userIds).toEqual(['u1', 'u2']);
    expect(req.request.body.channels).toEqual(['in_app', 'email']);
    req.flush({ success: true, data: { message: 'Sent' } });
  });

  it('should handle send error', () => {
    fixture.detectChanges();
    flushUsers();

    component.form.controls.title.setValue('Test');
    component.form.controls.body.setValue('Hello');
    component.selectedUserIds.set(new Set(['u1']));
    component.onSubmit();

    const req = httpTesting.expectOne('/api/v1/notifications/send');
    req.flush(
      { success: false, error: { code: 'ERROR', message: 'Failed to send' } },
      { status: 500, statusText: 'Server Error' },
    );

    expect(component.saving()).toBe(false);
    expect(component.errorMessage()).toBe('Failed to send');
  });
});
