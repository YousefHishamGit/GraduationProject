using BusinessLogicLayer.DTOs.Auth;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Enums;
using MedicalTriageSystem.Helpers;
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
        [Consumes("multipart/form-data", "application/json")]
        [ProducesResponseType(typeof(AuthResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> RegisterPatient()
        {
            var dto = await BindRegisterPatientDtoAsync();
            if (dto == null)
                return BadRequest(new { message = "Registration data is required." });

            if (dto.Image != null)
                dto.ImgPath = await ProfileImageStorage.SaveAsync(dto.Image);

            if (!TryValidateModel(dto))
                return ValidationProblemResult();

            try
            {
                var response = await _authService.RegisterPatientAsync(dto);
                return CreatedAtAction(nameof(RegisterPatient), response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = GetFriendlyErrorMessage(ex) });
            }
        }

        [HttpPost("register/doctor")]
        [Consumes("multipart/form-data", "application/json")]
        [ProducesResponseType(typeof(AuthResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> RegisterDoctor()
        {
            var dto = await BindRegisterDoctorDtoAsync();
            if (dto == null)
                return BadRequest(new { message = "Registration data is required." });

            if (dto.Image != null)
                dto.ImgPath = await ProfileImageStorage.SaveAsync(dto.Image);

            if (dto.DepartmentId <= 0)
                ModelState.AddModelError(nameof(RegisterDoctorDto.DepartmentId), "Please select a department.");

            if (!TryValidateModel(dto))
                return ValidationProblemResult();

            try
            {
                var response = await _authService.RegisterDoctorAsync(dto);
                return CreatedAtAction(nameof(RegisterDoctor), response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = GetFriendlyErrorMessage(ex) });
            }
        }

        [HttpPost("register/admin")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(AuthResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterAdminDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblemResult();
            try
            {
                var response = await _authService.RegisterAdminAsync(dto);
                return CreatedAtAction(nameof(RegisterAdmin), response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = GetFriendlyErrorMessage(ex) });
            }
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(AuthResponseDto), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblemResult();
            try
            {
                var response = await _authService.LoginAsync(dto);
                return Ok(response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = GetFriendlyErrorMessage(ex) });
            }
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

        private async Task<RegisterPatientDto?> BindRegisterPatientDtoAsync()
        {
            if (Request.HasFormContentType)
            {
                var form = await Request.ReadFormAsync();
                return new RegisterPatientDto
                {
                    FirstName = form["FirstName"].ToString(),
                    LastName = form["LastName"].ToString(),
                    NationalID = form["NationalID"].ToString(),
                    BirthDate = DateTime.TryParse(form["BirthDate"], out var birthDate) ? birthDate : default,
                    Gender = Enum.TryParse<Gender>(form["Gender"], out var gender) ? gender : default,
                    Phone = form["Phone"].ToString(),
                    Address = form["Address"].ToString(),
                    Email = form["Email"].ToString(),
                    Password = form["Password"].ToString(),
                    BloodType = Enum.TryParse<BloodType>(form["BloodType"], out var bloodType) ? bloodType : null,
                    Allergies = form["Allergies"].ToString(),
                    MedicalHistory = form["MedicalHistory"].ToString(),
                    EmergencyContactName = form["EmergencyContactName"].ToString(),
                    EmergencyContactPhone = form["EmergencyContactPhone"].ToString(),
                    Image = form.Files.GetFile("Image")
                };
            }

            return await Request.ReadFromJsonAsync<RegisterPatientDto>();
        }

        private async Task<RegisterDoctorDto?> BindRegisterDoctorDtoAsync()
        {
            if (Request.HasFormContentType)
            {
                var form = await Request.ReadFormAsync();
                return new RegisterDoctorDto
                {
                    FirstName = form["FirstName"].ToString(),
                    LastName = form["LastName"].ToString(),
                    NationalID = form["NationalID"].ToString(),
                    BirthDate = DateTime.TryParse(form["BirthDate"], out var birthDate) ? birthDate : default,
                    Gender = Enum.TryParse<Gender>(form["Gender"], out var gender) ? gender : default,
                    Phone = form["Phone"].ToString(),
                    Address = form["Address"].ToString(),
                    Email = form["Email"].ToString(),
                    Password = form["Password"].ToString(),
                    LicenseNumber = form["LicenseNumber"].ToString(),
                    Specialization = form["Specialization"].ToString(),
                    DepartmentId = int.TryParse(form["DepartmentId"], out var departmentId) ? departmentId : 0,
                    YearsOfExperience = int.TryParse(form["YearsOfExperience"], out var years) ? years : 0,
                    ConsultationFee = decimal.TryParse(form["ConsultationFee"], out var fee) ? fee : 0,
                    HireDate = DateTime.TryParse(form["HireDate"], out var hireDate) ? hireDate : DateTime.UtcNow,
                    Bio = form["Bio"].ToString(),
                    Image = form.Files.GetFile("Image")
                };
            }

            return await Request.ReadFromJsonAsync<RegisterDoctorDto>();
        }

        private BadRequestObjectResult ValidationProblemResult()
        {
            var errors = ModelState
                .Where(entry => entry.Value?.Errors.Count > 0)
                .ToDictionary(
                    entry => entry.Key,
                    entry => entry.Value!.Errors
                        .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                            ? "Invalid value."
                            : error.ErrorMessage)
                        .ToArray());

            return BadRequest(new
            {
                message = "Please fix the following fields.",
                errors
            });
        }

        private string GetFriendlyErrorMessage(Exception ex)
        {
            // Walk the full exception chain to find the deepest (most specific) message
            var deepest = ex;
            while (deepest.InnerException != null)
                deepest = deepest.InnerException;

            string msg = deepest.Message;

            // Check for duplicate / unique constraint violations
            if (msg.Contains("NationalID", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("National ID", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("IX_Persons_NationalID", StringComparison.OrdinalIgnoreCase))
                return "This National ID is already registered.";

            if (msg.Contains("IX_Persons_Phone", StringComparison.OrdinalIgnoreCase)
                || (msg.Contains("Phone", StringComparison.OrdinalIgnoreCase) && msg.Contains("duplicate", StringComparison.OrdinalIgnoreCase)))
                return "This Phone number is already registered.";

            if (msg.Contains("LicenseNumber", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("License Number", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("IX_Doctors_LicenseNumber", StringComparison.OrdinalIgnoreCase))
                return "This License Number is already registered.";

            if (msg.Contains("UserName", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("Email", StringComparison.OrdinalIgnoreCase)
                || msg.Contains("NormalizedUserName", StringComparison.OrdinalIgnoreCase))
                return "This Email is already registered.";

            // If the deepest message is still generic, try the original exception message
            if (msg.Contains("See the inner exception", StringComparison.OrdinalIgnoreCase))
                return ex.Message;

            return msg;
        }


    }
}
