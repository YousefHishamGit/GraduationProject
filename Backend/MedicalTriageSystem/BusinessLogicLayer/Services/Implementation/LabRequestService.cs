using AutoMapper;
using BusinessLogicLayer.DTOs.LapRequest;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class LabRequestService : ILabRequestService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public LabRequestService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<LabRequestResponseDto?> GetByIdAsync(int id)
        {
            var labRequest = await _unitOfWork.LabRequests.GetByIdAsync(id);
            if (labRequest == null) return null;
            return _mapper.Map<LabRequestResponseDto>(labRequest);
        }

        public async Task<IEnumerable<LabRequestResponseDto>> GetByMedicalRecordIdAsync(int medicalRecordId)
        {
            var labRequests = await _unitOfWork.LabRequests.GetByMedicalRecordIdAsync(medicalRecordId);
            return _mapper.Map<IEnumerable<LabRequestResponseDto>>(labRequests);
        }

        public async Task<IEnumerable<LabRequestResponseDto>> GetByPatientIdAsync(int patientId)
        {
            var labRequests = await _unitOfWork.LabRequests.GetByPatientIdAsync(patientId);
            return _mapper.Map<IEnumerable<LabRequestResponseDto>>(labRequests);
        }

        public async Task<LabRequestResponseDto> CreateAsync(CreateLabRequestDto dto)
        {
            var labRequest = _mapper.Map<LabRequest>(dto);
            await _unitOfWork.LabRequests.AddAsync(labRequest);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<LabRequestResponseDto>(labRequest);
        }

        public async Task<LabRequestResponseDto?> UpdateAsync(int id, UpdateLabRequestDto dto)
        {
            var labRequest = await _unitOfWork.LabRequests.GetByIdAsync(id);
            if (labRequest == null) return null;

            _mapper.Map(dto, labRequest);
            _unitOfWork.LabRequests.Update(labRequest);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<LabRequestResponseDto>(labRequest);
        }

        public async Task<LabRequestResponseDto?> UploadResultAsync(int id, UploadLabResultDto dto)
        {
            var labRequest = await _unitOfWork.LabRequests.GetByIdAsync(id);
            if (labRequest == null) return null;

            labRequest.ResultFilePath = dto.ResultFilePath;
            labRequest.ResultOn = DateTime.UtcNow;
            labRequest.Status = LabRequestStatus.Done;

            _unitOfWork.LabRequests.Update(labRequest);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<LabRequestResponseDto>(labRequest);
        }
    }
}
