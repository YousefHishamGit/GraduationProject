import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';

export interface DiagnosisRequestDto {
  symptoms: string;
}

export interface DiagnosisResponseDto {
  symptoms: string;
  diagnosis: string;
  recommended_specialty: string;
  urgency_level: 'critical' | 'moderate' | 'normal';
  urgency_message: string;
  tips: string[];
}

@Injectable({ providedIn: 'root' })
export class AiEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('ai');

  predict(dto: DiagnosisRequestDto): Observable<DiagnosisResponseDto> {
    return this.http.post<DiagnosisResponseDto>(`${this.baseUrl}/predict`, dto);
  }
}