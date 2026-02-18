import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(RoleService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list roles', () => {
    service.list({ page: 1, limit: 20 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/roles');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a role by id', () => {
    service.get('role-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/roles/role-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'role-1', name: 'admin' } });
  });

  it('should create a role', () => {
    service.create({ name: 'new-role' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/roles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'new-role' });
    req.flush({ success: true, data: { id: 'new-id', name: 'new-role' } });
  });

  it('should update a role', () => {
    service.update('role-1', { name: 'updated-role' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/roles/role-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ success: true, data: { id: 'role-1', name: 'updated-role' } });
  });

  it('should delete a role', () => {
    service.delete('role-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/roles/role-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should set permissions on a role', () => {
    service.setPermissions('role-1', { permissionIds: ['p1', 'p2'] }).subscribe();

    const req = httpTesting.expectOne('/api/v1/roles/role-1/permissions');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ permissionIds: ['p1', 'p2'] });
    req.flush({ success: true, data: { id: 'role-1' } });
  });

  it('should list all permissions', () => {
    service.listPermissions().subscribe();

    const req = httpTesting.expectOne('/api/v1/permissions');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
