using BusinessLogicLayer.DTOs.LapRequest;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface ILabRequestService
    {
        Task<LabRequestResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<LabRequestResponseDto>> GetByMedicalRecordIdAsync(int medicalRecordId);
        Task<IEnumerable<LabRequestResponseDto>> GetByPatientIdAsync(int patientId);
        Task<LabRequestResponseDto> CreateAsync(CreateLabRequestDto dto);
        Task<LabRequestResponseDto> CreatePatientLabRequestAsync(CreatePatientLabRequestDto dto);
        Task<LabRequestResponseDto?> UpdateAsync(int id, UpdateLabRequestDto dto);
        Task<LabRequestResponseDto?> UploadResultAsync(int id, UploadLabResultDto dto);
    }
}
