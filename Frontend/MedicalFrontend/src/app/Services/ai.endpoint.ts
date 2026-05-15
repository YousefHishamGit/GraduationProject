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

export interface ChatMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequestDto {
  messages: ChatMessageDto[];
}

export interface ChatResponseDto {
  reply: string;
  diagnosis: {
    diagnosis: string;
    recommended_specialty: string;
    urgency_level: 'critical' | 'moderate' | 'normal';
  } | null;
}

@Injectable({ providedIn: 'root' })
export class AiEndpoint extends BaseEndpoint {
  private aiBaseUrl = 'http://localhost:7860';

  predict(dto: DiagnosisRequestDto): Observable<DiagnosisResponseDto> {
    return this.http.post<DiagnosisResponseDto>(`${this.aiBaseUrl}/predict`, dto);
  }

  chat(dto: ChatRequestDto): Observable<ChatResponseDto> {
    return this.http.post<ChatResponseDto>(`${this.aiBaseUrl}/chat`, dto);
  }
}