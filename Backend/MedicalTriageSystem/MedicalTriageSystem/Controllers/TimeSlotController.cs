using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace YourApiNamespace.Controllers
{
    [ApiController]
    [Route("api/timeslots")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class TimeSlotController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public TimeSlotController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        // GET /api/timeslots/doctor/{doctorId}/available
        // ← اللي بيستخدمه الـ Patient لحجز موعد
        [HttpGet("doctor/{doctorId}/available")]
        public async Task<IActionResult> GetAvailable(int doctorId)
        {
            var slots = await _doctorService.GetAvailableTimeSlotsAsync(doctorId);
            return Ok(slots);
        }

        // GET /api/timeslots/doctor/{doctorId}
        // ← للـ Doctor/Admin يشوف كل الـ Slots
        [HttpGet("doctor/{doctorId}")]
        
        public async Task<IActionResult> GetAll(int doctorId)
        {
            var slots = await _doctorService.GetAllTimeSlotsAsync(doctorId);
            return Ok(slots);
        }

        // GET /api/timeslots/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var slot = await _doctorService.GetTimeSlotByIdAsync(id);
            if (slot == null) return NotFound();
            return Ok(slot);
        }

        // POST /api/timeslots?doctorId={doctorId}
        [HttpPost]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> GenerateTimeSlots([FromQuery] int doctorId, [FromBody] BusinessLogicLayer.DTOs.Doctor.GenerateTimeSlotsDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var slots = await _doctorService.GenerateTimeSlotsForDateAsync(doctorId, dto.Date);
            return Ok(slots);
        }

        // PUT /api/timeslots/{id}/cancel
        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> CancelTimeSlot(int id)
        {
            var result = await _doctorService.CancelTimeSlotAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Time slot cancelled successfully" });
        }
    }
}