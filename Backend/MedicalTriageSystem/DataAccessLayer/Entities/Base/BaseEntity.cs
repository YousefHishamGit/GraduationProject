using System;

namespace DataAccessLayer.Entities.Base
{
    public abstract class BaseEntity
    {
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime? ModifiedOn { get; set; }
        public string? ModifiedBy { get; set; }
    }
}