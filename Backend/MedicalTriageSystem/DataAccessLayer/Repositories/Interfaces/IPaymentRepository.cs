using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IPaymentRepository : IGenericRepository<Payment>
    {
        Task<Payment?> GetByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<Payment>> GetByStatusAsync(PaymentStatus status);
    }
}
