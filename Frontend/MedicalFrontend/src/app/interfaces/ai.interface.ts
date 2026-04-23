export interface DiagnosisRequestDto {
  symptoms: string;
}

export interface DiagnosisResponseDto {
  symptoms: string;
  translated: string;
  diagnosis: string;
  recommended_specialty: string;
  urgency_message: string;
  tips: string[];
}
