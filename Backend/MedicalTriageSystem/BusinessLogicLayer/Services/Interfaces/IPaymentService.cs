using BusinessLogicLayer.DTOs.Payment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto?> GetByIdAsync(int id);
        Task<PaymentResponseDto?> GetByAppointmentIdAsync(int appointmentId);
        Task<PaymentResponseDto> CreateAsync(CreatePaymentDto dto);
        Task<PaymentResponseDto?> MarkAsPaidAsync(int id);
        Task<PaymentResponseDto?> RefundAsync(int id);
    }
}
