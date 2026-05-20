using AutoMapper;
using BusinessLogicLayer.DTOs.MedicalRecord;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class MedicalRecordService : IMedicalRecordService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public MedicalRecordService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<MedicalRecordResponseDto?> GetByIdAsync(int id)
        {
            var record = await _unitOfWork.MedicalRecords.GetByIdAsync(id);
            if (record == null) return null;
            return _mapper.Map<MedicalRecordResponseDto>(record);
        }

        public async Task<MedicalRecordResponseDto?> GetByAppointmentIdAsync(int appointmentId)
        {
            var record = await _unitOfWork.MedicalRecords.GetByAppointmentIdAsync(appointmentId);
            if (record == null) return null;
            return _mapper.Map<MedicalRecordResponseDto>(record);
        }

        public async Task<IEnumerable<MedicalRecordResponseDto>> GetByPatientIdAsync(int patientId)
        {
            var records = await _unitOfWork.MedicalRecords.GetByPatientIdAsync(patientId);
            return _mapper.Map<IEnumerable<MedicalRecordResponseDto>>(records);
        }

        public async Task<MedicalRecordResponseDto> CreateAsync(CreateMedicalRecordDto dto)
        {
            var record = new MedicalRecord
            {
                AppointmentId = dto.AppointmentId,
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                Diagnosis = dto.Diagnosis,
                Notes = dto.Notes,
                VitalSigns = dto.VitalSigns,
                CreatedOn = DateTime.UtcNow
            };

            await _unitOfWork.MedicalRecords.AddAsync(record);
            await _unitOfWork.SaveChangesAsync();

            var created = await _unitOfWork.MedicalRecords.GetByIdAsync(record.Id);
            return _mapper.Map<MedicalRecordResponseDto>(created);
        }

        public async Task<MedicalRecordResponseDto?> UpdateAsync(int id, UpdateMedicalRecordDto dto)
        {
            var record = await _unitOfWork.MedicalRecords.GetByIdAsync(id);
            if (record == null) return null;

            if (dto.Diagnosis != null) record.Diagnosis = dto.Diagnosis;
            if (dto.Notes != null) record.Notes = dto.Notes;
            if (dto.VitalSigns != null) record.VitalSigns = dto.VitalSigns;

            _unitOfWork.MedicalRecords.Update(record);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _unitOfWork.MedicalRecords.GetByIdAsync(id);
            return _mapper.Map<MedicalRecordResponseDto>(updated);
        }

        public async Task<MedicalRecordResponseDto?> UploadAttachmentAsync(int id, string filePath)
        {
            var record = await _unitOfWork.MedicalRecords.GetByIdAsync(id);
            if (record == null) return null;

            record.AttachedFilePath = filePath;
            _unitOfWork.MedicalRecords.Update(record);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _unitOfWork.MedicalRecords.GetByIdAsync(id);
            return _mapper.Map<MedicalRecordResponseDto>(updated);
        }

        public async Task<MedicalRecordResponseDto?> DeleteAttachmentAsync(int id)
        {
            var record = await _unitOfWork.MedicalRecords.GetByIdAsync(id);
            if (record == null) return null;

            record.AttachedFilePath = null;
            _unitOfWork.MedicalRecords.Update(record);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _unitOfWork.MedicalRecords.GetByIdAsync(id);
            return _mapper.Map<MedicalRecordResponseDto>(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var record = await _unitOfWork.MedicalRecords.GetByIdAsync(id);
            if (record == null) return false;

            if (!string.IsNullOrEmpty(record.AttachedFilePath))
            {
                var physicalPath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "wwwroot", record.AttachedFilePath.TrimStart('/'));
                if (System.IO.File.Exists(physicalPath))
                {
                    System.IO.File.Delete(physicalPath);
                }
            }

            _unitOfWork.MedicalRecords.Delete(record);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}

