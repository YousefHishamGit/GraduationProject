import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import { ReviewResponseDto, CreateReviewDto, UpdateReviewDto } from '../interfaces/review.interface';

@Injectable({ providedIn: 'root' })
export class ReviewEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('reviews');

  getByDoctor(doctorId: number): Observable<ReviewResponseDto[]> {
    return this.http.get<ReviewResponseDto[]>(`${this.baseUrl}/doctor/${doctorId}`);
  }

  getByPatient(patientId: number): Observable<ReviewResponseDto[]> {
    return this.http.get<ReviewResponseDto[]>(`${this.baseUrl}/patient/${patientId}`);
  }

  create(dto: CreateReviewDto): Observable<ReviewResponseDto> {
    return this.http.post<ReviewResponseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateReviewDto): Observable<ReviewResponseDto> {
    return this.http.put<ReviewResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}