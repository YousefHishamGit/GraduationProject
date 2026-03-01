namespace BusinessLogicLayer.DTOs.MedicalRecord
{
    public class MedicalRecordResponseDto
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? VitalSigns { get; set; }
        public DateTime CreatedOn { get; set; }
    }

    

    
}

