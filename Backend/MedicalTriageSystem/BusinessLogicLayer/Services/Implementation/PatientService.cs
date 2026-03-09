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
            var patients = await _unitOfWork.Patients.GetAllAsync();

            var patientList = patients.ToList();
            foreach (var patient in patientList)
            {
                if (patient.Person == null)
                {
                    patient.Person = await _unitOfWork.Persons.GetByIdAsync(patient.PersonId);
                }
            }

            return _mapper.Map<IEnumerable<PatientResponseDto>>(patientList);
        }

        public async Task<PatientResponseDto?> GetPatientByIdAsync(int id)
        {
            var patient = await _unitOfWork.Patients.GetByIdAsync(id);
            if (patient == null) return null;

            if (patient.Person == null)
            {
                patient.Person = await _unitOfWork.Persons.GetByIdAsync(patient.PersonId);
            }

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

            patient.Person = await _unitOfWork.Persons.GetByIdAsync(patient.PersonId);
            return _mapper.Map<PatientResponseDto>(patient);
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