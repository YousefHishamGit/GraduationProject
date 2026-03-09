using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.DTOs.Patient;
using BusinessLogicLayer.Services.Interfaces;

namespace YourApiNamespace.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class PatientsController : ControllerBase
	{
		private readonly IPatientService _patientService;

		public PatientsController(IPatientService patientService)
		{
			_patientService = patientService;
		}

		[HttpGet]
		public async Task<IActionResult> GetAllPatients()
		{
			var patients = await _patientService.GetAllPatientsAsync();
			return Ok(patients);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetPatientById(int id)
		{
			var patient = await _patientService.GetPatientByIdAsync(id);
			if (patient == null)
				return NotFound();
			return Ok(patient);
		}

		[HttpPut("{id}")]
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