export interface PatientResponseDto {
  id: number;
  fullName: string;
  phone: string;
  gender: string;
  email: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  imgPath?: string;
  birthDate: string;
  address?: string;
}

export interface UpdatePatientDto {
  phone?: string;
  address?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}