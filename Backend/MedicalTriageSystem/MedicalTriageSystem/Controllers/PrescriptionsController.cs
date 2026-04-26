using BusinessLogicLayer.DTOs.Prescription;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/prescriptions")]
    public class PrescriptionsController : ControllerBase
    {
        private readonly IPrescriptionService _prescriptionService;

        public PrescriptionsController(IPrescriptionService prescriptionService)
        {
            _prescriptionService = prescriptionService;
        }

        // GET /api/prescriptions/{id} - All
        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(PrescriptionResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var prescription = await _prescriptionService.GetByIdAsync(id);
            if (prescription == null) return NotFound();
            return Ok(prescription);
        }

        // POST /api/prescriptions - Doctor
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(PrescriptionResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] CreatePrescriptionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var prescription = await _prescriptionService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = prescription.Id }, prescription);
        }

        // PUT /api/prescriptions/{id} - Doctor
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(PrescriptionResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePrescriptionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var prescription = await _prescriptionService.UpdateAsync(id, dto);
            if (prescription == null) return NotFound();
            return Ok(prescription);
        }

        // DELETE /api/prescriptions/{id} - Doctor
        [HttpDelete("{id}")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _prescriptionService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // GET /api/prescriptions/medical-record/{id} - All
        [HttpGet("medical-record/{id}")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<PrescriptionResponseDto>), 200)]
        public async Task<IActionResult> GetByMedicalRecord(int id)
        {
            var prescriptions = await _prescriptionService.GetByMedicalRecordIdAsync(id);
            return Ok(prescriptions);
        }
        [HttpGet("patient/{patientId}")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<PrescriptionResponseDto>), 200)]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            var prescriptions = await _prescriptionService.GetByPatientIdAsync(patientId);
            return Ok(prescriptions);
        }
    }
}

