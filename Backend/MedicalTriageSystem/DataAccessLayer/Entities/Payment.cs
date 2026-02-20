using DataAccessLayer.Enums;

namespace DataAccessLayer.Entities
{
    public class Payment
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "EGP";
        public PaymentStatus Status { get; set; }
        public PaymentMethod Method { get; set; }
        public string? StripeSessionId { get; set; }
        public string? PaymentIntentId { get; set; }
        public DateTime? PaidAt { get; set; }

        // Navigation Properties
        public virtual Appointment Appointment { get; set; } = null!;
    }
}