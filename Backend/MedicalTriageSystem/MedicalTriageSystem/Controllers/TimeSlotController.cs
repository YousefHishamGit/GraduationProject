using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace YourApiNamespace.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class TimeSlotController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public TimeSlotController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        [HttpGet("doctors/{doctorId}/timeslots")]
        [Authorize(Roles = "Admin,Doctor,Patient,Receptionist")]
        public async Task<IActionResult> GetAvailableTimeSlots(int doctorId, [FromQuery] DateTime date)
        {
            var slots = await _doctorService.GetAvailableTimeSlotsByDateAsync(doctorId, date);
            return Ok(slots);
        }

        [HttpPost("timeslots")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GenerateTimeSlots([FromBody] GenerateTimeSlotsDto dto, [FromQuery] int doctorId)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var slots = await _doctorService.GenerateTimeSlotsAsync(doctorId, dto);
                return Ok(slots);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("timeslots/{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> DeleteTimeSlot(int id)
        {
            try
            {
                var deleted = await _doctorService.DeleteTimeSlotAsync(id);
                if (!deleted)
                    return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}