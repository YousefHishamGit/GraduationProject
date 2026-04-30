export interface DoctorResponseDto {
  id: number;
  fullName: string;
  phone: string;
  address?: string;
  gender: string;
  departmentName: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  consultationFee: number;
  status: string;
  bio?: string;
  imgPath?: string;
  hireDate: string;
}

export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  nationalId: string;
  birthDate: string;
  gender: number;
  address?: string;
  phone?: string;
  email: string;
  password: string;
  licenseNumber: string;
  specialization: string;
  departmentId: number;
  yearsOfExperience: number;
  consultationFee: number;
  hireDate: string;
  bio?: string;
  imgPath?: string;
}

export interface UpdateDoctorDto {
  phone?: string;
  address?: string;
  specialization?: string;
  departmentId?: number;
  yearsOfExperience?: number;
  consultationFee?: number;
  bio?: string;
  status?: string;
  imgPath?: string;
}

export interface DoctorScheduleResponseDto {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isAvailable: boolean;
}

export interface CreateDoctorScheduleDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isAvailable: boolean;
}

export interface UpdateDoctorScheduleDto {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
  isAvailable?: boolean;
}

export interface DoctorLeaveResponseDto {
  id: number;
  leaveDate: string;
  reason?: string;
  isApproved: boolean;
}

export interface CreateDoctorLeaveDto {
  leaveDate: string;
  reason?: string;
  isApproved: boolean;
}

export interface UpdateDoctorLeaveDto {
  leaveDate?: string;
  reason?: string;
  isApproved?: boolean;
}

export interface TimeSlotResponseDto {
  id: number;
  slotStart: string;
  slotEnd: string;
  isBooked: boolean;
}

export interface GenerateTimeSlotsDto {
  date: string;
}
