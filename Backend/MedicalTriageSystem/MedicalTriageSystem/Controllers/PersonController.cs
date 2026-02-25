using BusinessLogicLayer.DTOs.Person;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PersonsController : ControllerBase
    {
        private readonly IPersonService _personService;

        public PersonsController(IPersonService personService)
        {
            _personService = personService;
        }

        
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PersonResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var person = await _personService.GetByIdAsync(id);
            if (person == null) return NotFound();
            return Ok(person);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(PersonResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePersonDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var person = await _personService.UpdateAsync(id, dto);
            if (person == null) return NotFound();
            return Ok(person);
        }
       

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _personService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }

}
