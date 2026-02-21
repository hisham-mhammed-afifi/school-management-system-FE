import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  Notification,
  SendNotificationRequest,
  ListNotificationsQuery,
  UnreadCountResponse,
} from '@core/models/notification';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);

  list(query: ListNotificationsQuery = {}): Observable<PaginatedResponse<Notification>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.isRead !== undefined) params = params.set('isRead', query.isRead);
    if (query.channel) params = params.set('channel', query.channel);

    return this.http.get<PaginatedResponse<Notification>>('/api/v1/notifications', { params });
  }

  getUnreadCount(): Observable<ApiResponse<UnreadCountResponse>> {
    return this.http.get<ApiResponse<UnreadCountResponse>>('/api/v1/notifications/unread-count');
  }

  markAsRead(id: string): Observable<ApiResponse<Notification>> {
    return this.http.post<ApiResponse<Notification>>(`/api/v1/notifications/${id}/read`, {});
  }

  markAllAsRead(): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>('/api/v1/notifications/read-all', {});
  }

  send(data: SendNotificationRequest): Observable<ApiResponse<{ message: string }>> {
    return this.http.post<ApiResponse<{ message: string }>>('/api/v1/notifications/send', data);
  }
}
