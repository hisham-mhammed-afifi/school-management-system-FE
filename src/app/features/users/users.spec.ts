import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { UsersComponent } from './users';

describe('UsersComponent', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let component: UsersComponent;
  let httpTesting: HttpTestingController;

  const mockUsersResponse = {
    success: true,
    data: [
      {
        id: 'u1',
        email: 'test@example.com',
        phone: '123',
        isActive: true,
        lastLoginAt: null,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        roles: [{ roleId: 'r1', roleName: 'admin', schoolId: null, schoolName: null }],
      },
    ],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };

  const mockRolesResponse = {
    success: true,
    data: [
      { id: 'r1', name: 'admin', schoolId: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    ],
    meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UsersComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const usersReq = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    usersReq.flush(mockUsersResponse);

    const rolesReq = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    rolesReq.flush(mockRolesResponse);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load users and roles on init', () => {
    fixture.detectChanges();

    const usersReq = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    expect(usersReq.request.method).toBe('GET');
    usersReq.flush(mockUsersResponse);

    const rolesReq = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    expect(rolesReq.request.method).toBe('GET');
    rolesReq.flush(mockRolesResponse);

    expect(component.users().length).toBe(1);
    expect(component.roles().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const usersReq = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    usersReq.flush(null, { status: 500, statusText: 'Server Error' });

    const rolesReq = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    rolesReq.flush(mockRolesResponse);

    expect(component.error()).toBe('USERS.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should filter by search', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onSearch({ target: { value: 'test' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    expect(req.request.params.get('search')).toBe('test');
    req.flush(mockUsersResponse);

    expect(component.query().search).toBe('test');
    expect(component.query().page).toBe(1);
  });

  it('should filter by role', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onRoleFilter({ target: { value: 'r1' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    expect(req.request.params.get('roleId')).toBe('r1');
    req.flush(mockUsersResponse);

    expect(component.query().roleId).toBe('r1');
  });

  it('should filter by status', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onStatusFilter({ target: { value: 'true' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    expect(req.request.params.get('isActive')).toBe('true');
    req.flush(mockUsersResponse);

    expect(component.query().isActive).toBe(true);
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ ...mockUsersResponse, meta: { page: 2, limit: 20, total: 25, totalPages: 2 } });

    expect(component.query().page).toBe(2);
  });

  it('should render users table when data is loaded', () => {
    fixture.detectChanges();
    flushInitialRequests();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(el.textContent).toContain('test@example.com');
  });

  it('should show empty state when no users', () => {
    fixture.detectChanges();

    const usersReq = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    usersReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    });

    const rolesReq = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    rolesReq.flush(mockRolesResponse);

    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('tbody')).toBeNull();
  });
});
