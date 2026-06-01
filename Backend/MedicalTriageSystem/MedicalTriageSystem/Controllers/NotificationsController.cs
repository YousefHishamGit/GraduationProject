using BusinessLogicLayer.DTOs.Notification;
using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("patient/{patientId}")]
        [ProducesResponseType(typeof(IEnumerable<NotificationResponseDto>), 200)]
        public async Task<IActionResult> GetByPatient(int patientId)
        {
            var notifications = await _notificationService.GetByPatientIdAsync(patientId);
            return Ok(notifications);
        }

        [HttpGet("unread-count/{patientId}")]
        [ProducesResponseType(typeof(int), 200)]
        public async Task<IActionResult> GetUnreadCount(int patientId)
        {
            var count = await _notificationService.GetUnreadCountAsync(patientId);
            return Ok(count);
        }

        [HttpPut("{id}/read")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var result = await _notificationService.MarkAsReadAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpPut("read-all/{patientId}")]
        [ProducesResponseType(204)]
        public async Task<IActionResult> MarkAllAsRead(int patientId)
        {
            await _notificationService.MarkAllAsReadAsync(patientId);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(204)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _notificationService.DeleteAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        [HttpDelete("clear-all/{patientId}")]
        [ProducesResponseType(204)]
        public async Task<IActionResult> ClearAll(int patientId)
        {
            await _notificationService.ClearAllAsync(patientId);
            return NoContent();
        }
    }
}
