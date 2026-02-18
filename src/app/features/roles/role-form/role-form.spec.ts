import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { RoleFormComponent } from './role-form';

describe('RoleFormComponent', () => {
  let fixture: ComponentFixture<RoleFormComponent>;
  let component: RoleFormComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  function setupTestBed(routeId: string | null): void {
    const paramMap = new Map<string, string>();
    if (routeId) {
      paramMap.set('id', routeId);
    }

    TestBed.configureTestingModule({
      imports: [RoleFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap } },
        },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  }

  describe('create mode', () => {
    beforeEach(async () => {
      setupTestBed(null);
      await router.navigateByUrl('/schools/test-school/roles/new');
      fixture = TestBed.createComponent(RoleFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    it('should create in create mode', () => {
      expect(component).toBeTruthy();
      expect(component.isEdit()).toBe(false);
    });

    it('should require name', () => {
      component.onSubmit();
      expect(component.form.controls.name.errors?.['required']).toBeTruthy();
    });

    it('should submit create request', () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.patchValue({ name: 'new-role' });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/roles');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'new-role' });
      req.flush({ success: true, data: { id: 'new-id', name: 'new-role' } });

      expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'test-school', 'roles', 'new-id']);
    });

    it('should handle create error', () => {
      component.form.patchValue({ name: 'new-role' });
      component.onSubmit();

      const req = httpTesting.expectOne('/api/v1/roles');
      req.flush(
        { success: false, error: { code: 'CONFLICT', message: 'Role exists' } },
        { status: 409, statusText: 'Conflict' },
      );

      expect(component.errorMessage()).toBe('Role exists');
      expect(component.saving()).toBe(false);
    });
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      setupTestBed('role-1');
      await router.navigateByUrl('/schools/test-school/roles/role-1/edit');
      fixture = TestBed.createComponent(RoleFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTesting.verify();
    });

    it('should load role data in edit mode', () => {
      const req = httpTesting.expectOne('/api/v1/roles/role-1');
      req.flush({
        success: true,
        data: { id: 'role-1', name: 'custom_role', schoolId: null, createdAt: '', updatedAt: '' },
      });

      expect(component.isEdit()).toBe(true);
      expect(component.form.value.name).toBe('custom_role');
      expect(component.isSeedRole()).toBe(false);
    });

    it('should detect seed role and prevent editing', () => {
      const req = httpTesting.expectOne('/api/v1/roles/role-1');
      req.flush({
        success: true,
        data: { id: 'role-1', name: 'super_admin', schoolId: null, createdAt: '', updatedAt: '' },
      });

      expect(component.isSeedRole()).toBe(true);

      component.onSubmit();
      httpTesting.expectNone('/api/v1/roles/role-1');
    });

    it('should submit update request', () => {
      const getReq = httpTesting.expectOne('/api/v1/roles/role-1');
      getReq.flush({
        success: true,
        data: { id: 'role-1', name: 'custom_role', schoolId: null, createdAt: '', updatedAt: '' },
      });

      const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

      component.form.patchValue({ name: 'updated-role' });
      component.onSubmit();

      const updateReq = httpTesting.expectOne('/api/v1/roles/role-1');
      expect(updateReq.request.method).toBe('PATCH');
      expect(updateReq.request.body).toEqual({ name: 'updated-role' });
      updateReq.flush({ success: true, data: { id: 'role-1', name: 'updated-role' } });

      expect(navigateSpy).toHaveBeenCalledWith(['/schools', 'test-school', 'roles', 'role-1']);
    });

    it('should show error when role load fails', () => {
      const req = httpTesting.expectOne('/api/v1/roles/role-1');
      req.flush(null, { status: 404, statusText: 'Not Found' });

      expect(component.errorMessage()).toBe('ROLES.LOAD_ERROR');
      expect(component.loading()).toBe(false);
    });
  });
});
