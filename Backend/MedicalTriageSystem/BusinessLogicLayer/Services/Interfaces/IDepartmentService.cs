using BusinessLogicLayer.DTOs.Department;
using BusinessLogicLayer.DTOs.Doctor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IDepartmentService
    {
        Task<IEnumerable<DepartmentResponseDto>> GetAllAsync();
        Task<DepartmentResponseDto?> GetByIdAsync(int id);
        Task<DepartmentResponseDto> CreateAsync(CreateDepartmentDto dto);
        Task<DepartmentResponseDto?> UpdateAsync(int id, UpdateDepartmentDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<DoctorResponseDto>> GetDoctorsByDepartmentAsync(int id);
    }
}
