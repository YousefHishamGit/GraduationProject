using DataAccessLayer.Enums;
using DataAccessLayer.Entities.Base;

namespace DataAccessLayer.Entities
{
    public class Appointment : BaseEntity
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int TimeSlotId { get; set; }
        public int? ReceptionistId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public AppointmentType Type { get; set; }
        public AppointmentStatus Status { get; set; }
        public string? CancellationReason { get; set; }
        public string? Notes { get; set; }

        // Navigation Properties
        public virtual Patient Patient { get; set; } = null!;
        public virtual Doctor Doctor { get; set; } = null!;
        public virtual TimeSlot TimeSlot { get; set; } = null!;
        public virtual Receptionist? Receptionist { get; set; }
        public virtual MedicalRecord? MedicalRecord { get; set; }
        public virtual Payment? Payment { get; set; }
        public virtual Review? Review { get; set; }
    }
}