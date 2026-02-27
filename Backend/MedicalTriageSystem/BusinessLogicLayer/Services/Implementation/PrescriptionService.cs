using AutoMapper;
using BusinessLogicLayer.DTOs.Prescription;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PrescriptionService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PrescriptionResponseDto?> GetByIdAsync(int id)
        {
            var entity = await _unitOfWork.Prescriptions.GetByIdAsync(id);
            if (entity == null) return null;
            return _mapper.Map<PrescriptionResponseDto>(entity);
        }

        public async Task<IEnumerable<PrescriptionResponseDto>> GetByMedicalRecordIdAsync(int medicalRecordId)
        {
            var entities = await _unitOfWork.Prescriptions.GetByMedicalRecordIdAsync(medicalRecordId);
            return _mapper.Map<IEnumerable<PrescriptionResponseDto>>(entities);
        }

        public async Task<PrescriptionResponseDto> CreateAsync(CreatePrescriptionDto dto)
        {
            var entity = new Prescription
            {
                MedicalRecordId = dto.MedicalRecordId,
                MedicineName = dto.MedicineName,
                Dosage = dto.Dosage,
                Frequency = dto.Frequency,
                DurationDays = dto.DurationDays,
                Instructions = dto.Instructions
            };

            await _unitOfWork.Prescriptions.AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();

            var created = await _unitOfWork.Prescriptions.GetByIdAsync(entity.Id);
            return _mapper.Map<PrescriptionResponseDto>(created);
        }

        public async Task<PrescriptionResponseDto?> UpdateAsync(int id, UpdatePrescriptionDto dto)
        {
            var entity = await _unitOfWork.Prescriptions.GetTrackedByIdAsync(id);
            if (entity == null) return null;

            if (dto.MedicineName != null) entity.MedicineName = dto.MedicineName;
            if (dto.Dosage != null) entity.Dosage = dto.Dosage;
            if (dto.Frequency != null) entity.Frequency = dto.Frequency;
            if (dto.DurationDays.HasValue) entity.DurationDays = dto.DurationDays.Value;
            if (dto.Instructions != null) entity.Instructions = dto.Instructions;

            _unitOfWork.Prescriptions.Update(entity);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _unitOfWork.Prescriptions.GetByIdAsync(id);
            return _mapper.Map<PrescriptionResponseDto>(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Prescriptions.GetTrackedByIdAsync(id);
            if (entity == null) return false;

            _unitOfWork.Prescriptions.Delete(entity);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}

