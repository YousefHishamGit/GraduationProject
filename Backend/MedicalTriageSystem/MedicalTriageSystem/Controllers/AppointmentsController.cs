using BusinessLogicLayer.DTOs.Appointment;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentsController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentsController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        // GET /api/appointments - Admin only
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(IEnumerable<AppointmentResponseDto>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var appointments = await _appointmentService.GetAllAsync();
            return Ok(appointments);
        }

        // GET /api/appointments/{id} - All authenticated
        [HttpGet("{id}")]
        [Authorize]
        [ProducesResponseType(typeof(AppointmentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var appointment = await _appointmentService.GetByIdAsync(id);
            if (appointment == null) return NotFound();
            return Ok(appointment);
        }

        // POST /api/appointments - Patient
        [HttpPost]
        [Authorize(Roles = "Patient")]
        [ProducesResponseType(typeof(AppointmentResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var appointment = await _appointmentService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = appointment.Id }, appointment);
        }

        // PUT /api/appointments/{id} - Patient
        [HttpPut("{id}")]
        [Authorize(Roles = "Patient")]
        [ProducesResponseType(typeof(AppointmentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAppointmentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var appointment = await _appointmentService.UpdateAsync(id, dto);
            if (appointment == null) return NotFound();
            return Ok(appointment);
        }

        // DELETE /api/appointments/{id} - Patient
        [HttpDelete("{id}")]
        [Authorize(Roles = "Patient")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _appointmentService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // PUT /api/appointments/{id}/confirm - Doctor/Receptionist
        [HttpPut("{id}/confirm")]
        [Authorize(Roles = "Doctor,Receptionist")]
        [ProducesResponseType(typeof(AppointmentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Confirm(int id)
        {
            var appointment = await _appointmentService.ConfirmAsync(id);
            if (appointment == null) return NotFound();
            return Ok(appointment);
        }

        // PUT /api/appointments/{id}/cancel - Doctor/Receptionist
        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "Doctor,Receptionist")]
        [ProducesResponseType(typeof(AppointmentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Cancel(int id, [FromBody] CancelAppointmentDto dto)
        {
            var appointment = await _appointmentService.CancelAsync(id, dto.Reason);
            if (appointment == null) return NotFound();
            return Ok(appointment);
        }

        // PUT /api/appointments/{id}/complete - Doctor
        [HttpPut("{id}/complete")]
        [Authorize(Roles = "Doctor")]
        [ProducesResponseType(typeof(AppointmentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Complete(int id)
        {
            var appointment = await _appointmentService.CompleteAsync(id);
            if (appointment == null) return NotFound();
            return Ok(appointment);
        }

        // GET /api/appointments/doctor/{doctorId} - All authenticated
        [HttpGet("doctor/{doctorId}")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<AppointmentResponseDto>), 200)]
        public async Task<IActionResult> GetByDoctor(int doctorId)
        {
            var appointments = await _appointmentService.GetByDoctorIdAsync(doctorId);
            return Ok(appointments);
        }

        // GET /api/appointments/patient/{patientId} - All authenticated
        [HttpGet("patient/{patientId}")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<AppointmentResponseDto>), 200)]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            var appointments = await _appointmentService.GetByPatientIdAsync(patientId);
            return Ok(appointments);
        }
    }
}

