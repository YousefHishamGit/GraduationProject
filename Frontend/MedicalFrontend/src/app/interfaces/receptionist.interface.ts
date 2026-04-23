export interface ReceptionistResponseDto {
  id: number;
  fullName: string;
  phone: string;
  gender: string;
  email: string;
  hireDate: string;
  endDate?: string;
  status: string;
  imgPath?: string;
}

export interface CreateReceptionistDto {
  firstName: string;
  lastName: string;
  nationalID: string;
  birthDate: string;
  gender: number;
  address?: string;
  phone?: string;
  email: string;
  password: string;
  hireDate: string;
  image?: string;
}

export interface UpdateReceptionistDto {
  phone?: string;
  address?: string;
  endDate?: string;
  status?: string;
  image?: string;
}
