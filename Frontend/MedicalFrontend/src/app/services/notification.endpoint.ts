import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';

export interface NotificationResponseDto {
  id: number;
  patientId: number;
  message: string;
  isRead: boolean;
  createdOn: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('notifications');

  getByPatient(patientId: number): Observable<NotificationResponseDto[]> {
    return this.http.get<NotificationResponseDto[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  getUnreadCount(patientId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/unread-count/${patientId}`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(patientId: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/read-all/${patientId}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  clearAll(patientId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/clear-all/${patientId}`);
  }
}
