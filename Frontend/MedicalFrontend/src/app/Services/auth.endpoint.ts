import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import {
  LoginDto,
  RegisterPatientDto,
  RegisterDoctorDto,
  RegisterAdminDto,
  AuthResponseDto
} from '../interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('auth');

  login(dto: LoginDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/login`, dto);
  }

  registerPatient(dto: RegisterPatientDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/register/patient`, dto);
  }

  registerDoctor(dto: RegisterDoctorDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/register/doctor`, dto);
  }

  registerAdmin(dto: RegisterAdminDto): Observable<AuthResponseDto> {
    return this.http.post<AuthResponseDto>(`${this.baseUrl}/register/admin`, dto);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }
}