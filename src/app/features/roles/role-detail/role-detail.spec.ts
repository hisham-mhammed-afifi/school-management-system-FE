import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { RoleDetailComponent } from './role-detail';

describe('RoleDetailComponent', () => {
  let fixture: ComponentFixture<RoleDetailComponent>;
  let component: RoleDetailComponent;
  let httpTesting: HttpTestingController;

  const mockRole = {
    id: 'role-1',
    name: 'admin',
    schoolId: null,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    permissions: [{ id: 'p1', module: 'users', action: 'read', name: 'Read Users' }],
  };

  const mockPermissions = [
    { id: 'p1', module: 'users', action: 'read', name: 'Read Users' },
    { id: 'p2', module: 'users', action: 'write', name: 'Write Users' },
    { id: 'p3', module: 'roles', action: 'read', name: 'Read Roles' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map([['id', 'role-1']]) } },
        },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RoleDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const roleReq = httpTesting.expectOne('/api/v1/roles/role-1');
    roleReq.flush({ success: true, data: mockRole });

    const permsReq = httpTesting.expectOne('/api/v1/permissions');
    permsReq.flush({ success: true, data: mockPermissions });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load role and permissions on init', () => {
    fixture.detectChanges();
    flushInitialRequests();

    expect(component.role()!.name).toBe('admin');
    expect(component.allPermissions().length).toBe(3);
    expect(component.loading()).toBe(false);
  });

  it('should initialize selected permissions from role', () => {
    fixture.detectChanges();
    flushInitialRequests();

    expect(component.selectedPermissionIds().has('p1')).toBe(true);
    expect(component.selectedPermissionIds().has('p2')).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const roleReq = httpTesting.expectOne('/api/v1/roles/role-1');
    roleReq.flush(null, { status: 500, statusText: 'Server Error' });

    const permsReq = httpTesting.expectOne('/api/v1/permissions');
    permsReq.flush({ success: true, data: mockPermissions });

    expect(component.error()).toBe('ROLES.LOAD_ERROR');
  });

  it('should group permissions by module', () => {
    fixture.detectChanges();
    flushInitialRequests();

    const groups = component.permissionGroups();
    expect(groups.length).toBe(2);

    const rolesGroup = groups.find((g) => g.module === 'roles');
    const usersGroup = groups.find((g) => g.module === 'users');
    expect(rolesGroup!.permissions.length).toBe(1);
    expect(usersGroup!.permissions.length).toBe(2);
  });

  it('should toggle individual permission', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.togglePermission('p2');
    expect(component.selectedPermissionIds().has('p2')).toBe(true);
    expect(component.dirty()).toBe(true);

    component.togglePermission('p2');
    expect(component.selectedPermissionIds().has('p2')).toBe(false);
  });

  it('should toggle entire module', () => {
    fixture.detectChanges();
    flushInitialRequests();

    const usersGroup = component.permissionGroups().find((g) => g.module === 'users')!;

    // p1 is checked, p2 is not → toggleModule should check all
    component.toggleModule(usersGroup);
    expect(component.selectedPermissionIds().has('p1')).toBe(true);
    expect(component.selectedPermissionIds().has('p2')).toBe(true);

    // Now all checked → toggleModule should uncheck all
    component.toggleModule(usersGroup);
    expect(component.selectedPermissionIds().has('p1')).toBe(false);
    expect(component.selectedPermissionIds().has('p2')).toBe(false);
  });

  it('should check module fully/partially checked status', () => {
    fixture.detectChanges();
    flushInitialRequests();

    const usersGroup = component.permissionGroups().find((g) => g.module === 'users')!;

    // p1 is checked, p2 is not → partially checked
    expect(component.isModuleFullyChecked(usersGroup)).toBe(false);
    expect(component.isModulePartiallyChecked(usersGroup)).toBe(true);

    // Check p2 too
    component.togglePermission('p2');
    expect(component.isModuleFullyChecked(usersGroup)).toBe(true);
    expect(component.isModulePartiallyChecked(usersGroup)).toBe(false);
  });

  it('should save permissions', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.togglePermission('p2');
    component.savePermissions();

    const req = httpTesting.expectOne('/api/v1/roles/role-1/permissions');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.permissionIds).toContain('p1');
    expect(req.request.body.permissionIds).toContain('p2');
    req.flush({ success: true, data: { ...mockRole, permissions: mockPermissions.slice(0, 2) } });

    expect(component.dirty()).toBe(false);
    expect(component.saving()).toBe(false);
  });

  it('should detect seed role', () => {
    fixture.detectChanges();

    const roleReq = httpTesting.expectOne('/api/v1/roles/role-1');
    roleReq.flush({
      success: true,
      data: { ...mockRole, name: 'super_admin' },
    });

    const permsReq = httpTesting.expectOne('/api/v1/permissions');
    permsReq.flush({ success: true, data: mockPermissions });

    expect(component.isSeedRole()).toBe(true);
  });
});
