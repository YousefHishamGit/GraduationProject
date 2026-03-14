using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public PaymentRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<Payment?> GetByAppointmentIdAsync(int appointmentId)
        {
            return await _dbContext.Payments
                .Include(p => p.Appointment)
                .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);
        }

        public async Task<IEnumerable<Payment>> GetByStatusAsync(PaymentStatus status)
        {
            return await _dbContext.Payments
                .AsNoTracking()
                .Where(p => p.Status == status)
                .ToListAsync();
        }
    }
}
