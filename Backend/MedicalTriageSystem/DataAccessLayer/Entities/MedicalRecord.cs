namespace DataAccessLayer.Entities
{
    public class MedicalRecord
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public string Diagnosis { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? VitalSigns { get; set; } // JSON: BP, Pulse, Temp, etc.
        public DateTime CreatedOn { get; set; }

        // Navigation Properties
        public virtual Appointment Appointment { get; set; } = null!;
        public virtual Patient Patient { get; set; } = null!;
        public virtual Doctor Doctor { get; set; } = null!;
        public virtual ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
        public virtual ICollection<LabRequest> LabRequests { get; set; } = new List<LabRequest>();
    }
}