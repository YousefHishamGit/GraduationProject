using BusinessLogicLayer.DTOs.MedicalRecord;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/medical-records")]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IMedicalRecordService _medicalRecordService;

        public MedicalRecordsController(IMedicalRecordService medicalRecordService)
        {
            _medicalRecordService = medicalRecordService;
        }

        // GET /api/medical-records/{id} - All
        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(MedicalRecordResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await _medicalRecordService.GetByIdAsync(id);
            if (record == null) return NotFound();
            return Ok(record);
        }

        // POST /api/medical-records - Doctor
        [HttpPost]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(MedicalRecordResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] CreateMedicalRecordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var record = await _medicalRecordService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = record.Id }, record);
        }

        // PUT /api/medical-records/{id} - Doctor
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(MedicalRecordResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateMedicalRecordDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var record = await _medicalRecordService.UpdateAsync(id, dto);
            if (record == null) return NotFound();
            return Ok(record);
        }

        // GET /api/medical-records/appointment/{appointmentId} - All
        [HttpGet("appointment/{appointmentId}")]
        [Authorize]
        [ProducesResponseType(typeof(MedicalRecordResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetByAppointment(int appointmentId)
        {
            var record = await _medicalRecordService.GetByAppointmentIdAsync(appointmentId);
            if (record == null) return NotFound();
            return Ok(record);
        }

        // GET /api/medical-records/patient/{patientId} - All
        [HttpGet("patient/{patientId}")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<MedicalRecordResponseDto>), 200)]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            var records = await _medicalRecordService.GetByPatientIdAsync(patientId);
            return Ok(records);
        }

        // POST /api/medical-records/{id}/upload-attachment - Doctor
        [HttpPost("{id}/upload-attachment")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(MedicalRecordResponseDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> UploadAttachment(int id, [FromForm] IFormFile file)
        {
            var record = await _medicalRecordService.GetByIdAsync(id);
            if (record == null) return NotFound(new { message = "Medical record not found." });

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (file.ContentType != "application/pdf" && !file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Only PDF files are allowed." });

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "medical_records");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/medical_records/{uniqueFileName}";
            var updatedRecord = await _medicalRecordService.UploadAttachmentAsync(id, relativePath);

            return Ok(updatedRecord);
        }

        // DELETE /api/medical-records/{id}/remove-attachment - Doctor
        [HttpDelete("{id}/remove-attachment")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(MedicalRecordResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> RemoveAttachment(int id)
        {
            var record = await _medicalRecordService.GetByIdAsync(id);
            if (record == null) return NotFound(new { message = "Medical record not found." });

            if (!string.IsNullOrEmpty(record.AttachedFilePath))
            {
                var physicalPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", record.AttachedFilePath.TrimStart('/'));
                if (System.IO.File.Exists(physicalPath))
                {
                    System.IO.File.Delete(physicalPath);
                }
            }

            var updatedRecord = await _medicalRecordService.DeleteAttachmentAsync(id);
            return Ok(updatedRecord);
        }

        // DELETE /api/medical-records/{id} - Patient
        [HttpDelete("{id}")]
        [Authorize(Roles = "Patient")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _medicalRecordService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Medical record not found." });

            return Ok(new { message = "Medical record deleted successfully." });
        }
    }
}

