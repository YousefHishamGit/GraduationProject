using BusinessLogicLayer.DTOs.MedicalRecord;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IMedicalRecordService
    {
        Task<MedicalRecordResponseDto?> GetByIdAsync(int id);
        Task<MedicalRecordResponseDto?> GetByAppointmentIdAsync(int appointmentId);
        Task<IEnumerable<MedicalRecordResponseDto>> GetByPatientIdAsync(int patientId);
        Task<MedicalRecordResponseDto> CreateAsync(CreateMedicalRecordDto dto);
        Task<MedicalRecordResponseDto?> UpdateAsync(int id, UpdateMedicalRecordDto dto);
    }
}

