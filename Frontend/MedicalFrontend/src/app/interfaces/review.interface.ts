export interface ReviewResponseDto {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  patientName: string;
  rating: number;
  comment?: string;
  createdOn: string;
}

export interface CreateReviewDto {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  rating: number;
  comment?: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}
