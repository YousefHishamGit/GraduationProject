using DataAccessLayer.Enums;
using DataAccessLayer.Entities.Base;

namespace DataAccessLayer.Entities
{
    public class Doctor : BaseEntity
    {
        public int Id { get; set; }
        public int PersonId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public string LicenseNumber { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public int YearsOfExperience { get; set; }
        public decimal ConsultationFee { get; set; }
        public DoctorStatus Status { get; set; }
        public string? Bio { get; set; }
        public string? ImgPath { get; set; }
        public DateTime HireDate { get; set; }

        // Navigation Properties
        public virtual Person Person { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual Department Department { get; set; } = null!;
        public virtual ICollection<DoctorSchedule> Schedules { get; set; } = new List<DoctorSchedule>();
        public virtual ICollection<DoctorLeave> Leaves { get; set; } = new List<DoctorLeave>();
        public virtual ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}