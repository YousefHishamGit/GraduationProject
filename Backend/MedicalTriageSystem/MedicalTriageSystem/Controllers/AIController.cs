using BusinessLogicLayer.DTOs.AI;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/ai")]
    
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;

        public AIController(IAIService aiService)
        {
            _aiService = aiService;
        }

        [HttpPost("predict")]
        [ProducesResponseType(typeof(DiagnosisResponseDto), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Predict([FromBody] DiagnosisRequestDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _aiService.PredictAsync(dto.Symptoms);
            return Ok(result);
        }
    }
}