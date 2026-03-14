using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Payment
{
    public class PaymentResponseDto
    {
        public int Id { get; set; }
        public int AppointmentId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Method { get; set; } = string.Empty;
        public DateTime? PaidAt { get; set; }
    }
}
