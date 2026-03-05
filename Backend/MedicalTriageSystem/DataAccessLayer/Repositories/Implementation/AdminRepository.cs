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
    public class AdminRepository : IAdminRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public AdminRepository(MedicalTriageDbContext context)
        {
            _dbContext = context;
        }

        // Dashboard Statistics
        public async Task<int> GetTotalUsersCountAsync()
        {
            return await _dbContext.Users.CountAsync();
        }

        public async Task<int> GetTotalDoctorsCountAsync()
        {
            return await _dbContext.Doctors.CountAsync();
        }

        public async Task<int> GetTotalPatientsCountAsync()
        {
            return await _dbContext.Patients.CountAsync();
        }

        public async Task<int> GetTotalAppointmentsCountAsync()
        {
            return await _dbContext.Appointments.CountAsync();
        }

        public async Task<int> GetTodayAppointmentsCountAsync()
        {
            var today = DateTime.UtcNow.Date;
            return await _dbContext.Appointments
                .Where(a => a.AppointmentDate.Date == today)
                .CountAsync();
        }

        public async Task<int> GetCompletedAppointmentsCountAsync()
        {
            return await _dbContext.Appointments
                .Where(a => a.Status == AppointmentStatus.Completed)
                .CountAsync();
        }

        public async Task<int> GetCancelledAppointmentsCountAsync()
        {
            return await _dbContext.Appointments
                .Where(a => a.Status == AppointmentStatus.Cancelled)
                .CountAsync();
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _dbContext.Payments
                .Where(p => p.Status == PaymentStatus.Completed)
                .SumAsync(p => p.Amount);
        }

        public async Task<decimal> GetTodayRevenueAsync()
        {
            var today = DateTime.UtcNow.Date;
            return await _dbContext.Payments
                .Where(p => p.Status == PaymentStatus.Completed && p.PaidAt.HasValue && p.PaidAt.Value.Date == today)
                .SumAsync(p => p.Amount);
        }

        public async Task<int> GetActiveDepartmentsCountAsync()
        {
            return await _dbContext.Departments
                .Where(d => !d.IsDeleted)
                .CountAsync();
        }

        public async Task<int> GetPendingLabRequestsCountAsync()
        {
            return await _dbContext.LabRequests
                .Where(lr => lr.Status == LabRequestStatus.Requested)
                .CountAsync();
        }

        // User Management
        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            return await _dbContext.Users
                .Include(u => u.Person)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(string userId)
        {
            return await _dbContext.Users
                .Include(u => u.Person)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<bool> UserExistsAsync(string userId)
        {
            return await _dbContext.Users.AnyAsync(u => u.Id == userId);
        }

        // Appointments Report
        public async Task<int> GetAppointmentsByStatusCountAsync(string status)
        {
            if (Enum.TryParse<AppointmentStatus>(status, out var appointmentStatus))
            {
                return await _dbContext.Appointments
                    .Where(a => a.Status == appointmentStatus)
                    .CountAsync();
            }
            return 0;
        }

        public async Task<IEnumerable<(int DoctorId, string DoctorName, int Count)>> GetAppointmentsByDoctorAsync()
        {
            var result = await _dbContext.Appointments
                .Include(a => a.Doctor)
                .ThenInclude(d => d.Person)
                .GroupBy(a => new { a.DoctorId, DoctorName = $"{a.Doctor.Person.FirstName} {a.Doctor.Person.LastName}" })
                .Select(g => new { g.Key.DoctorId, g.Key.DoctorName, Count = g.Count() })
                .AsNoTracking()
                .ToListAsync();

            return result.Select(r => (r.DoctorId, r.DoctorName, r.Count));
        }

        public async Task<IEnumerable<(string Type, int Count)>> GetAppointmentsByTypeAsync()
        {
            var result = await _dbContext.Appointments
                .GroupBy(a => a.Type)
                .Select(g => new { Type = g.Key.ToString(), Count = g.Count() })
                .AsNoTracking()
                .ToListAsync();

            return result.Select(r => (r.Type, r.Count));
        }

        // Revenue Report
        public async Task<decimal> GetRevenueByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbContext.Payments
                .Where(p => p.Status == PaymentStatus.Completed 
                    && p.PaidAt.HasValue 
                    && p.PaidAt.Value >= startDate 
                    && p.PaidAt.Value <= endDate)
                .SumAsync(p => p.Amount);
        }

        public async Task<int> GetTransactionCountByStatusAsync(string status)
        {
            if (Enum.TryParse<PaymentStatus>(status, out var paymentStatus))
            {
                return await _dbContext.Payments
                    .Where(p => p.Status == paymentStatus)
                    .CountAsync();
            }
            return 0;
        }

        public async Task<IEnumerable<(string PaymentMethod, decimal Amount, int Count)>> GetRevenueByPaymentMethodAsync()
        {
            var result = await _dbContext.Payments
                .Where(p => p.Status == PaymentStatus.Completed)
                .GroupBy(p => p.Method)
                .Select(g => new { Method = g.Key.ToString(), Amount = g.Sum(p => p.Amount), Count = g.Count() })
                .AsNoTracking()
                .ToListAsync();

            return result.Select(r => (r.Method, r.Amount, r.Count));
        }

        public async Task<IEnumerable<(DateTime Date, decimal Amount, int TransactionCount)>> GetDailyRevenueAsync(int days = 30)
        {
            var startDate = DateTime.UtcNow.AddDays(-days).Date;
            var result = await _dbContext.Payments
                .Where(p => p.Status == PaymentStatus.Completed && p.PaidAt.HasValue && p.PaidAt.Value.Date >= startDate)
                .GroupBy(p => p.PaidAt.Value.Date)
                .Select(g => new { Date = g.Key, Amount = g.Sum(p => p.Amount), TransactionCount = g.Count() })
                .OrderBy(r => r.Date)
                .AsNoTracking()
                .ToListAsync();

            return result.Select(r => (r.Date, r.Amount, r.TransactionCount));
        }
    }
}
