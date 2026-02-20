import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SidebarComponent } from './sidebar';
import { PermissionService } from '@core/services/permission.service';

describe('SidebarComponent', () => {
  let permissionServiceMock: {
    hasAnyPermission: ReturnType<typeof vi.fn>;
    hasRole: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    permissionServiceMock = {
      hasAnyPermission: vi.fn().mockReturnValue(true),
      hasRole: vi.fn().mockReturnValue(false),
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: PermissionService, useValue: permissionServiceMock },
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
    // No items should render — permissions denied and role not matched
    expect(links.length).toBe(0);
  });

  it('should show all items when user has all permissions and roles', () => {
    permissionServiceMock.hasAnyPermission.mockReturnValue(true);
    permissionServiceMock.hasRole.mockReturnValue(true);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const links = el.querySelectorAll('nav a');
    expect(links.length).toBe(16);
  });

  it('should hide parent portal for non-guardian users', () => {
    permissionServiceMock.hasAnyPermission.mockReturnValue(true);
    permissionServiceMock.hasRole.mockReturnValue(false);
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const links = el.querySelectorAll('nav a');
    // 15 items — all permission-based items pass, but Parent Portal (role-gated) is hidden
    expect(links.length).toBe(15);
  });
});
