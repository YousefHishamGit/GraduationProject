using BusinessLogicLayer.DTOs.Appointment;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IAppointmentService
    {
        Task<IEnumerable<AppointmentResponseDto>> GetAllAsync();
        Task<AppointmentResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<AppointmentResponseDto>> GetByDoctorIdAsync(int doctorId);
        Task<IEnumerable<AppointmentResponseDto>> GetByPatientIdAsync(int patientId);
        Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto);
        Task<AppointmentResponseDto?> UpdateAsync(int id, UpdateAppointmentDto dto);
        Task<bool> DeleteAsync(int id);
        Task<AppointmentResponseDto?> ConfirmAsync(int id);
        Task<AppointmentResponseDto?> CancelAsync(int id, string? reason);
        Task<AppointmentResponseDto?> CompleteAsync(int id);
        Task<IEnumerable<AppointmentResponseDto>> CancelTimeSlotAsync(int timeSlotId, string? reason);
        Task<IEnumerable<AppointmentResponseDto>> CancelScheduleAsync(int scheduleId, string? reason);
    }
}

