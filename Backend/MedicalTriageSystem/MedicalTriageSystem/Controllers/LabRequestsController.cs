
using BusinessLogicLayer.DTOs.LapRequest;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/lab-requests")]
    [Authorize]
    public class LabRequestsController : ControllerBase
    {
        private readonly ILabRequestService _labRequestService;

        public LabRequestsController(ILabRequestService labRequestService)
        {
            _labRequestService = labRequestService;
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(LabRequestResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var labRequest = await _labRequestService.GetByIdAsync(id);
            if (labRequest == null) return NotFound();
            return Ok(labRequest);
        }

        [HttpGet("medical-record/{medicalRecordId}")]
        [ProducesResponseType(typeof(IEnumerable<LabRequestResponseDto>), 200)]
        public async Task<IActionResult> GetByMedicalRecord(int medicalRecordId)
        {
            var labRequests = await _labRequestService.GetByMedicalRecordIdAsync(medicalRecordId);
            return Ok(labRequests);
        }

        [HttpGet("patient/{patientId}")]
        [ProducesResponseType(typeof(IEnumerable<LabRequestResponseDto>), 200)]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            var labRequests = await _labRequestService.GetByPatientIdAsync(patientId);
            return Ok(labRequests);
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(LabRequestResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] CreateLabRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var labRequest = await _labRequestService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = labRequest.Id }, labRequest);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(LabRequestResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateLabRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var labRequest = await _labRequestService.UpdateAsync(id, dto);
            if (labRequest == null) return NotFound();
            return Ok(labRequest);
        }

        [HttpPut("{id}/upload-result")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(LabRequestResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UploadResult(int id, [FromBody] UploadLabResultDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var labRequest = await _labRequestService.UploadResultAsync(id, dto);
            if (labRequest == null) return NotFound();
            return Ok(labRequest);
        }
    }
}