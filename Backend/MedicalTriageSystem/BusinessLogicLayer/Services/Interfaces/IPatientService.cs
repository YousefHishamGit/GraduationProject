using BusinessLogicLayer.DTOs.Patient;
using BusinessLogicLayer.DTOs.Appointment;
using BusinessLogicLayer.DTOs.MedicalRecord;
using BusinessLogicLayer.DTOs.Prescription;
using BusinessLogicLayer.DTOs.LapRequest;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IPatientService
    {
        Task<IEnumerable<PatientResponseDto>> GetAllPatientsAsync();
        Task<PatientResponseDto?> GetPatientByIdAsync(int id);
        Task<PatientResponseDto> UpdatePatientAsync(int id, UpdatePatientDto dto);

        Task<IEnumerable<AppointmentResponseDto>> GetPatientAppointmentsAsync(int patientId);
        Task<IEnumerable<MedicalRecordResponseDto>> GetPatientMedicalRecordsAsync(int patientId);
        Task<IEnumerable<PrescriptionResponseDto>> GetPatientPrescriptionsAsync(int patientId);
        Task<IEnumerable<LabRequestResponseDto>> GetPatientLabRequestsAsync(int patientId);
    }
}