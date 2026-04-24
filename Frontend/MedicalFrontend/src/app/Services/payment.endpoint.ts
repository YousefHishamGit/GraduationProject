import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseEndpoint } from './base.endpoint';
import {
  PaymentResponseDto,
  CreatePaymentDto
} from '../interfaces/payment.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentEndpoint extends BaseEndpoint {
  private baseUrl = this.getBaseUrl('payments');

  // GET /api/payments/{id}  [Authorized]
  getById(id: number): Observable<PaymentResponseDto> {
    return this.http.get<PaymentResponseDto>(`${this.baseUrl}/${id}`);
  }

  // GET /api/payments/appointment/{appointmentId}  [Authorized]
  getByAppointment(appointmentId: number): Observable<PaymentResponseDto> {
    return this.http.get<PaymentResponseDto>(`${this.baseUrl}/appointment/${appointmentId}`);
  }

  // POST /api/payments  [Patient, Receptionist]
  create(dto: CreatePaymentDto): Observable<PaymentResponseDto> {
    return this.http.post<PaymentResponseDto>(this.baseUrl, dto);
  }

  // PUT /api/payments/{id}/pay  [Admin, Receptionist]
  markAsPaid(id: number): Observable<PaymentResponseDto> {
    return this.http.put<PaymentResponseDto>(`${this.baseUrl}/${id}/pay`, {});
  }

  // PUT /api/payments/{id}/refund  [Admin]
  refund(id: number): Observable<PaymentResponseDto> {
    return this.http.put<PaymentResponseDto>(`${this.baseUrl}/${id}/refund`, {});
  }
}

