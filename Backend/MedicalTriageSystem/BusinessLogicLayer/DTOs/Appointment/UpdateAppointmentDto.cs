using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Appointment
{
    public class UpdateAppointmentDto
    {
        public DateTime? AppointmentDate { get; set; }
        public string? Type { get; set; }
        public string? Notes { get; set; }
    }
}
