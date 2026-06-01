using BusinessLogicLayer.DTOs.Review;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.Services.Interfaces;
using MedicalTriageSystem.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorsController : ControllerBase
    {
        private readonly IDoctorService _doctorService;

        public DoctorsController(IDoctorService doctorService)
        {
            _doctorService = doctorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var doctors = await _doctorService.GetAllDoctorsAsync();
            return Ok(doctors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var doctor = await _doctorService.GetDoctorByIdAsync(id);
            if (doctor == null) return NotFound();
            return Ok(doctor);
        }

        [HttpGet("by-user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetByUserId(string userId)
        {
            var doctor = await _doctorService.GetDoctorByUserIdAsync(userId);
            if (doctor == null) return NotFound();
            return Ok(doctor);
        }

        [HttpGet("department/{departmentId}")]
        public async Task<IActionResult> GetByDepartment(int departmentId)
        {
            var doctors = await _doctorService.GetDoctorsByDepartmentAsync(departmentId);
            return Ok(doctors);
        }

        
        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? name,
            [FromQuery] int? departmentId,
            [FromQuery] string? specialization)
        {
            var doctors = await _doctorService.SearchAsync(name, departmentId, specialization);
            return Ok(doctors);
        }

        
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] CreateDoctorDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var doctor = await _doctorService.CreateDoctorAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = doctor.Id }, doctor);
        }

       
        [HttpPost("{id}/profile-image")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UploadProfileImage(int id, [FromForm] IFormFile image)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "User is not authenticated." });

            try
            {
                var imgPath = await ProfileImageStorage.SaveAsync(image);
                var updated = await _doctorService.UploadProfileImageAsync(
                    id,
                    userId,
                    User.IsInRole("Admin"),
                    imgPath);

                if (updated == null)
                    return NotFound(new { message = "Doctor not found." });

                return Ok(updated);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDoctorDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var doctor = await _doctorService.UpdateDoctorAsync(id, dto);
            if (doctor == null) return NotFound();
            return Ok(doctor);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _doctorService.DeleteDoctorAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }


        
       

       
        [HttpGet("{id}/leaves")]
        [ProducesResponseType(typeof(IEnumerable<DoctorLeaveResponseDto>), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetLeaves(int id)
        {
            var doctor = await _doctorService.GetDoctorByIdAsync(id);
            if (doctor == null) return NotFound();

            var leaves = await _doctorService.GetDoctorLeavesAsync(id);
            return Ok(leaves);
        }

        [HttpGet("{id}/timeslots")]
        [ProducesResponseType(typeof(IEnumerable<TimeSlotResponseDto>), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetTimeSlots(int id, [FromQuery] DateTime? date)
        {
            var doctor = await _doctorService.GetDoctorByIdAsync(id);
            if (doctor == null) return NotFound();

            var slots = await _doctorService.GetDoctorTimeSlotsAsync(id, date);
            return Ok(slots);
        }

        
        [HttpGet("{id}/reviews")]
        [ProducesResponseType(typeof(IEnumerable<ReviewResponseDto>), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetReviews(int id)
        {
            var doctor = await _doctorService.GetDoctorByIdAsync(id);
            if (doctor == null) return NotFound();

            var reviews = await _doctorService.GetDoctorReviewsAsync(id);
            return Ok(reviews);
        }






    }
}
