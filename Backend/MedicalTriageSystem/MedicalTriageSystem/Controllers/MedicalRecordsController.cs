using BusinessLogicLayer.DTOs.MedicalRecord;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
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
    }
}

