using BusinessLogicLayer.DTOs.Auth;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register/patient")]
        [ProducesResponseType(typeof(AuthResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> RegisterPatient([FromBody] RegisterPatientDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _authService.RegisterPatientAsync(dto);
            return CreatedAtAction(nameof(RegisterPatient), response);
        }

        [HttpPost("register/doctor")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(AuthResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> RegisterDoctor([FromBody] RegisterDoctorDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _authService.RegisterDoctorAsync(dto);
            return CreatedAtAction(nameof(RegisterDoctor), response);
        }

        [HttpPost("register/admin")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(AuthResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _authService.RegisterAdminAsync(dto);
            return CreatedAtAction(nameof(RegisterAdmin), response);
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var response = await _authService.LoginAsync(dto);
            return Ok(response);
        }

        [HttpPost("logout")]
        [Authorize]
        [ProducesResponseType(200)]
        public async Task<IActionResult> Logout()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value!;
            await _authService.LogoutAsync(userId);
            return Ok(new { message = "Logged out successfully" });
        }
    }
}