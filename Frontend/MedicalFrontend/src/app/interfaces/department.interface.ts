export interface DepartmentResponseDto {
  id: number;
  departmentName: string;
  description: string;
  imgPath?: string;
  isDeleted: boolean;
}

export interface CreateDepartmentDto {
  departmentName: string;
  description: string;
  image?: string;
}

export interface UpdateDepartmentDto {
  departmentName?: string;
  description?: string;
  image?: string;
}
