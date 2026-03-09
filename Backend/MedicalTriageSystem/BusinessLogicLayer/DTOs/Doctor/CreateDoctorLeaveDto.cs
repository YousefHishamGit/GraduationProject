using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Doctor
{
    public class CreateDoctorLeaveDto
    {
        [Required]
        public DateTime LeaveDate { get; set; }
        public string? Reason { get; set; }
        public bool IsApproved { get; set; } = false;
    }
}