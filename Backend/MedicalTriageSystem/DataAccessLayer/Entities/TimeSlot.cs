namespace DataAccessLayer.Entities
{
    public class TimeSlot
    {
        public int Id { get; set; }
        public int DoctorId { get; set; }
        public DateTime SlotStart { get; set; }
        public DateTime SlotEnd { get; set; }
        public bool IsBooked { get; set; }

        // Navigation Properties
        public virtual Doctor Doctor { get; set; } = null!;
        public virtual Appointment? Appointment { get; set; }
    }
}