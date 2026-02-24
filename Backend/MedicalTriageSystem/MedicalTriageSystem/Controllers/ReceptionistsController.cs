using BusinessLogicLayer.DTOs.Receptionist;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceptionistsController : ControllerBase
    {
        private readonly IReceptionistService _receptionistService;

        public ReceptionistsController(IReceptionistService receptionistService)
        {
            _receptionistService = receptionistService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(IEnumerable<ReceptionistResponseDto>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var receptionists = await _receptionistService.GetAllAsync();
            return Ok(receptionists);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ReceptionistResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var receptionist = await _receptionistService.GetByIdAsync(id);
            if (receptionist == null) return NotFound();
            return Ok(receptionist);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ReceptionistResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromForm] CreateReceptionistDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var receptionist = await _receptionistService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = receptionist.Id }, receptionist);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(ReceptionistResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateReceptionistDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var receptionist = await _receptionistService.UpdateAsync(id, dto);
            if (receptionist == null) return NotFound();
            return Ok(receptionist);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _receptionistService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
