using AutoMapper;
using BusinessLogicLayer.DTOs.Admin;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class AdminService : IAdminService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;

        public AdminService(IUnitOfWork unitOfWork, UserManager<User> userManager, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _mapper = mapper;
        }

        // Dashboard
        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var stats = new DashboardStatsDto
            {
                TotalUsers = await _unitOfWork.Admin.GetTotalUsersCountAsync(),
                TotalDoctors = await _unitOfWork.Admin.GetTotalDoctorsCountAsync(),
                TotalPatients = await _unitOfWork.Admin.GetTotalPatientsCountAsync(),
                TotalAppointments = await _unitOfWork.Admin.GetTotalAppointmentsCountAsync(),
                TodayAppointments = await _unitOfWork.Admin.GetTodayAppointmentsCountAsync(),
                CompletedAppointments = await _unitOfWork.Admin.GetCompletedAppointmentsCountAsync(),
                CancelledAppointments = await _unitOfWork.Admin.GetCancelledAppointmentsCountAsync(),
                TotalRevenue = await _unitOfWork.Admin.GetTotalRevenueAsync(),
                TodayRevenue = await _unitOfWork.Admin.GetTodayRevenueAsync(),
                ActiveDepartments = await _unitOfWork.Admin.GetActiveDepartmentsCountAsync(),
                PendingLabRequests = await _unitOfWork.Admin.GetPendingLabRequestsCountAsync()
            };

            return stats;
        }

        // User Management
        public async Task<IEnumerable<UserListDto>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.Admin.GetAllUsersAsync();
            return _mapper.Map<IEnumerable<UserListDto>>(users);
        }

        public async Task<UserListDto?> GetUserByIdAsync(string userId)
        {
            var user = await _unitOfWork.Admin.GetUserByIdAsync(userId);
            if (user == null) return null;
            return _mapper.Map<UserListDto>(user);
        }

        public async Task<bool> ActivateUserAsync(string userId)
        {
            var user = await _unitOfWork.Admin.GetUserByIdAsync(userId);
            if (user == null) return false;

            if (user.IsActive) return true; // Already active

            user.IsActive = true;
            await _userManager.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeactivateUserAsync(string userId)
        {
            var user = await _unitOfWork.Admin.GetUserByIdAsync(userId);
            if (user == null) return false;

            if (!user.IsActive) return true; // Already inactive

            user.IsActive = false;
            await _userManager.UpdateAsync(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        // Appointments Report
        public async Task<AppointmentsReportDto> GetAppointmentsReportAsync()
        {
            var totalAppointments = await _unitOfWork.Admin.GetTotalAppointmentsCountAsync();
            var completedCount = await _unitOfWork.Admin.GetCompletedAppointmentsCountAsync();
            var cancelledCount = await _unitOfWork.Admin.GetCancelledAppointmentsCountAsync();
            var pendingCount = await _unitOfWork.Admin.GetAppointmentsByStatusCountAsync("Pending");
            var noShowCount = await _unitOfWork.Admin.GetAppointmentsByStatusCountAsync("NoShow");

            var appointmentsByDoctor = await _unitOfWork.Admin.GetAppointmentsByDoctorAsync();
            var appointmentsByType = await _unitOfWork.Admin.GetAppointmentsByTypeAsync();

            var completionRate = totalAppointments > 0 ? (double)completedCount / totalAppointments * 100 : 0;
            var cancellationRate = totalAppointments > 0 ? (double)cancelledCount / totalAppointments * 100 : 0;

            var report = new AppointmentsReportDto
            {
                TotalAppointments = totalAppointments,
                CompletedCount = completedCount,
                CancelledCount = cancelledCount,
                PendingCount = pendingCount,
                NoShowCount = noShowCount,
                CompletionRate = completionRate,
                CancellationRate = cancellationRate,
                AppointmentsByDoctor = appointmentsByDoctor
                    .Select(x => new AppointmentsByDoctorDto
                    {
                        DoctorId = x.DoctorId,
                        DoctorName = x.DoctorName,
                        Count = x.Count
                    })
                    .ToList(),
                AppointmentsByType = appointmentsByType
                    .Select(x => new AppointmentsByTypeDto
                    {
                        Type = x.Type,
                        Count = x.Count
                    })
                    .ToList()
            };

            return report;
        }

        // Revenue Report
        public async Task<RevenueReportDto> GetRevenueReportAsync()
        {
            var today = DateTime.UtcNow.Date;
            var thisWeekStart = today.AddDays(-(int)today.DayOfWeek);
            var thisMonthStart = today.AddDays(1 - today.Day);

            var totalRevenue = await _unitOfWork.Admin.GetTotalRevenueAsync();
            var todayRevenue = await _unitOfWork.Admin.GetTodayRevenueAsync();
            var thisWeekRevenue = await _unitOfWork.Admin.GetRevenueByDateRangeAsync(thisWeekStart, today);
            var thisMonthRevenue = await _unitOfWork.Admin.GetRevenueByDateRangeAsync(thisMonthStart, today);

            var totalTransactions = await _unitOfWork.Admin.GetTransactionCountByStatusAsync("Completed");
            var successfulTransactions = await _unitOfWork.Admin.GetTransactionCountByStatusAsync("Completed");
            var failedTransactions = await _unitOfWork.Admin.GetTransactionCountByStatusAsync("Failed");

            var averageTransactionAmount = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

            var revenueByPaymentMethod = await _unitOfWork.Admin.GetRevenueByPaymentMethodAsync();
            var dailyRevenue = await _unitOfWork.Admin.GetDailyRevenueAsync(30);

            var report = new RevenueReportDto
            {
                TotalRevenue = totalRevenue,
                TodayRevenue = todayRevenue,
                ThisWeekRevenue = thisWeekRevenue,
                ThisMonthRevenue = thisMonthRevenue,
                TotalTransactions = totalTransactions,
                SuccessfulTransactions = successfulTransactions,
                FailedTransactions = failedTransactions,
                AverageTransactionAmount = averageTransactionAmount,
                RevenueByPaymentMethod = revenueByPaymentMethod
                    .Select(x => new RevenueByPaymentMethodDto
                    {
                        PaymentMethod = x.PaymentMethod,
                        Amount = x.Amount,
                        Count = x.Count
                    })
                    .ToList(),
                RevenueByDate = dailyRevenue
                    .Select(x => new RevenueByDateDto
                    {
                        Date = x.Date,
                        Amount = x.Amount,
                        TransactionCount = x.TransactionCount
                    })
                    .ToList()
            };

            return report;
        }
    }
}
