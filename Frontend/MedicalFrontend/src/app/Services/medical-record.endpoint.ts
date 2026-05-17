import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import { MedicalRecordResponseDto, CreateMedicalRecordDto, UpdateMedicalRecordDto } from '../interfaces/medical-record.interface';

@Injectable({ providedIn: 'root' })
export class MedicalRecordEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('medical-records');

  getById(id: number): Observable<MedicalRecordResponseDto> {
    return this.http.get<MedicalRecordResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByAppointment(appointmentId: number): Observable<MedicalRecordResponseDto> {
    return this.http.get<MedicalRecordResponseDto>(`${this.baseUrl}/appointment/${appointmentId}`);
  }

  getByPatient(patientId: number): Observable<MedicalRecordResponseDto[]> {
    return this.http.get<MedicalRecordResponseDto[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  create(dto: CreateMedicalRecordDto): Observable<MedicalRecordResponseDto> {
    return this.http.post<MedicalRecordResponseDto>(this.baseUrl, dto);
  }
  update(id: number, dto: UpdateMedicalRecordDto): Observable<MedicalRecordResponseDto> {
    return this.http.put<MedicalRecordResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  uploadAttachment(id: number, file: File): Observable<MedicalRecordResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<MedicalRecordResponseDto>(`${this.baseUrl}/${id}/upload-attachment`, formData);
  }

  deleteAttachment(id: number): Observable<MedicalRecordResponseDto> {
    return this.http.delete<MedicalRecordResponseDto>(`${this.baseUrl}/${id}/remove-attachment`);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}