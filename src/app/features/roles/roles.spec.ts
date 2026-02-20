import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { RolesComponent } from './roles';

describe('RolesComponent', () => {
  let fixture: ComponentFixture<RolesComponent>;
  let component: RolesComponent;
  let httpTesting: HttpTestingController;

  const mockRolesResponse = {
    success: true,
    data: [
      {
        id: 'r1',
        name: 'super_admin',
        schoolId: null,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        permissions: [{ id: 'p1', module: 'users', action: 'read', name: 'Read Users' }],
      },
      {
        id: 'r2',
        name: 'custom_role',
        schoolId: null,
        createdAt: '2025-01-01',
        updatedAt: '2025-01-01',
        permissions: [],
      },
    ],
    meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(RolesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequest(): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    req.flush(mockRolesResponse);
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequest();
    expect(component).toBeTruthy();
  });

  it('should load roles on init', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    expect(req.request.method).toBe('GET');
    req.flush(mockRolesResponse);

    expect(component.roles().length).toBe(2);
    expect(component.loading()).toBe(false);
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('ROLES.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should identify seed roles', () => {
    expect(component.isSeedRole('super_admin')).toBe(true);
    expect(component.isSeedRole('teacher')).toBe(true);
    expect(component.isSeedRole('custom_role')).toBe(false);
  });

  it('should filter by search', () => {
    fixture.detectChanges();
    flushInitialRequest();

    component.onSearch({ target: { value: 'admin' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    expect(req.request.params.get('search')).toBe('admin');
    req.flush(mockRolesResponse);

    expect(component.query().search).toBe('admin');
    expect(component.query().page).toBe(1);
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    flushInitialRequest();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    expect(req.request.params.get('page')).toBe('2');
    req.flush(mockRolesResponse);

    expect(component.query().page).toBe(2);
  });

  it('should delete a role', () => {
    fixture.detectChanges();
    flushInitialRequest();

    component.confirmDelete({
      id: 'r2',
      name: 'custom_role',
      schoolId: null,
      createdAt: '',
      updatedAt: '',
    });
    component.deleteRole();

    const deleteReq = httpTesting.expectOne('/api/v1/roles/r2');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null, { status: 204, statusText: 'No Content' });

    // Should reload roles after delete
    const reloadReq = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    reloadReq.flush(mockRolesResponse);
  });

  it('should render role cards when data is loaded', () => {
    fixture.detectChanges();
    flushInitialRequest();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('super_admin');
    expect(el.textContent).toContain('custom_role');
  });
});
