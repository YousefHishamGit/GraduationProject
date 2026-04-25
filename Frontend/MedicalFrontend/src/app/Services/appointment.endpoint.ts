import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import {
  AppointmentResponseDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CancelAppointmentDto
} from '../interfaces/appointment.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentEndpoint extends BaseEndpoint {  // ← ناقص ده

  private baseUrl = this.getBaseUrl('appointments');

  getAll(): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<AppointmentResponseDto> {
    return this.http.get<AppointmentResponseDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateAppointmentDto): Observable<AppointmentResponseDto> {
    return this.http.post<AppointmentResponseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateAppointmentDto): Observable<AppointmentResponseDto> {
    return this.http.put<AppointmentResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  confirm(id: number): Observable<AppointmentResponseDto> {
    return this.http.put<AppointmentResponseDto>(`${this.baseUrl}/${id}/confirm`, {});
  }

  cancel(id: number, dto: CancelAppointmentDto): Observable<AppointmentResponseDto> {
    return this.http.put<AppointmentResponseDto>(`${this.baseUrl}/${id}/cancel`, dto);
  }

  complete(id: number): Observable<AppointmentResponseDto> {
    return this.http.put<AppointmentResponseDto>(`${this.baseUrl}/${id}/complete`, {});
  }

  getByDoctor(doctorId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.baseUrl}/doctor/${doctorId}`);
  }

  getByPatient(patientId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.baseUrl}/patient/${patientId}`);
  }
}