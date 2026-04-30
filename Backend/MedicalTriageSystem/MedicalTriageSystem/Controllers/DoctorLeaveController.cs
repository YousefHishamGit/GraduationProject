using Microsoft.AspNetCore.Mvc;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace YourApiNamespace.Controllers
{
	[ApiController]
	[Route("api")]
	[Authorize]
	public class DoctorLeaveController : ControllerBase
	{
		private readonly IDoctorService _doctorService;

		public DoctorLeaveController(IDoctorService doctorService)
		{
			_doctorService = doctorService;
		}

		[HttpGet("doctors/{doctorId}/leaves")]
		[Authorize(Roles = "Admin,Doctor")]
		public async Task<IActionResult> GetDoctorLeaves(int doctorId)
		{
			var leaves = await _doctorService.GetDoctorLeavesAsync(doctorId);
			return Ok(leaves);
		}

		[HttpPost("doctors/{doctorId}/leaves")]
		[Authorize(Roles = "Admin,Doctor")]
		public async Task<IActionResult> CreateLeave(int doctorId, [FromBody] CreateDoctorLeaveDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				var created = await _doctorService.CreateLeaveAsync(doctorId, dto);
				return CreatedAtAction(nameof(GetLeaveById), new { id = created.Id }, created);
			}
			catch (Exception ex)
			{
				return BadRequest(new { error = ex.Message });
			}
		}

		[HttpGet("leaves/{id}")]
		[Authorize(Roles = "Admin,Doctor")]
		public async Task<IActionResult> GetLeaveById(int id)
		{
			var leave = await _doctorService.GetLeaveByIdAsync(id);
			if (leave == null)
				return NotFound();
			return Ok(leave);
		}

		[HttpPut("leaves/{id}")]
		[Authorize(Roles = "Admin,Doctor")]
		public async Task<IActionResult> UpdateLeave(int id, [FromBody] UpdateDoctorLeaveDto dto)
		{
			if (!ModelState.IsValid)
				return BadRequest(ModelState);

			try
			{
				var updated = await _doctorService.UpdateLeaveAsync(id, dto);
				if (updated == null)
					return NotFound();
				return Ok(updated);
			}
			catch (Exception ex)
			{
				return BadRequest(new { error = ex.Message });
			}
		}

		[HttpDelete("leaves/{id}")]
		[Authorize(Roles = "Admin,Doctor")]
		public async Task<IActionResult> DeleteLeave(int id)
		{
			var deleted = await _doctorService.DeleteLeaveAsync(id);
			if (!deleted)
				return NotFound();
			return NoContent();
		}
	}
}
