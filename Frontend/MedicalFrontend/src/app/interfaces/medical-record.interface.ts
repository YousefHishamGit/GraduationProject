export interface MedicalRecordResponseDto {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  notes?: string;
  vitalSigns?: string;
  createdOn: string;
}

export interface CreateMedicalRecordDto {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  notes?: string;
  vitalSigns?: string;
}

export interface UpdateMedicalRecordDto {
  diagnosis?: string;
  notes?: string;
  vitalSigns?: string;
}
