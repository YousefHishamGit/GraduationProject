export interface PrescriptionResponseDto {
  id: number;
  medicalRecordId: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export interface CreatePrescriptionDto {
  medicalRecordId: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export interface UpdatePrescriptionDto {
  medicineName?: string;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  instructions?: string;
}