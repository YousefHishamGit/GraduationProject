using DataAccessLayer.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Payment
{
    public class CreatePaymentDto
    {
        [Required] public int AppointmentId { get; set; }
        [Required] public decimal Amount { get; set; }
        public string Currency { get; set; } = "EGP";
        [Required] public PaymentMethod Method { get; set; }
    }
}
