export interface AppointmentResponseDto {
  id: number;
  patientId: number;
  doctorId: number;
  timeSlotId: number;
  receptionistId?: number;
  appointmentDate: string;
  type: string;
  status: string;
  cancellationReason?: string;
  notes?: string;
}

export interface CreateAppointmentDto {
  patientId: number;
  doctorId: number;
  timeSlotId: number;
  appointmentDate: string;
  type: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  appointmentDate?: string;
  type?: string;
  notes?: string;
}

export interface CancelAppointmentDto {
  reason?: string;
}