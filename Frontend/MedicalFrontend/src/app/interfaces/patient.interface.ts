export interface PatientResponseDto {
  id: number;
  fullName: string;
  birthDate: string;
  gender: string;
  phone: string;
  address: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  imgPath?: string;
}

export interface UpdatePatientDto {
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  imgPath?: string;
  bloodType?: number;
}
