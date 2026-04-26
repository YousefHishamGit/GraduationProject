using AutoMapper;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using BusinessLogicLayer.DTOs.Patient;
using BusinessLogicLayer.DTOs.Appointment;
using BusinessLogicLayer.DTOs.MedicalRecord;
using BusinessLogicLayer.DTOs.Prescription;
using BusinessLogicLayer.DTOs.LapRequest;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services.Implementation
{
    public class PatientService : IPatientService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PatientService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<PatientResponseDto>> GetAllPatientsAsync()
        {
            // استخدام الدالة الجديدة التي تحمل Person مع Patient
            var patients = await _unitOfWork.Patients.GetAllWithPersonAsync();
            return _mapper.Map<IEnumerable<PatientResponseDto>>(patients);
        }

        public async Task<PatientResponseDto?> GetPatientByIdAsync(int id)
        {
            // استخدام الدالة الجديدة التي تحمل Person
            var patient = await _unitOfWork.Patients.GetPatientWithPersonAsync(id);
            if (patient == null) return null;
            return _mapper.Map<PatientResponseDto>(patient);
        }

        public async Task<PatientResponseDto?> GetPatientByUserIdAsync(string userId)
        {
            // البحث عن Patient باستخدام UserId من AspNetUsers
            var patients = await _unitOfWork.Patients.GetAllWithPersonAsync();
            var patientByUserId = patients.FirstOrDefault(p => p.UserId == userId);

            if (patientByUserId == null) return null;
            return _mapper.Map<PatientResponseDto>(patientByUserId);
        }
        public async Task<PatientResponseDto?> GetByUserIdAsync(string userId)
        {
            var patient = await _unitOfWork.Patients.GetByUserIdAsync(userId);
            if (patient == null) return null;
            return _mapper.Map<PatientResponseDto>(patient);
        }

        public async Task<PatientResponseDto> UpdatePatientAsync(int id, UpdatePatientDto dto)
        {
            var patient = await _unitOfWork.Patients.GetByIdAsync(id);
            if (patient == null)
                throw new Exception("Patient not found");

            _mapper.Map(dto, patient);
            _unitOfWork.Patients.Update(patient);
            await _unitOfWork.SaveChangesAsync();

            // إعادة جلب المريض مع Person بعد التحديث
            var updatedPatient = await _unitOfWork.Patients.GetPatientWithPersonAsync(id);
            return _mapper.Map<PatientResponseDto>(updatedPatient);
        }

        public async Task<IEnumerable<AppointmentResponseDto>> GetPatientAppointmentsAsync(int patientId)
        {
            var appointments = await _unitOfWork.Appointments.GetByPatientIdAsync(patientId);
            return _mapper.Map<IEnumerable<AppointmentResponseDto>>(appointments);
        }

        public async Task<IEnumerable<MedicalRecordResponseDto>> GetPatientMedicalRecordsAsync(int patientId)
        {
            var records = await _unitOfWork.MedicalRecords.GetByPatientIdAsync(patientId);
            return _mapper.Map<IEnumerable<MedicalRecordResponseDto>>(records);
        }

        public async Task<IEnumerable<PrescriptionResponseDto>> GetPatientPrescriptionsAsync(int patientId)
        {
            var records = await _unitOfWork.MedicalRecords.GetByPatientIdAsync(patientId);
            var prescriptionIds = records.SelectMany(r => r.Prescriptions.Select(p => p.Id)).ToList();
            var prescriptions = await _unitOfWork.Prescriptions
                .GetAllAsync(p => prescriptionIds.Contains(p.Id));
            return _mapper.Map<IEnumerable<PrescriptionResponseDto>>(prescriptions);
        }

        public async Task<IEnumerable<LabRequestResponseDto>> GetPatientLabRequestsAsync(int patientId)
        {
            var labRequests = await _unitOfWork.LabRequests.GetByPatientIdAsync(patientId);
            return _mapper.Map<IEnumerable<LabRequestResponseDto>>(labRequests);
        }
    }
}