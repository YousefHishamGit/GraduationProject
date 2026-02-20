namespace DataAccessLayer.Entities
{
    public class DoctorLeave
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public DateTime LeaveDate { get; set; }
        public string? Reason { get; set; }
        public bool IsApproved { get; set; }

        // Navigation Properties
        public virtual Doctor Doctor { get; set; } = null!;
    }
}