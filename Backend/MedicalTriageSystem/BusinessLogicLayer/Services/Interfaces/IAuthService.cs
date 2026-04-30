using BusinessLogicLayer.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterPatientAsync(RegisterPatientDto dto);
        Task<AuthResponseDto> RegisterDoctorAsync(RegisterDoctorDto dto);
        Task<AuthResponseDto> RegisterAdminAsync(RegisterAdminDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task LogoutAsync(string userId);
    }
}
