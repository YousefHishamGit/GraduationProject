using BusinessLogicLayer.DTOs.Patient;
using BusinessLogicLayer.Services.Interfaces;
using MedicalTriageSystem.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace YourApiNamespace.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	[Authorize]
	public class PatientsController : ControllerBase
	{
		private readonly IPatientService _patientService;

		public PatientsController(IPatientService patientService)
		{
			_patientService = patientService;
		}

		[HttpGet]
		[Authorize(Roles = "Admin,Doctor,Receptionist")]
		public async Task<IActionResult> GetAllPatients()
		{
			var patients = await _patientService.GetAllPatientsAsync();
			return Ok(patients);
		}

		[HttpGet("{id}")]
		[Authorize(Roles = "Admin,Doctor,Receptionist,Patient")]
		public async Task<IActionResult> GetPatientById(int id)
		{
			var patient = await _patientService.GetPatientByIdAsync(id);
			if (patient == null)
				return NotFound();
			return Ok(patient);
		}

		

		[HttpPost("{id}/profile-image")]
		[Authorize(Roles = "Admin,Patient")]
		public async Task<IActionResult> UploadProfileImage(int id, [FromForm] IFormFile image)
		{
			var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
			if (string.IsNullOrWhiteSpace(userId))
				return Unauthorized(new { message = "User is not authenticated." });

			try
			{
				var imgPath = await ProfileImageStorage.SaveAsync(image);
				var updated = await _patientService.UploadProfileImageAsync(
					id,
					userId,
					User.IsInRole("Admin"),
					imgPath);

				if (updated == null)
					return NotFound(new { message = "Patient not found." });

				return Ok(updated);
			}
			catch (UnauthorizedAccessException ex)
			{
				return Forbid();
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = ex.Message });
			}
		}

		[HttpPut("{id}")]
		[Authorize(Roles = "Admin,Patient,Doctor")]
		public async Task<IActionResult> UpdatePatient(int id, [FromBody] UpdatePatientDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				var updated = await _patientService.UpdatePatientAsync(id, dto);
				return Ok(updated);
			}
			catch (Exception ex)
			{
				return BadRequest(new { error = ex.Message });
			}
		}

		[HttpGet("{id}/appointments")]
		public async Task<IActionResult> GetPatientAppointments(int id)
		{
			var appointments = await _patientService.GetPatientAppointmentsAsync(id);
			return Ok(appointments);
		}

		[HttpGet("{id}/medical-records")]
		public async Task<IActionResult> GetPatientMedicalRecords(int id)
		{
			var records = await _patientService.GetPatientMedicalRecordsAsync(id);
			return Ok(records);
		}
        [HttpGet("by-user/{userId}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        [ProducesResponseType(typeof(PatientResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetByUserId(string userId)
        {
            var patient = await _patientService.GetByUserIdAsync(userId);
            if (patient == null) return NotFound();
            return Ok(patient);
        }

        [HttpGet("{id}/prescriptions")]
		public async Task<IActionResult> GetPatientPrescriptions(int id)
		{
			var prescriptions = await _patientService.GetPatientPrescriptionsAsync(id);
			return Ok(prescriptions);
		}

		[HttpGet("{id}/lab-requests")]
		public async Task<IActionResult> GetPatientLabRequests(int id)
		{
			var labRequests = await _patientService.GetPatientLabRequestsAsync(id);
			return Ok(labRequests);
		}
	}
}