using DataAccessLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interfaces
{
    public interface IDoctorRepository:IGenericRepository<Doctor>
    {
        Task<Doctor?> GetDoctorWithDetailsAsync(int id);
        Task<IEnumerable<Doctor>> GetAllWithDetailsAsync();
        Task<IEnumerable<Doctor>> GetByDepartmentAsync(int departmentId);
        Task<IEnumerable<Doctor>> SearchAsync(string? name, int? departmentId, string? specialization);
        Task<bool> IsLicenseNumberUniqueAsync(string licenseNumber, int? excludeDoctorId = null);
        Task<IEnumerable<DoctorSchedule>> GetDoctorScheduleAsync(int doctorId);
        Task<IEnumerable<DoctorLeave>> GetDoctorLeavesAsync(int doctorId);
        Task<IEnumerable<TimeSlot>> GetDoctorTimeSlotsAsync(int doctorId);
        Task<IEnumerable<Review>> GetDoctorReviewsAsync(int doctorId);
    }
}
