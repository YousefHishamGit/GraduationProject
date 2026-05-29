export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterPatientDto {
  firstName: string;
  lastName: string;
  nationalID: string;
  birthDate: string;
  gender: number;
  address: string;
  phone: string;
  email: string;
  password: string;
  bloodType?: number;
  allergies?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  image?: File;
}

export interface RegisterDoctorDto {
  firstName: string;
  lastName: string;
  nationalID: string;
  birthDate: string;
  gender: number;
  address: string;
  phone: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialization: string;
  departmentId: number;
  yearsOfExperience: number;
  consultationFee: number;
  hireDate: string;
  bio?: string;
  image?: File;
}

export interface AuthResponseDto {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  role: string;
  expiresAt: string;
}