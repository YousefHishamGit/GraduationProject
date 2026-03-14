using AutoMapper;
using BusinessLogicLayer.DTOs.Payment;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PaymentService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PaymentResponseDto?> GetByIdAsync(int id)
        {
            var payment = await _unitOfWork.Payments.GetByIdAsync(id);
            if (payment == null) return null;
            return _mapper.Map<PaymentResponseDto>(payment);
        }

        public async Task<PaymentResponseDto?> GetByAppointmentIdAsync(int appointmentId)
        {
            var payment = await _unitOfWork.Payments.GetByAppointmentIdAsync(appointmentId);
            if (payment == null) return null;
            return _mapper.Map<PaymentResponseDto>(payment);
        }

        public async Task<PaymentResponseDto> CreateAsync(CreatePaymentDto dto)
        {
            var payment = _mapper.Map<Payment>(dto);
            await _unitOfWork.Payments.AddAsync(payment);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<PaymentResponseDto>(payment);
        }

        public async Task<PaymentResponseDto?> MarkAsPaidAsync(int id)
        {
            var payment = await _unitOfWork.Payments.GetByIdAsync(id);
            if (payment == null) return null;

            payment.Status = PaymentStatus.Paid;
            payment.PaidAt = DateTime.UtcNow;

            _unitOfWork.Payments.Update(payment);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<PaymentResponseDto>(payment);
        }

        public async Task<PaymentResponseDto?> RefundAsync(int id)
        {
            var payment = await _unitOfWork.Payments.GetByIdAsync(id);
            if (payment == null) return null;

            payment.Status = PaymentStatus.Refunded;

            _unitOfWork.Payments.Update(payment);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<PaymentResponseDto>(payment);
        }
    }
}
