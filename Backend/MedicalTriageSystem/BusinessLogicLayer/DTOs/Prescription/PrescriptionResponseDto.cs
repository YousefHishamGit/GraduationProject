namespace BusinessLogicLayer.DTOs.Prescription
{
    public class PrescriptionResponseDto
    {
        public int Id { get; set; }
        public int MedicalRecordId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public string Dosage { get; set; } = string.Empty;
        public string Frequency { get; set; } = string.Empty;
        public int DurationDays { get; set; }
        public string? Instructions { get; set; }
    }

    

    
}

