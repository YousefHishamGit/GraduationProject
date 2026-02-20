using DataAccessLayer.Entities.Base;

namespace DataAccessLayer.Entities
{
    public class Receptionist : BaseEntity
    {
        public int Id { get; set; }
        public int PersonId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Status { get; set; } = "Active"; // Active / Inactive

        // Navigation Properties
        public virtual Person Person { get; set; } = null!;
        public virtual User User { get; set; } = null!;
        public virtual ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}