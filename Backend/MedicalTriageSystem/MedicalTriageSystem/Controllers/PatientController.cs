using BusinessLogicLayer.DTOs.Patient;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

		

		[HttpPut("{id}")]
		[Authorize(Roles = "Admin,Patient")]
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