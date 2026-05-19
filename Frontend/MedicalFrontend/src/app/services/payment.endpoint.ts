import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import { PaymentResponseDto, CreatePaymentDto } from '../interfaces/payment.interface';

@Injectable({ providedIn: 'root' })
export class PaymentEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('payments');

  getById(id: number): Observable<PaymentResponseDto> {
    return this.http.get<PaymentResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByAppointment(appointmentId: number): Observable<PaymentResponseDto> {
    return this.http.get<PaymentResponseDto>(`${this.baseUrl}/appointment/${appointmentId}`);
  }

  create(dto: CreatePaymentDto): Observable<PaymentResponseDto> {
    return this.http.post<PaymentResponseDto>(this.baseUrl, dto);
  }

  markAsPaid(id: number): Observable<PaymentResponseDto> {
    return this.http.put<PaymentResponseDto>(`${this.baseUrl}/${id}/pay`, {});
  }

  refund(id: number): Observable<PaymentResponseDto> {
    return this.http.put<PaymentResponseDto>(`${this.baseUrl}/${id}/refund`, {});
  }
}