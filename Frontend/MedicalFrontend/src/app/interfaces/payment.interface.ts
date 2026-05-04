export interface PaymentResponseDto {
  id: number;
  appointmentId: number;
  amount: number;
  currency: string;
  status: string;
  method: string;
  paidAt?: string;
}

export interface CreatePaymentDto {
  appointmentId: number;
  amount: number;
  currency: string;
  method: string;
}