import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PatientResponseDto, UpdatePatientDto } from '../interfaces/patient.interface';
import { AppointmentResponseDto } from '../interfaces/appointment.interface';
import { MedicalRecordResponseDto } from '../interfaces/medical-record.interface';
import { PrescriptionResponseDto } from '../interfaces/prescription.interface';
import { LabRequestResponseDto } from '../interfaces/lab-request.interface';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private baseUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  // GET /api/patients
  getAll(): Observable<PatientResponseDto[]> {
    return this.http.get<PatientResponseDto[]>(this.baseUrl);
  }

  // GET /api/patients/{id}
  getById(id: number): Observable<PatientResponseDto> {
    return this.http.get<PatientResponseDto>(`${this.baseUrl}/${id}`);
  }

  // PUT /api/patients/{id}
  update(id: number, dto: UpdatePatientDto): Observable<PatientResponseDto> {
    return this.http.put<PatientResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  // GET /api/patients/{id}/appointments
  getAppointments(id: number): Observable<AppointmentResponseDto[]> {
    return this.http.get<AppointmentResponseDto[]>(`${this.baseUrl}/${id}/appointments`);
  }

  // GET /api/patients/{id}/medical-records
  getMedicalRecords(id: number): Observable<MedicalRecordResponseDto[]> {
    return this.http.get<MedicalRecordResponseDto[]>(`${this.baseUrl}/${id}/medical-records`);
  }

  // GET /api/patients/{id}/prescriptions
  getPrescriptions(id: number): Observable<PrescriptionResponseDto[]> {
    return this.http.get<PrescriptionResponseDto[]>(`${this.baseUrl}/${id}/prescriptions`);
  }

  // GET /api/patients/{id}/lab-requests
  getLabRequests(id: number): Observable<LabRequestResponseDto[]> {
    return this.http.get<LabRequestResponseDto[]>(`${this.baseUrl}/${id}/lab-requests`);
  }
}
