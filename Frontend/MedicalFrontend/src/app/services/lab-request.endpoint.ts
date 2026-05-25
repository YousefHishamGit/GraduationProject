import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import { LabRequestResponseDto, CreateLabRequestDto, UpdateLabRequestDto, UploadLabResultDto } from '../interfaces/lab-request.interface';

@Injectable({ providedIn: 'root' })
export class LabRequestEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('lab-requests');

  getById(id: number): Observable<LabRequestResponseDto> {
    return this.http.get<LabRequestResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByMedicalRecord(medicalRecordId: number): Observable<LabRequestResponseDto[]> {
    return this.http.get<LabRequestResponseDto[]>(`${this.baseUrl}/medical-record/${medicalRecordId}`);
  }

  getByPatient(patientId: number): Observable<LabRequestResponseDto[]> {
    return this.http.get<LabRequestResponseDto[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  create(dto: CreateLabRequestDto): Observable<LabRequestResponseDto> {
    return this.http.post<LabRequestResponseDto>(this.baseUrl, dto);
  }

  doctorRequestLabTest(patientId: number, testName: string): Observable<LabRequestResponseDto> {
    return this.http.post<LabRequestResponseDto>(`${this.baseUrl}/doctor-request`, { patientId, testName });
  }

  update(id: number, dto: UpdateLabRequestDto): Observable<LabRequestResponseDto> {
    return this.http.put<LabRequestResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  uploadResult(id: number, dto: UploadLabResultDto): Observable<LabRequestResponseDto> {
    return this.http.put<LabRequestResponseDto>(`${this.baseUrl}/${id}/upload-result`, dto);
  }

  uploadResultFile(id: number, file: File): Observable<LabRequestResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<LabRequestResponseDto>(`${this.baseUrl}/${id}/upload-result-file`, formData);
  }

  uploadPatientLabResult(patientId: number, testName: string, file: File): Observable<LabRequestResponseDto> {
    const formData = new FormData();
    formData.append('patientId', patientId.toString());
    formData.append('testName', testName);
    formData.append('file', file);
    return this.http.post<LabRequestResponseDto>(`${this.baseUrl}/patient-upload`, formData);
  }
}