import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { PermissionService } from './permission.service';
import { AuthService } from './auth.service';
import type { AuthUser } from '@core/models/auth';

describe('PermissionService', () => {
  let service: PermissionService;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(PermissionService);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when no user is logged in', () => {
    expect(service.hasPermission('students.list')).toBe(false);
    expect(service.hasAnyPermission('students.list', 'students.create')).toBe(false);
    expect(service.hasRole('admin')).toBe(false);
  });

  describe('with authenticated user', () => {
    beforeEach(() => {
      const user: AuthUser = {
        id: 'u-1',
        email: 'test@example.com',
        roles: ['school_admin', 'teacher'],
        permissions: ['students.list', 'students.create', 'teachers.list'],
        schoolId: 's-1',
        schools: [{ id: 's-1', name: 'Test School' }],
      };
      // Access private signal for testing
      (authService as unknown as { _user: { set: (v: AuthUser) => void } })._user.set(user);
    });

    it('should check single permission', () => {
      expect(service.hasPermission('students.list')).toBe(true);
      expect(service.hasPermission('students.delete')).toBe(false);
    });

    it('should check any permission', () => {
      expect(service.hasAnyPermission('students.delete', 'students.list')).toBe(true);
      expect(service.hasAnyPermission('roles.list', 'roles.create')).toBe(false);
    });

    it('should check role', () => {
      expect(service.hasRole('school_admin')).toBe(true);
      expect(service.hasRole('super_admin')).toBe(false);
    });
  });

  describe('super admin', () => {
    beforeEach(() => {
      const user: AuthUser = {
        id: 'u-2',
        email: 'admin@example.com',
        roles: ['super_admin'],
        permissions: [],
        schoolId: null,
        schools: [],
      };
      (authService as unknown as { _user: { set: (v: AuthUser) => void } })._user.set(user);
    });

    it('should grant all permissions to super admin', () => {
      expect(service.hasPermission('students.list')).toBe(true);
      expect(service.hasPermission('anything.at.all')).toBe(true);
    });

    it('should grant any permission to super admin', () => {
      expect(service.hasAnyPermission('roles.delete', 'users.create')).toBe(true);
    });

    it('should report isSuperAdmin', () => {
      expect(service.isSuperAdmin()).toBe(true);
    });
  });
});
