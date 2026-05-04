export interface LabRequestResponseDto {
  id: number;
  medicalRecordId: number;
  testName: string;
  status: string;
  resultFilePath?: string;
  requestedOn: string;
  resultOn?: string;
}

export interface CreateLabRequestDto {
  medicalRecordId: number;
  testName: string;
}

export interface UpdateLabRequestDto {
  testName?: string;
}

export interface UploadLabResultDto {
  resultFilePath: string;
}