
using System;
using System.IO;
using System.Threading.Tasks;
using BusinessLogicLayer.DTOs.LapRequest;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        [HttpPost("doctor-request")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(LabRequestResponseDto), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> DoctorRequest([FromBody] CreatePatientLabRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var labRequest = await _labRequestService.CreatePatientLabRequestAsync(dto);
            return Ok(labRequest);
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
        [Authorize(Roles = "Doctor,Patient")]
        [ProducesResponseType(typeof(LabRequestResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UploadResult(int id, [FromBody] UploadLabResultDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var labRequest = await _labRequestService.UploadResultAsync(id, dto);
            if (labRequest == null) return NotFound();
            return Ok(labRequest);
        }

        [HttpPost("{id}/upload-result-file")]
        [Authorize(Roles = "Doctor,Patient")]
        [ProducesResponseType(typeof(LabRequestResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UploadResultFile(int id, [FromForm] IFormFile file)
        {
            var labRequest = await _labRequestService.GetByIdAsync(id);
            if (labRequest == null) return NotFound(new { message = "Lab request not found." });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            // Removed file type restrictions to allow any file type
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "lab_results");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/lab_results/{uniqueFileName}";
            var dto = new UploadLabResultDto { ResultFilePath = relativePath };
            var updatedRequest = await _labRequestService.UploadResultAsync(id, dto);

            return Ok(updatedRequest);
        }

        [HttpPost("patient-upload")]
        [Authorize(Roles = "Patient")]
        [ProducesResponseType(typeof(LabRequestResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> PatientUpload([FromForm] int patientId, [FromForm] string testName, [FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            // Removed file type restrictions to allow any file type
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(testName))
                return BadRequest(new { message = "Test name is required." });

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "lab_results");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/lab_results/{uniqueFileName}";

            var createDto = new CreatePatientLabRequestDto
            {
                PatientId = patientId,
                TestName = testName
            };

            var newLabRequest = await _labRequestService.CreatePatientLabRequestAsync(createDto);

            var uploadDto = new UploadLabResultDto { ResultFilePath = relativePath };
            var updatedRequest = await _labRequestService.UploadResultAsync(newLabRequest.Id, uploadDto);

            return Ok(updatedRequest);
        }
    }
}