using DataAccessLayer.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Payment
{
    public class UpdatePaymentDto
    {
        public PaymentStatus? Status { get; set; }
        public DateTime? PaidAt { get; set; }
    }
}
