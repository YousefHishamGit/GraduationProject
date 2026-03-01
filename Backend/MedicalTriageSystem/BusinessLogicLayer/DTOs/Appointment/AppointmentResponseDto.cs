namespace BusinessLogicLayer.DTOs.Appointment
{
    public class AppointmentResponseDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int TimeSlotId { get; set; }
        public int? ReceptionistId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? CancellationReason { get; set; }
        public string? Notes { get; set; }
    }

  

   
}

