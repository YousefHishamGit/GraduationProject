using DataAccessLayer.Enums;

namespace DataAccessLayer.Entities
{
    public class LabRequest
    {
        public int Id { get; set; }
        public int MedicalRecordId { get; set; }
        public string TestName { get; set; } = string.Empty;
        public LabRequestStatus Status { get; set; }
        public string? ResultFilePath { get; set; }
        public DateTime RequestedOn { get; set; }
        public DateTime? ResultOn { get; set; }

        // Navigation Properties
        public virtual MedicalRecord MedicalRecord { get; set; } = null!;
    }
}