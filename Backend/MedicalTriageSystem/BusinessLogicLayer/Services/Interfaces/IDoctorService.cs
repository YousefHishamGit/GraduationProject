using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.DTOs.Patient;
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
        Task<DoctorResponseDto?> GetDoctorByUserIdAsync(string userId);
        Task<IEnumerable<DoctorResponseDto>> GetDoctorsByDepartmentAsync(int departmentId);
        Task<IEnumerable<DoctorResponseDto>> SearchAsync(string? name, int? departmentId, string? specialization);
        Task<DoctorResponseDto> CreateDoctorAsync(CreateDoctorDto dto);
        Task<DoctorResponseDto?> UpdateDoctorAsync(int id, UpdateDoctorDto dto);
        Task<bool> DeleteDoctorAsync(int id);
        Task<IEnumerable<DoctorScheduleResponseDto>> GetDoctorScheduleAsync(int doctorId);
        Task<IEnumerable<DoctorLeaveResponseDto>> GetDoctorLeavesAsync(int doctorId);
        Task<IEnumerable<TimeSlotResponseDto>> GetDoctorTimeSlotsAsync(int doctorId);
        Task<IEnumerable<PatientResponseDto>> GetPatientsByDoctorAsync(int doctorId);
        Task<IEnumerable<DTOs.Review.ReviewResponseDto>> GetDoctorReviewsAsync(int doctorId);
        Task<DoctorScheduleResponseDto> CreateScheduleAsync(int doctorId, CreateDoctorScheduleDto dto);
        Task<DoctorScheduleResponseDto?> UpdateScheduleAsync(int scheduleId, UpdateDoctorScheduleDto dto);
        Task<bool> DeleteScheduleAsync(int scheduleId);
        Task<DoctorScheduleResponseDto?> GetScheduleByIdAsync(int scheduleId);
        Task<DoctorLeaveResponseDto> CreateLeaveAsync(int doctorId, CreateDoctorLeaveDto dto);
        Task<DoctorLeaveResponseDto?> UpdateLeaveAsync(int leaveId, UpdateDoctorLeaveDto dto);
        Task<bool> DeleteLeaveAsync(int leaveId);
        Task<DoctorLeaveResponseDto?> GetLeaveByIdAsync(int leaveId);
        Task<IEnumerable<TimeSlotResponseDto>> GenerateTimeSlotsAsync(int doctorId, GenerateTimeSlotsDto dto);
        Task<bool> DeleteTimeSlotAsync(int timeSlotId);
        Task<IEnumerable<TimeSlotResponseDto>> GetAvailableTimeSlotsByDateAsync(int doctorId, DateTime date);
    }
}
