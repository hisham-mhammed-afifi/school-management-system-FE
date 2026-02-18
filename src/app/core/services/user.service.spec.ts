import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list users', () => {
    service.list({ page: 1, limit: 10 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } });
  });

  it('should list users with search filter', () => {
    service.list({ search: 'test' }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/users');
    expect(req.request.params.get('search')).toBe('test');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a user by id', () => {
    service.get('user-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/users/user-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'user-1' } });
  });

  it('should create a user', () => {
    const body = { email: 'new@test.com', password: 'password123', roleIds: ['r1'] };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ success: true, data: { id: 'new-id' } });
  });

  it('should update a user', () => {
    service.update('user-1', { email: 'updated@test.com' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/users/user-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ success: true, data: { id: 'user-1' } });
  });

  it('should deactivate a user', () => {
    service.deactivate('user-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/users/user-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('should assign a role to a user', () => {
    service.assignRole('user-1', { roleId: 'role-1' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/users/user-1/roles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ roleId: 'role-1' });
    req.flush({ success: true, data: { id: 'user-1' } });
  });

  it('should remove a role from a user', () => {
    service.removeRole('user-1', 'role-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/users/user-1/roles/role-1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
