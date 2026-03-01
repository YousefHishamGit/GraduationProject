using AutoMapper;
using BusinessLogicLayer.DTOs.Department;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class DepartmentService : IDepartmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public DepartmentService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<DepartmentResponseDto>> GetAllAsync()
        {
            var departments = await _unitOfWork.Departments.GetAllActiveAsync();
            return _mapper.Map<IEnumerable<DepartmentResponseDto>>(departments);
        }

        public async Task<DepartmentResponseDto?> GetByIdAsync(int id)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(id);
            if (department == null || department.IsDeleted) return null;
            return _mapper.Map<DepartmentResponseDto>(department);
        }

        public async Task<DepartmentResponseDto> CreateAsync(CreateDepartmentDto dto)
        {
            var department = _mapper.Map<Department>(dto);
            await _unitOfWork.Departments.AddAsync(department);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<DepartmentResponseDto>(department);
        }

        public async Task<DepartmentResponseDto?> UpdateAsync(int id, UpdateDepartmentDto dto)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(id);
            if (department == null || department.IsDeleted) return null;

            _mapper.Map(dto, department);
            _unitOfWork.Departments.Update(department);
            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<DepartmentResponseDto>(department);
        }
        public async Task<bool> DeleteAsync(int id)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(id);
            if (department == null || department.IsDeleted) return false;

            // Soft Delete
            department.IsDeleted = true;
            department.DeletedOn = DateTime.UtcNow;

            _unitOfWork.Departments.Update(department);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<DoctorResponseDto>> GetDoctorsByDepartmentAsync(int id)
        {
            var department = await _unitOfWork.Departments.GetWithDoctorsAsync(id);
            if (department == null) return Enumerable.Empty<DoctorResponseDto>();
            return _mapper.Map<IEnumerable<DoctorResponseDto>>(department.Doctors);
        }
    }
}
