export interface DoctorResponseDto {
  id: number;
  fullName: string;
  specialization: string;
  departmentName: string;
  yearsOfExperience: number;
  consultationFee: number;
  licenseNumber: string;
  status: string;
  bio?: string;
  imgPath?: string;
  hireDate: string;
  phone: string;
  gender: string;
}

export interface DoctorScheduleResponseDto {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isAvailable: boolean;
}

export interface TimeSlotResponseDto {
  id: number;
  slotStart: string;
  slotEnd: string;
  isBooked: boolean;
}

export interface DoctorLeaveResponseDto {
  id: number;
  leaveDate: string;
  reason?: string;
  isApproved: boolean;
}

export interface CreateDoctorDto {
  firstName: string;
  lastName: string;
  nationalID: string;
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
}

export interface UpdateDoctorDto {
  specialization?: string;
  departmentId?: number;
  yearsOfExperience?: number;
  consultationFee?: number;
  bio?: string;
  status?: string;
  phone?: string;
  address?: string;
}

export interface CreateDoctorScheduleDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface UpdateDoctorScheduleDto {
  startTime?: string;
  endTime?: string;
  slotDurationMinutes?: number;
  isAvailable?: boolean;
}

export interface CreateDoctorLeaveDto {
  leaveDate: string;
  reason?: string;
}

export interface UpdateDoctorLeaveDto {
  reason?: string;
  isApproved?: boolean;
}

export interface GenerateTimeSlotsDto {
  date: string;
}