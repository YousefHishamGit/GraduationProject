import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import {
  LoginDto,
  RegisterPatientDto,
  RegisterDoctorDto,
  AuthResponseDto
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('auth');

  // POST /api/auth/register/patient
  registerPatient(dto: RegisterPatientDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/register/patient`, dto);
  }

  // POST /api/auth/register/doctor  [Admin only]
  registerDoctor(dto: RegisterDoctorDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/register/doctor`, dto);
  }

  // POST /api/auth/login
  login(dto: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/login`, dto);
  }

  // POST /api/auth/logout  [Authorized]
  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/logout`, {});
  }
}

