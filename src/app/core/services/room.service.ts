import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type { Room, CreateRoomRequest, UpdateRoomRequest, ListRoomsQuery } from '@core/models/room';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly http = inject(HttpClient);

  list(query: ListRoomsQuery = {}): Observable<PaginatedResponse<Room>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.roomType) params = params.set('roomType', query.roomType);
    if (query.building) params = params.set('building', query.building);

    return this.http.get<PaginatedResponse<Room>>('/api/v1/rooms', { params });
  }

  get(id: string): Observable<ApiResponse<Room>> {
    return this.http.get<ApiResponse<Room>>(`/api/v1/rooms/${id}`);
  }

  create(data: CreateRoomRequest): Observable<ApiResponse<Room>> {
    return this.http.post<ApiResponse<Room>>('/api/v1/rooms', data);
  }

  update(id: string, data: UpdateRoomRequest): Observable<ApiResponse<Room>> {
    return this.http.patch<ApiResponse<Room>>(`/api/v1/rooms/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/rooms/${id}`);
  }
}
