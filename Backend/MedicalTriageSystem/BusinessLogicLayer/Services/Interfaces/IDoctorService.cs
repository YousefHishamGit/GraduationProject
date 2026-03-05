using BusinessLogicLayer.DTOs.Doctor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IDoctorService
    {
        Task<IEnumerable<DoctorResponseDto>> GetAllDoctorsAsync();
        Task<DoctorResponseDto?> GetDoctorByIdAsync(int id);
        Task<IEnumerable<DoctorResponseDto>> GetDoctorsByDepartmentAsync(int departmentId);
        Task<IEnumerable<DoctorResponseDto>> SearchAsync(string? name, int? departmentId, string? specialization);
        Task<DoctorResponseDto> CreateDoctorAsync(CreateDoctorDto dto);
        Task<DoctorResponseDto?> UpdateDoctorAsync(int id, UpdateDoctorDto dto);
        Task<bool> DeleteDoctorAsync(int id);
        Task<IEnumerable<DoctorScheduleResponseDto>> GetDoctorScheduleAsync(int doctorId);
        Task<IEnumerable<DoctorLeaveResponseDto>> GetDoctorLeavesAsync(int doctorId);
        Task<IEnumerable<TimeSlotResponseDto>> GetDoctorTimeSlotsAsync(int doctorId);
        Task<IEnumerable<DTOs.Review.ReviewResponseDto>> GetDoctorReviewsAsync(int doctorId);
    }
}
