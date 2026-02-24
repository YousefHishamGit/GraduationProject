using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Doctor
{
    public class DoctorLeaveResponseDto
    {
        public int Id { get; set; }
        public DateTime LeaveDate { get; set; }
        public string? Reason { get; set; }
        public bool IsApproved { get; set; }
    }
}
