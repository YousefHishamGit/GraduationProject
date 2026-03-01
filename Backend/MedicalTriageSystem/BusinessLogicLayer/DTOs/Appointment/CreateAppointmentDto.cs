using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Appointment
{
    public class CreateAppointmentDto
    {
        public int PatientId { get; set; }
        public int DoctorId { get; set; }
        public int TimeSlotId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string Type { get; set; } = "InPerson";
        public string? Notes { get; set; }
    }
}
