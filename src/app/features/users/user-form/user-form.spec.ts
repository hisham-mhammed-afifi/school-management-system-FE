import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { UserFormComponent } from './user-form';

describe('UserFormComponent', () => {
  let fixture: ComponentFixture<UserFormComponent>;
  let component: UserFormComponent;
  let httpTesting: HttpTestingController;

  const mockRolesResponse = {
    success: true,
    data: [
      { id: 'r1', name: 'admin', schoolId: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
      {
        id: 'r2',
        name: 'teacher',
        schoolId: null,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
      },
    ],
    meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
  };

  function setupTestBed(routeId: string | null): void {
    const paramMap = new Map<string, string>();
    if (routeId) {
      paramMap.set('id', routeId);
    }

    TestBed.configureTestingModule({
      imports: [UserFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap } },
        },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
  }

  describe('create mode', () => {
    beforeEach(() => {
      setupTestBed(null);
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    function flushRoles(): void {
      const req = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
      req.flush(mockRolesResponse);
    }

    it('should create in create mode', () => {
      flushRoles();
      expect(component).toBeTruthy();
      expect(component.isEdit()).toBe(false);
    });

    it('should require email and password', () => {
      flushRoles();
      component.onSubmit();
      expect(component.form.controls.email.errors?.['required']).toBeTruthy();
      expect(component.form.controls.password.errors?.['required']).toBeTruthy();
    });

    it('should toggle role selection', () => {
      flushRoles();
      component.toggleRole('r1');
      expect(component.selectedRoleIds().has('r1')).toBe(true);

      component.toggleRole('r1');
      expect(component.selectedRoleIds().has('r1')).toBe(false);
    });

    it('should submit create request', () => {
      flushRoles();

      component.form.patchValue({ email: 'new@test.com', password: 'password123' });
      component.toggleRole('r1');
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/users');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'new@test.com',
        phone: undefined,
        password: 'password123',
        roleIds: ['r1'],
      });
      req.flush({ success: true, data: { id: 'new-id' } });
    });

    it('should handle create error', () => {
      flushRoles();

      component.form.patchValue({ email: 'new@test.com', password: 'password123' });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/users');
      req.flush(
        { success: false, error: { code: 'CONFLICT', message: 'Email exists' } },
        { status: 409, statusText: 'Conflict' },
      );

      expect(component.errorMessage()).toBe('Email exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    beforeEach(() => {
      setupTestBed('user-1');
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    function flushEditRequests(): void {
      const userReq = httpTesting.expectOne('/api/v1/users/user-1');
      userReq.flush({
        success: true,
        data: {
          id: 'user-1',
          email: 'existing@test.com',
          phone: '555',
          isActive: true,
          lastLoginAt: null,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
          roles: [{ roleId: 'r1', roleName: 'admin', schoolId: null, schoolName: null }],
        },
      });

      const rolesReq = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
      rolesReq.flush(mockRolesResponse);
    }

    it('should load user data in edit mode', () => {
      flushEditRequests();

      expect(component.isEdit()).toBe(true);
      expect(component.form.value.email).toBe('existing@test.com');
      expect(component.form.value.phone).toBe('555');
    });

    it('should not require password in edit mode', () => {
      flushEditRequests();

      expect(component.form.controls.password.errors).toBeNull();
    });

    it('should submit update request', () => {
      flushEditRequests();

      component.form.patchValue({ email: 'updated@test.com' });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/users/user-1');
      expect(req.request.method).toBe('PATCH');
      req.flush({ success: true, data: { id: 'user-1' } });
    });

    it('should show error when user load fails', () => {
      const userReq = httpTesting.expectOne('/api/v1/users/user-1');
      userReq.flush(null, { status: 404, statusText: 'Not Found' });

      const rolesReq = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
      rolesReq.flush(mockRolesResponse);

      expect(component.errorMessage()).toBe('USERS.LOAD_ERROR');
      expect(component.loading()).toBe(false);
    });
  });
});
