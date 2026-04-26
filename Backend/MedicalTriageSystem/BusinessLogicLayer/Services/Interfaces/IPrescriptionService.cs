using BusinessLogicLayer.DTOs.Prescription;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IPrescriptionService
    {
        Task<PrescriptionResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<PrescriptionResponseDto>> GetByMedicalRecordIdAsync(int medicalRecordId);
        Task<PrescriptionResponseDto> CreateAsync(CreatePrescriptionDto dto);
        Task<PrescriptionResponseDto?> UpdateAsync(int id, UpdatePrescriptionDto dto);
        Task<IEnumerable<PrescriptionResponseDto>> GetByPatientIdAsync(int patientId);
        Task<bool> DeleteAsync(int id);
    }
}

