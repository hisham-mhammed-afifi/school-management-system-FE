import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
  SetPermissionsRequest,
  ListRolesQuery,
} from '@core/models/role';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly http = inject(HttpClient);

  list(query: ListRolesQuery = {}): Observable<PaginatedResponse<Role>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<Role>>('/api/v1/roles', { params });
  }

  get(id: string): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`/api/v1/roles/${id}`);
  }

  create(data: CreateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>('/api/v1/roles', data);
  }

  update(id: string, data: UpdateRoleRequest): Observable<ApiResponse<Role>> {
    return this.http.patch<ApiResponse<Role>>(`/api/v1/roles/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/roles/${id}`);
  }

  setPermissions(roleId: string, data: SetPermissionsRequest): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`/api/v1/roles/${roleId}/permissions`, data);
  }

  listPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>('/api/v1/permissions');
  }
}
