import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SidebarComponent } from './sidebar';
import { PermissionService } from '@core/services/permission.service';
import { SchoolService } from '@core/services/school.service';

describe('SidebarComponent', () => {
  let permissionServiceMock: {
    hasAnyPermission: ReturnType<typeof vi.fn>;
    hasRole: ReturnType<typeof vi.fn>;
  };

  let schoolServiceMock: {
    isSuperAdmin: ReturnType<typeof vi.fn>;
    hasMultipleSchools: ReturnType<typeof vi.fn>;
    currentSchoolId: ReturnType<typeof vi.fn>;
    selectedSchool: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    permissionServiceMock = {
      hasAnyPermission: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(false),
    };

    schoolServiceMock = {
      isSuperAdmin: vi.fn().mockReturnValue(false),
      hasMultipleSchools: vi.fn().mockReturnValue(false),
      currentSchoolId: vi.fn().mockReturnValue(null),
      selectedSchool: vi.fn().mockReturnValue(null),
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: PermissionService, useValue: permissionServiceMock },
        { provide: SchoolService, useValue: schoolServiceMock },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render navigation items', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const links = el.querySelectorAll('nav a');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render app name', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('h3')).toBeTruthy();
  });

  it('should emit closed event on close', () => {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();

    let emitted = false;
    fixture.componentInstance.closed.subscribe(() => (emitted = true));
    fixture.componentInstance.close();

    expect(emitted).toBe(true);
  });

  it('should filter nav items based on permissions', () => {
    permissionServiceMock.hasAnyPermission.mockReturnValue(false);
    permissionServiceMock.hasRole.mockReturnValue(false);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const links = el.querySelectorAll('nav a');
    // Only items with no permissions/roles filter render (Notifications)
    expect(links.length).toBe(1);
  });

  it('should show all items when user has all permissions and roles', () => {
    permissionServiceMock.hasAnyPermission.mockReturnValue(true);
    permissionServiceMock.hasRole.mockReturnValue(true);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const links = el.querySelectorAll('nav a');
    expect(links.length).toBe(17);
  });

  it('should hide parent portal for non-guardian users', () => {
    permissionServiceMock.hasAnyPermission.mockReturnValue(true);
    permissionServiceMock.hasRole.mockReturnValue(false);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const links = el.querySelectorAll('nav a');
    // 16 items — all permission-based items + Notifications (no filter), but Parent Portal (role-gated) is hidden
    expect(links.length).toBe(16);
  });

  it('should render school name as link when user has multiple schools', () => {
    schoolServiceMock.hasMultipleSchools.mockReturnValue(true);
    schoolServiceMock.selectedSchool.mockReturnValue({ id: 's1', name: 'Test School' });
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const link = el.querySelector('a[href="/schools"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain('Test School');
  });

  it('should render school name as link for super admin', () => {
    schoolServiceMock.isSuperAdmin.mockReturnValue(true);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const link = el.querySelector('a[href="/schools"]');
    expect(link).toBeTruthy();
  });

  it('should render school name as plain text for single-school user', () => {
    schoolServiceMock.isSuperAdmin.mockReturnValue(false);
    schoolServiceMock.hasMultipleSchools.mockReturnValue(false);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const link = el.querySelector('a[href="/schools"]');
    expect(link).toBeNull();
    expect(el.querySelector('h3')).toBeTruthy();
  });

  it('should have accessible label on the back-to-schools link', () => {
    schoolServiceMock.hasMultipleSchools.mockReturnValue(true);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const link = el.querySelector('a[href="/schools"]');
    expect(link?.getAttribute('aria-label')).toBeTruthy();
  });
});
