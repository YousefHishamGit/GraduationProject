import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import {
  MedicalRecordResponseDto,
  CreateMedicalRecordDto,
  UpdateMedicalRecordDto
} from '../interfaces/medical-record.interface';

@Injectable({
  providedIn: 'root'
})
export class MedicalRecordService extends BaseService {
  private baseUrl = this.getBaseUrl('medical-records');

  // GET /api/medical-records/{id}  [Authorized]
  getById(id: number): Observable<MedicalRecordResponseDto> {
    return this.http.get<MedicalRecordResponseDto>(`${this.baseUrl}/${id}`);
  }

  // POST /api/medical-records  [Doctor]
  create(dto: CreateMedicalRecordDto): Observable<MedicalRecordResponseDto> {
    return this.http.post<MedicalRecordResponseDto>(this.baseUrl, dto);
  }

  // PUT /api/medical-records/{id}  [Doctor]
  update(id: number, dto: UpdateMedicalRecordDto): Observable<MedicalRecordResponseDto> {
    return this.http.put<MedicalRecordResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  // GET /api/medical-records/appointment/{appointmentId}  [Authorized]
  getByAppointment(appointmentId: number): Observable<MedicalRecordResponseDto> {
    return this.http.get<MedicalRecordResponseDto>(`${this.baseUrl}/appointment/${appointmentId}`);
  }

  // GET /api/medical-records/patient/{patientId}  [Authorized]
  getByPatient(patientId: number): Observable<MedicalRecordResponseDto[]> {
    return this.http.get<MedicalRecordResponseDto[]>(`${this.baseUrl}/patient/${patientId}`);
  }
}

