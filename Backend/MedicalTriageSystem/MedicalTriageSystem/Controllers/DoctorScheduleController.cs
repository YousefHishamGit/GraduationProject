using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace YourApiNamespace.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class DoctorScheduleController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public DoctorScheduleController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        [HttpGet("doctors/{doctorId}/schedule")]
        [Authorize(Roles = "Admin,Doctor,Patient,Receptionist")]
        public async Task<IActionResult> GetDoctorSchedules(int doctorId)
        {
            var schedules = await _doctorService.GetDoctorScheduleAsync(doctorId);
            return Ok(schedules);
        }

        [HttpPost("doctors/{doctorId}/schedule")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> CreateSchedule(int doctorId, [FromBody] CreateDoctorScheduleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _doctorService.CreateScheduleAsync(doctorId, dto);
                return CreatedAtAction(nameof(GetScheduleById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("schedule/{id}")]
        [Authorize(Roles = "Admin,Doctor,Patient,Receptionist")]
        public async Task<IActionResult> GetScheduleById(int id)
        {
            var schedule = await _doctorService.GetScheduleByIdAsync(id); 
            if (schedule == null)
                return NotFound();
            return Ok(schedule);
        }

        [HttpPut("schedule/{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] UpdateDoctorScheduleDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updated = await _doctorService.UpdateScheduleAsync(id, dto);
                if (updated == null)
                    return NotFound();
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("schedule/{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var deleted = await _doctorService.DeleteScheduleAsync(id);
            if (!deleted)
                return NotFound();
            return NoContent();
        }
    }
}