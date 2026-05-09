using BusinessLogicLayer.DTOs.Review;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/reviews")]
    [Authorize]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // GET /api/reviews/doctor/{doctorId}
        [HttpGet("doctor/{doctorId}")]
        [ProducesResponseType(typeof(IEnumerable<ReviewResponseDto>), 200)]
        public async Task<IActionResult> GetByDoctor(int doctorId)
        {
            var reviews = await _reviewService.GetByDoctorIdAsync(doctorId);
            return Ok(reviews);
        }

        [HttpPost]
        [Authorize(Roles = "Patient")]
        [ProducesResponseType(typeof(ReviewResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var review = await _reviewService.CreateAsync(dto);
            return Ok(review);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Patient")]
        [ProducesResponseType(typeof(ReviewResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateReviewDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var review = await _reviewService.UpdateAsync(id, dto);
            if (review == null) return NotFound();
            return Ok(review);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Patient")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _reviewService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}