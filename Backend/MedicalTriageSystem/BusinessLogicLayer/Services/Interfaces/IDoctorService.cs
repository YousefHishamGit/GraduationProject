using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.DTOs.Patient;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IDoctorService
    {
        // Doctors
        Task<IEnumerable<DoctorResponseDto>> GetAllDoctorsAsync();
        Task<DoctorResponseDto?> GetDoctorByIdAsync(int id);
        Task<DoctorResponseDto?> GetDoctorByUserIdAsync(string userId);
        Task<IEnumerable<DoctorResponseDto>> GetDoctorsByDepartmentAsync(int departmentId);
        Task<IEnumerable<DoctorResponseDto>> SearchAsync(string? name, int? departmentId, string? specialization);

        Task<DoctorResponseDto> CreateDoctorAsync(CreateDoctorDto dto);
        Task<DoctorResponseDto?> UpdateDoctorAsync(int id, UpdateDoctorDto dto);
        Task<DoctorResponseDto?> UploadProfileImageAsync(int doctorId, string userId, bool isAdmin, string imgPath);
        Task<bool> DeleteDoctorAsync(int id);

        // Patients & Reviews
        Task<IEnumerable<PatientResponseDto>> GetPatientsByDoctorAsync(int doctorId);
        Task<IEnumerable<DTOs.Review.ReviewResponseDto>> GetDoctorReviewsAsync(int doctorId);

        // Leaves
        Task<IEnumerable<DoctorLeaveResponseDto>> GetDoctorLeavesAsync(int doctorId);

        Task<DoctorLeaveResponseDto> CreateLeaveAsync(int doctorId, CreateDoctorLeaveDto dto);
        Task<DoctorLeaveResponseDto?> UpdateLeaveAsync(int leaveId, UpdateDoctorLeaveDto dto);
        Task<bool> DeleteLeaveAsync(int leaveId);
        Task<DoctorLeaveResponseDto?> GetLeaveByIdAsync(int leaveId);

        // Schedule
        Task<IEnumerable<DoctorScheduleResponseDto>> GetDoctorScheduleAsync(int doctorId);

        Task<DoctorScheduleResponseDto> CreateScheduleAsync(
            int doctorId,
            CreateDoctorScheduleDto dto);

        Task<DoctorScheduleResponseDto?> GetScheduleByIdAsync(int id);
        Task<DoctorScheduleResponseDto?> UpdateScheduleAsync(int id, UpdateDoctorScheduleDto dto);
        Task<bool> DeleteScheduleAsync(int id);

        // Time Slots
        Task<IEnumerable<TimeSlotResponseDto>> GetDoctorTimeSlotsAsync(int doctorId);

        Task<IEnumerable<TimeSlotResponseDto>> GetAvailableTimeSlotsAsync(int doctorId);

        Task<IEnumerable<TimeSlotResponseDto>> GetAvailableTimeSlotsByDateAsync(
            int doctorId,
            DateTime date);

        Task<IEnumerable<TimeSlotResponseDto>> GetAllTimeSlotsAsync(int doctorId);

        Task<TimeSlotResponseDto?> GetTimeSlotByIdAsync(int id);
        
        Task<IEnumerable<TimeSlotResponseDto>> GenerateTimeSlotsForDateAsync(int doctorId, DateTime targetDate);
    }               
}