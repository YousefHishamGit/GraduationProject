using DataAccessLayer.Enums;
using DataAccessLayer.Entities.Base;

namespace DataAccessLayer.Entities
{
    public class Person : BaseEntity
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string NationalID { get; set; } = string.Empty;
        public DateTime BirthDate { get; set; }
        public Gender Gender { get; set; }
        public string Address { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? ImgPath { get; set; }

        // Navigation Properties (العلاقات)
        public virtual User? User { get; set; }
        public virtual Doctor? Doctor { get; set; }
        public virtual Patient? Patient { get; set; }
        public virtual Receptionist? Receptionist { get; set; }
    }
}