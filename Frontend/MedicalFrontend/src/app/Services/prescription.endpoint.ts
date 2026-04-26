import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import {
  PrescriptionResponseDto,
  CreatePrescriptionDto,
  UpdatePrescriptionDto
} from '../interfaces/prescription.interface';

@Injectable({ providedIn: 'root' })
export class PrescriptionEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('prescriptions');

  getById(id: number): Observable<PrescriptionResponseDto> {
    return this.http.get<PrescriptionResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByMedicalRecord(medicalRecordId: number): Observable<PrescriptionResponseDto[]> {
    return this.http.get<PrescriptionResponseDto[]>(`${this.baseUrl}/medical-record/${medicalRecordId}`);
  }

  getByPatient(patientId: number): Observable<PrescriptionResponseDto[]> {
    return this.http.get<PrescriptionResponseDto[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  create(dto: CreatePrescriptionDto): Observable<PrescriptionResponseDto> {
    return this.http.post<PrescriptionResponseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdatePrescriptionDto): Observable<PrescriptionResponseDto> {
    return this.http.put<PrescriptionResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}