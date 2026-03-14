using BusinessLogicLayer.DTOs.Payment;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/payments")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PaymentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var payment = await _paymentService.GetByIdAsync(id);
            if (payment == null) return NotFound();
            return Ok(payment);
        }

        [HttpGet("appointment/{appointmentId}")]
        [ProducesResponseType(typeof(PaymentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetByAppointment(int appointmentId)
        {
            var payment = await _paymentService.GetByAppointmentIdAsync(appointmentId);
            if (payment == null) return NotFound();
            return Ok(payment);
        }

        [HttpPost]
        [Authorize(Roles = "Patient,Receptionist")]
        [ProducesResponseType(typeof(PaymentResponseDto), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] CreatePaymentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var payment = await _paymentService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = payment.Id }, payment);
        }

        [HttpPut("{id}/pay")]
        [Authorize(Roles = "Admin,Receptionist")]
        [ProducesResponseType(typeof(PaymentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> MarkAsPaid(int id)
        {
            var payment = await _paymentService.MarkAsPaidAsync(id);
            if (payment == null) return NotFound();
            return Ok(payment);
        }

        [HttpPut("{id}/refund")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(PaymentResponseDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Refund(int id)
        {
            var payment = await _paymentService.RefundAsync(id);
            if (payment == null) return NotFound();
            return Ok(payment);
        }
    }
}