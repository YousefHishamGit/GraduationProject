using System;

namespace BusinessLogicLayer.DTOs.Doctor
{
    public class UpdateDoctorLeaveDto
    {
        public DateTime? LeaveDate { get; set; }
        public string? Reason { get; set; }
        public bool? IsApproved { get; set; }
    }
}