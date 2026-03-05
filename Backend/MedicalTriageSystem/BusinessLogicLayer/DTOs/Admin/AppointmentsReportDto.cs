namespace BusinessLogicLayer.DTOs.Admin
{
    public class AppointmentsReportDto
    {
        public int TotalAppointments { get; set; }
        public int CompletedCount { get; set; }
        public int CancelledCount { get; set; }
        public int PendingCount { get; set; }
        public int NoShowCount { get; set; }
        public double CompletionRate { get; set; }
        public double CancellationRate { get; set; }
        public List<AppointmentsByDoctorDto> AppointmentsByDoctor { get; set; } = new();
        public List<AppointmentsByTypeDto> AppointmentsByType { get; set; } = new();
    }

    public class AppointmentsByDoctorDto
    {
        public int DoctorId { get; set; }
        public string DoctorName { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class AppointmentsByTypeDto
    {
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
