import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ReceptionistResponseDto,
  CreateReceptionistDto,
  UpdateReceptionistDto
} from '../interfaces/receptionist.interface';

@Injectable({
  providedIn: 'root'
})
export class ReceptionistService {
  private baseUrl = `${environment.apiUrl}/receptionists`;

  constructor(private http: HttpClient) {}

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
    const formData = new FormData();
    Object.keys(dto).forEach(key => {
      const value = (dto as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return this.http.post<ReceptionistResponseDto>(this.baseUrl, formData);
  }

  // PUT /api/receptionists/{id}  [Admin] — uses FormData
  update(id: number, dto: UpdateReceptionistDto): Observable<ReceptionistResponseDto> {
    const formData = new FormData();
    Object.keys(dto).forEach(key => {
      const value = (dto as any)[key];
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    return this.http.put<ReceptionistResponseDto>(`${this.baseUrl}/${id}`, formData);
  }

  // DELETE /api/receptionists/{id}  [Admin]
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
