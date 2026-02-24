using BusinessLogicLayer.DTOs.Receptionist;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IReceptionistService
    {
        Task<IEnumerable<ReceptionistResponseDto>> GetAllAsync();
        Task<ReceptionistResponseDto?> GetByIdAsync(int id);
        Task<ReceptionistResponseDto> CreateAsync(CreateReceptionistDto dto);
        Task<ReceptionistResponseDto?> UpdateAsync(int id, UpdateReceptionistDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
