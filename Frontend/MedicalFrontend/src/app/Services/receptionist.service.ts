import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import {
  ReceptionistResponseDto,
  CreateReceptionistDto,
  UpdateReceptionistDto
} from '../interfaces/receptionist.interface';

@Injectable({
  providedIn: 'root'
})
export class ReceptionistService extends BaseService {
  private baseUrl = this.getBaseUrl('receptionists');

  // GET /api/receptionists  [Admin]
  getAll(): Observable<ReceptionistResponseDto[]> {
    return this.http.get<ReceptionistResponseDto[]>(this.baseUrl);
  }

  // GET /api/receptionists/{id}  [Admin]
  getById(id: number): Observable<ReceptionistResponseDto> {
    return this.http.get<ReceptionistResponseDto>(`${this.baseUrl}/${id}`);
  }

  // POST /api/receptionists  [Admin] — uses FormData
  create(dto: CreateReceptionistDto): Observable<ReceptionistResponseDto> {
    const formData = this.toFormData(dto);
    return this.http.post<ReceptionistResponseDto>(this.baseUrl, formData);
  }

  // PUT /api/receptionists/{id}  [Admin] — uses FormData
  update(id: number, dto: UpdateReceptionistDto): Observable<ReceptionistResponseDto> {
    const formData = this.toFormData(dto);
    return this.http.put<ReceptionistResponseDto>(`${this.baseUrl}/${id}`, formData);
  }

  // DELETE /api/receptionists/{id}  [Admin]
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

