using DataAccessLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IAdminRepository
    {
        // Dashboard Statistics
        Task<int> GetTotalUsersCountAsync();
        Task<int> GetTotalDoctorsCountAsync();
        Task<int> GetTotalPatientsCountAsync();
        Task<int> GetTotalAppointmentsCountAsync();
        Task<int> GetTodayAppointmentsCountAsync();
        Task<int> GetCompletedAppointmentsCountAsync();
        Task<int> GetCancelledAppointmentsCountAsync();
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetTodayRevenueAsync();
        Task<int> GetActiveDepartmentsCountAsync();
        Task<int> GetPendingLabRequestsCountAsync();

        // User Management
        Task<IEnumerable<User>> GetAllUsersAsync();
        Task<User?> GetUserByIdAsync(string userId);
        Task<bool> UserExistsAsync(string userId);

        // Appointments Report
        Task<int> GetAppointmentsByStatusCountAsync(string status);
        Task<IEnumerable<(int DoctorId, string DoctorName, int Count)>> GetAppointmentsByDoctorAsync();
        Task<IEnumerable<(string Type, int Count)>> GetAppointmentsByTypeAsync();

        // Revenue Report
        Task<decimal> GetRevenueByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<int> GetTransactionCountByStatusAsync(string status);
        Task<IEnumerable<(string PaymentMethod, decimal Amount, int Count)>> GetRevenueByPaymentMethodAsync();
        Task<IEnumerable<(DateTime Date, decimal Amount, int TransactionCount)>> GetDailyRevenueAsync(int days = 30);
    }
}
