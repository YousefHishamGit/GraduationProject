using DataAccessLayer.Entities.Base;

namespace DataAccessLayer.Entities
{
    public class Department : BaseEntity
    {
        public int Id { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImgPath { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedOn { get; set; }

        // Navigation Properties
        public virtual ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
    }
}