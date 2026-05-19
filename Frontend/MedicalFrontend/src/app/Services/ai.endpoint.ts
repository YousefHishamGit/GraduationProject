import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';

// ─── DTOs المتوافقة مع Flask API ─────────────────────────────

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
  rag_used?: boolean;
  disclaimer?: string;
}

/** ملف مرفوع (PDF أو صورة) يتم إرساله بصيغة base64 */
export interface FileAttachmentDto {
  name: string;          // اسم الملف (مثال: report.pdf)
  content: string;       // base64 string (بدون prefix data:...)
  type?: 'pdf' | 'image'; // اختياري، يُستنتج من الامتداد
}

/** طلب المحادثة (نقطة /chat) */
export interface ChatRequestDto {
  message: string;               // الرسالة النصية للمستخدم
  files?: FileAttachmentDto[];   // المرفقات (اختياري)
  sessionId?: string;            // معرف الجلسة (للاستمرارية)
}

/** رد المحادثة من Flask */
export interface ChatResponseDto {
  sessionId: string;             // الجلسة الحالية (قديمة أو جديدة)
  reply: string;                 // رد المساعد
  diagnosis: {
    diagnosis: string;
    recommended_specialty: string;
    urgency_level: 'critical' | 'moderate' | 'normal';
  };
}

/** تحليل تقرير PDF (نقطة /analyze-report) */
export interface ReportAnalysisResponseDto {
  success: boolean;
  filename: string;
  analysis: {
    summary: string;
    normal_results: string[];
    abnormal_results: string[];
    recommendations: string[];
    urgency_level: 'critical' | 'moderate' | 'normal';
    urgency_message: string;
  };
}

/** تحليل صورة طبية (نقطة /analyze-image) */
export interface ImageAnalysisResponseDto {
  success: boolean;
  filename: string;
  analysis: {
    description: string;
    findings: string[];
    recommendations: string[];
    urgency_level: 'critical' | 'moderate' | 'normal';
    urgency_message: string;
  };
}

/** استعلام RAG المباشر (نقطة /ask) */
export interface AskRequestDto {
  query: string;
}

export interface AskResponseDto {
  query: string;
  results: Array<{
    content: string;
    metadata: Record<string, any>;
  }>;
}

/** معلومات النظام */
export interface InfoResponseDto {
  name: string;
  version: string;
  description: string;
  lang: string;
  endpoints: string[];
}

/** حالة الخدمة */
export interface HealthResponseDto {
  status: 'ok' | 'degraded';
  message: string;
  sessions: number;
  arabic_response: string;
}

@Injectable({ providedIn: 'root' })
export class AiEndpoint extends BaseEndpoint {
  private aiBaseUrl = 'http://localhost:7860'; // غيّر حسب بيئتك

  // ────────────────────────────────────────────────────────────
  // 1. تحليل الأعراض (بدون محادثة)
  // ────────────────────────────────────────────────────────────
  predict(dto: DiagnosisRequestDto): Observable<DiagnosisResponseDto> {
    return this.http.post<DiagnosisResponseDto>(`${this.aiBaseUrl}/predict`, dto);
  }

  // ────────────────────────────────────────────────────────────
  // 2. محادثة متعددة الأدوار مع إدارة الجلسات والملفات
  // ────────────────────────────────────────────────────────────
  chat(dto: ChatRequestDto): Observable<ChatResponseDto> {
    // تحويل الملفات إلى الصيغة التي يتوقعها Flask (بدون prefix data:application...)
    const filesPayload = dto.files?.map(file => ({
      name: file.name,
      content: file.content // يجب أن يكون base64 خالص
    }));

    const payload: any = {
      message: dto.message,
    };
    if (filesPayload && filesPayload.length) {
      payload.files = filesPayload;
    }
    if (dto.sessionId) {
      payload.sessionId = dto.sessionId;
    }

    // إرسال الطلب كـ JSON (بدلاً من FormData) لأن Flask يدعم JSON مع base64
    return this.http.post<ChatResponseDto>(`${this.aiBaseUrl}/chat`, payload);
  }

  // ────────────────────────────────────────────────────────────
  // 3. تحليل تقرير PDF (رفع الملف مباشرة)
  // ────────────────────────────────────────────────────────────
  analyzeReport(file: File): Observable<ReportAnalysisResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ReportAnalysisResponseDto>(
      `${this.aiBaseUrl}/analyze-report`,
      formData
    );
  }

  // ────────────────────────────────────────────────────────────
  // 4. تحليل صورة طبية (رفع الملف مباشرة)
  // ────────────────────────────────────────────────────────────
  analyzeImage(file: File): Observable<ImageAnalysisResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImageAnalysisResponseDto>(
      `${this.aiBaseUrl}/analyze-image`,
      formData
    );
  }

  // ────────────────────────────────────────────────────────────
  // 5. البحث المباشر في قاعدة المعرفة الطبية (RAG)
  // ────────────────────────────────────────────────────────────
  ask(query: string): Observable<AskResponseDto> {
    return this.http.post<AskResponseDto>(`${this.aiBaseUrl}/ask`, { query });
  }

  // ────────────────────────────────────────────────────────────
  // 6. حالة الخدمة
  // ────────────────────────────────────────────────────────────
  health(): Observable<HealthResponseDto> {
    return this.http.get<HealthResponseDto>(`${this.aiBaseUrl}/health`);
  }

  // ────────────────────────────────────────────────────────────
  // 7. معلومات عامة عن الـ API
  // ────────────────────────────────────────────────────────────
  info(): Observable<InfoResponseDto> {
    return this.http.get<InfoResponseDto>(`${this.aiBaseUrl}/info`);
  }
}