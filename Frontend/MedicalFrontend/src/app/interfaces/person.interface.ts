export interface PersonResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  nationalID: string;
  birthDate: string;
  gender: string;
  address: string;
  phone: string;
  imgPath?: string;
}

export interface UpdatePersonDto {
  address?: string;
  phone?: string;
}
