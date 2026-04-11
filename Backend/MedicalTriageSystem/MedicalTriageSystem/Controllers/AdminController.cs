using BusinessLogicLayer.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MedicalTriageSystem.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        
        [HttpGet("dashboard/stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _adminService.GetDashboardStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching dashboard statistics", error = ex.Message });
            }
        }

       
        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _adminService.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching users", error = ex.Message });
            }
        }

        
        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUserById(string userId)
        {
            try
            {
                var user = await _adminService.GetUserByIdAsync(userId);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching the user", error = ex.Message });
            }
        }

       
        [HttpPut("users/{userId}/activate")]
        public async Task<IActionResult> ActivateUser(string userId)
        {
            try
            {
                var result = await _adminService.ActivateUserAsync(userId);
                if (!result)
                    return NotFound(new { message = "User not found" });

                return Ok(new { message = "User activated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while activating the user", error = ex.Message });
            }
        }

        
        [HttpPut("users/{userId}/deactivate")]
        public async Task<IActionResult> DeactivateUser(string userId)
        {
            try
            {
                var result = await _adminService.DeactivateUserAsync(userId);
                if (!result)
                    return NotFound(new { message = "User not found" });

                return Ok(new { message = "User deactivated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deactivating the user", error = ex.Message });
            }
        }


        [HttpGet("reports/appointments")]
        public async Task<IActionResult> GetAppointmentsReport()
        {
            try
            {
                var report = await _adminService.GetAppointmentsReportAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching appointments report", error = ex.Message });
            }
        }

        [HttpGet("reports/revenue")]
        public async Task<IActionResult> GetRevenueReport()
        {
            try
            {
                var report = await _adminService.GetRevenueReportAsync();
                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching revenue report", error = ex.Message });
            }
        }
    }
}
