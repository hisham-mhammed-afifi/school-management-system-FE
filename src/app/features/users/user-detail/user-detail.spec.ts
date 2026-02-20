import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { UserDetailComponent } from './user-detail';

describe('UserDetailComponent', () => {
  let fixture: ComponentFixture<UserDetailComponent>;
  let component: UserDetailComponent;
  let httpTesting: HttpTestingController;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    phone: '555-1234',
    isActive: true,
    lastLoginAt: '2025-06-01T00:00:00Z',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    roles: [{ roleId: 'r1', roleName: 'admin', schoolId: null, schoolName: null }],
  };

  const mockRoles = [
    { id: 'r1', name: 'admin', schoolId: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
    { id: 'r2', name: 'teacher', schoolId: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', 'user-1']]) } },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const userReq = httpTesting.expectOne('/api/v1/users/user-1');
    userReq.flush({ success: true, data: mockUser });

    const rolesReq = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    rolesReq.flush({
      success: true,
      data: mockRoles,
      meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load user and roles on init', () => {
    fixture.detectChanges();
    flushInitialRequests();

    expect(component.user()).toBeTruthy();
    expect(component.user()!.email).toBe('test@example.com');
    expect(component.availableRoles().length).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const userReq = httpTesting.expectOne('/api/v1/users/user-1');
    userReq.flush(null, { status: 500, statusText: 'Server Error' });

    const rolesReq = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    rolesReq.flush({
      success: true,
      data: mockRoles,
      meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
    });

    expect(component.error()).toBe('USERS.LOAD_ERROR');
  });

  it('should compute unassigned roles', () => {
    fixture.detectChanges();
    flushInitialRequests();

    const unassigned = component.unassignedRoles();
    expect(unassigned.length).toBe(1);
    expect(unassigned[0].name).toBe('teacher');
  });

  it('should assign a role', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.assignRole('r2');

    const req = httpTesting.expectOne('/api/v1/users/user-1/roles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ roleId: 'r2' });
    req.flush({
      success: true,
      data: {
        ...mockUser,
        roles: [
          ...mockUser.roles,
          { roleId: 'r2', roleName: 'teacher', schoolId: null, schoolName: null },
        ],
      },
    });

    expect(component.user()!.roles.length).toBe(2);
    expect(component.actionLoading()).toBe(false);
  });

  it('should remove a role', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.confirmRemoveRole('r1');
    component.removeRole();

    const req = httpTesting.expectOne('/api/v1/users/user-1/roles/r1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(component.user()!.roles.length).toBe(0);
    expect(component.actionLoading()).toBe(false);
  });

  it('should render user details', () => {
    fixture.detectChanges();
    flushInitialRequests();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('test@example.com');
    expect(el.textContent).toContain('555-1234');
  });
});
