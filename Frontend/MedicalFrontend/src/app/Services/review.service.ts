import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ReviewResponseDto,
  CreateReviewDto,
  UpdateReviewDto
} from '../interfaces/review.interface';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  // POST /api/reviews  [Patient]
  create(dto: CreateReviewDto): Observable<ReviewResponseDto> {
    return this.http.post<ReviewResponseDto>(this.baseUrl, dto);
  }

  // PUT /api/reviews/{id}  [Patient]
  update(id: number, dto: UpdateReviewDto): Observable<ReviewResponseDto> {
    return this.http.put<ReviewResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  // DELETE /api/reviews/{id}  [Patient]
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
