import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import {
  AppointmentResponseDto,
  CreateAppointmentDto,
  UpdateAppointmentDto,
  CancelAppointmentDto
} from '../interfaces/appointment.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService extends BaseService {
  private baseUrl = this.getBaseUrl('appointments');

  // GET /api/appointments  [Admin only]
  getAll(): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(this.baseUrl);
  }

  // GET /api/appointments/{id}  [Authorized]
  getById(id: number): Observable<AppointmentResponseDto> {
    return this.http.get<AppointmentResponseDto>(`${this.baseUrl}/${id}`);
  }

  // POST /api/appointments  [Patient]
  create(dto: CreateAppointmentDto): Observable<AppointmentResponseDto> {
    return this.http.post<AppointmentResponseDto>(this.baseUrl, dto);
  }

  // PUT /api/appointments/{id}  [Patient]
  update(id: number, dto: UpdateAppointmentDto): Observable<AppointmentResponseDto> {
    return this.http.put<AppointmentResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  // DELETE /api/appointments/{id}  [Patient]
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // PUT /api/appointments/{id}/confirm  [Doctor, Receptionist]
  confirm(id: number): Observable<AppointmentResponseDto> {
    return this.http.put<AppointmentResponseDto>(`${this.baseUrl}/${id}/confirm`, {});
  }

  // PUT /api/appointments/{id}/cancel  [Doctor, Receptionist]
  cancel(id: number, dto: CancelAppointmentDto): Observable<AppointmentResponseDto> {
    return this.http.put<AppointmentResponseDto>(`${this.baseUrl}/${id}/cancel`, dto);
  }

  // PUT /api/appointments/{id}/complete  [Doctor]
  complete(id: number): Observable<AppointmentResponseDto> {
    return this.http.put<AppointmentResponseDto>(`${this.baseUrl}/${id}/complete`, {});
  }

  // GET /api/appointments/doctor/{doctorId}  [Authorized]
  getByDoctor(doctorId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.baseUrl}/doctor/${doctorId}`);
  }

  // GET /api/appointments/patient/{patientId}  [Authorized]
  getByPatient(patientId: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.baseUrl}/patient/${patientId}`);
  }
}

