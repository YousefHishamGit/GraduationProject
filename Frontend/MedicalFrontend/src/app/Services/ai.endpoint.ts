import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';

export interface DiagnosisRequestDto {
  symptoms: string;
}

export interface DiagnosisResponseDto {
  symptoms: string;
  translated: string;
  diagnosis: string;
  recommendedSpecialty: string;
  urgencyMessage: string;
  tips: string[];
}

@Injectable({ providedIn: 'root' })
export class AiEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('ai');

  predict(dto: DiagnosisRequestDto): Observable<DiagnosisResponseDto> {
    return this.http.post<DiagnosisResponseDto>(`${this.baseUrl}/predict`, dto);
  }
}