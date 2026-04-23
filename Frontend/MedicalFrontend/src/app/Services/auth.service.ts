import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LoginDto,
  RegisterPatientDto,
  RegisterDoctorDto,
  AuthResponseDto
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

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
