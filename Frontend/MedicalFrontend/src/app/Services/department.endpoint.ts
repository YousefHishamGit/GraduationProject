import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import {
  DepartmentResponseDto,
  CreateDepartmentDto,
  UpdateDepartmentDto
} from '../interfaces/department.interface';
import { DoctorResponseDto } from '../interfaces/doctor.interface';

@Injectable({
  providedIn: 'root'
})
export class DepartmentEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('departments');

  // GET /api/departments
  getAll(): Observable<DepartmentResponseDto[]> {
    return this.http.get<DepartmentResponseDto[]>(this.baseUrl);
  }

  // GET /api/departments/{id}
  getById(id: number): Observable<DepartmentResponseDto> {
    return this.http.get<DepartmentResponseDto>(`${this.baseUrl}/${id}`);
  }

  // GET /api/departments/{id}/doctors
  getDoctors(id: number): Observable<DoctorResponseDto[]> {
    return this.http.get<DoctorResponseDto[]>(`${this.baseUrl}/${id}/doctors`);
  }

  // POST /api/departments  [Admin]
  create(dto: CreateDepartmentDto): Observable<DepartmentResponseDto> {
    return this.http.post<DepartmentResponseDto>(this.baseUrl, dto);
  }

  // PUT /api/departments/{id}  [Admin]
  update(id: number, dto: UpdateDepartmentDto): Observable<DepartmentResponseDto> {
    return this.http.put<DepartmentResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  // DELETE /api/departments/{id}  [Admin]
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

