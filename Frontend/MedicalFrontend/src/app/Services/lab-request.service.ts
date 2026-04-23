import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LabRequestResponseDto,
  CreateLabRequestDto,
  UpdateLabRequestDto,
  UploadLabResultDto
} from '../interfaces/lab-request.interface';

@Injectable({
  providedIn: 'root'
})
export class LabRequestService {
  private baseUrl = `${environment.apiUrl}/lab-requests`;

  constructor(private http: HttpClient) {}

  // GET /api/lab-requests/{id}  [Authorized]
  getById(id: number): Observable<LabRequestResponseDto> {
    return this.http.get<LabRequestResponseDto>(`${this.baseUrl}/${id}`);
  }

  // GET /api/lab-requests/medical-record/{medicalRecordId}  [Authorized]
  getByMedicalRecord(medicalRecordId: number): Observable<LabRequestResponseDto[]> {
    return this.http.get<LabRequestResponseDto[]>(`${this.baseUrl}/medical-record/${medicalRecordId}`);
  }

  // GET /api/lab-requests/patient/{patientId}  [Authorized]
  getByPatient(patientId: number): Observable<LabRequestResponseDto[]> {
    return this.http.get<LabRequestResponseDto[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  // POST /api/lab-requests  [Doctor]
  create(dto: CreateLabRequestDto): Observable<LabRequestResponseDto> {
    return this.http.post<LabRequestResponseDto>(this.baseUrl, dto);
  }

  // PUT /api/lab-requests/{id}  [Doctor]
  update(id: number, dto: UpdateLabRequestDto): Observable<LabRequestResponseDto> {
    return this.http.put<LabRequestResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  // PUT /api/lab-requests/{id}/upload-result  [Doctor]
  uploadResult(id: number, dto: UploadLabResultDto): Observable<LabRequestResponseDto> {
    return this.http.put<LabRequestResponseDto>(`${this.baseUrl}/${id}/upload-result`, dto);
  }
}
