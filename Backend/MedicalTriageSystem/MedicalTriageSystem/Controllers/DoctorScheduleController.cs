using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace YourApiNamespace.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class DoctorScheduleController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public DoctorScheduleController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        // GET /api/doctors/{doctorId}/schedule
        [HttpGet("doctors/{doctorId}/schedule")]
        public async Task<IActionResult> GetDoctorSchedules(int doctorId)
        {
            var schedules = await _doctorService.GetDoctorScheduleAsync(doctorId);
            return Ok(schedules);
        }

        // GET /api/schedule/{id}
        [HttpGet("schedule/{id}")]
        public async Task<IActionResult> GetScheduleById(int id)
        {
            var schedule = await _doctorService.GetScheduleByIdAsync(id);
            if (schedule == null) return NotFound();
            return Ok(schedule);
        }

        // POST /api/doctors/{doctorId}/schedule
        [HttpPost("doctors/{doctorId}/schedule")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> CreateSchedule(
            int doctorId, [FromBody] CreateDoctorScheduleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                // Explicitly cast dto to resolve ambiguity
                var created = await _doctorService.CreateScheduleAsync(doctorId, (CreateDoctorScheduleDto)dto);
                return Ok(new
                {
                    message = "Schedule created and time slots generated successfully",
                    schedule = created
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // PUT /api/schedule/{id}
        [HttpPut("schedule/{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateSchedule(
            int id, [FromBody] UpdateDoctorScheduleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var updated = await _doctorService.UpdateScheduleAsync(id, dto);
                if (updated == null) return NotFound();
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        // DELETE /api/schedule/{id}
        [HttpDelete("schedule/{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var deleted = await _doctorService.DeleteScheduleAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}