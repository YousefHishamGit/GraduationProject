using DataAccessLayer.Enums;
using DataAccessLayer.Entities.Base;

namespace DataAccessLayer.Entities
{
    public class Patient : BaseEntity
    {
        public int Id { get; set; }
        public int PersonId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public BloodType? BloodType { get; set; }
        public string? Allergies { get; set; }
        public string? MedicalHistory { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public string? ImgPath { get; set; }

        // Navigation Properties
        public virtual Person Person { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public virtual ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }
}