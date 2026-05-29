import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import { PatientResponseDto, UpdatePatientDto } from '../interfaces/patient.interface';

@Injectable({ providedIn: 'root' })
export class PatientEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('patients');

  getAll(): Observable<PatientResponseDto[]> {
    return this.http.get<PatientResponseDto[]>(this.baseUrl);
  }

  getById(id: number): Observable<PatientResponseDto> {
    return this.http.get<PatientResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByUserId(userId: string): Observable<PatientResponseDto> {
    return this.http.get<PatientResponseDto>(`${this.baseUrl}/by-user/${userId}`);
  }

  update(id: number, dto: UpdatePatientDto): Observable<PatientResponseDto> {
    return this.http.put<PatientResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  uploadProfileImage(id: number, image: File): Observable<PatientResponseDto> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<PatientResponseDto>(`${this.baseUrl}/${id}/profile-image`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}