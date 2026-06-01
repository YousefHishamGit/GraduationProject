using DataAccessLayer.Entities.Base;
using System;

namespace DataAccessLayer.Entities
{
    public class Notification : BaseEntity
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; } = false;

        // Navigation Properties
        public virtual Patient Patient { get; set; } = null!;
    }
}
