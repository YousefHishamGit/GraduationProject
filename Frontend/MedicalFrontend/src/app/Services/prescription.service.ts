import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PrescriptionResponseDto,
  CreatePrescriptionDto,
  UpdatePrescriptionDto
} from '../interfaces/prescription.interface';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private baseUrl = `${environment.apiUrl}/prescriptions`;

  constructor(private http: HttpClient) {}

  // GET /api/prescriptions/{id}  [Authorized]
  getById(id: number): Observable<PrescriptionResponseDto> {
    return this.http.get<PrescriptionResponseDto>(`${this.baseUrl}/${id}`);
  }

  // POST /api/prescriptions  [Doctor]
  create(dto: CreatePrescriptionDto): Observable<PrescriptionResponseDto> {
    return this.http.post<PrescriptionResponseDto>(this.baseUrl, dto);
  }

  // PUT /api/prescriptions/{id}  [Doctor]
  update(id: number, dto: UpdatePrescriptionDto): Observable<PrescriptionResponseDto> {
    return this.http.put<PrescriptionResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  // DELETE /api/prescriptions/{id}  [Doctor]
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // GET /api/prescriptions/medical-record/{id}  [Authorized]
  getByMedicalRecord(medicalRecordId: number): Observable<PrescriptionResponseDto[]> {
    return this.http.get<PrescriptionResponseDto[]>(`${this.baseUrl}/medical-record/${medicalRecordId}`);
  }
}
