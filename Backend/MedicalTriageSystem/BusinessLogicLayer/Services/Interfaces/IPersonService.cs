using BusinessLogicLayer.DTOs.Person;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IPersonService
    {
        Task<PersonResponseDto?> GetByIdAsync(int id);
        Task<PersonResponseDto?> UpdateAsync(int id, UpdatePersonDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
