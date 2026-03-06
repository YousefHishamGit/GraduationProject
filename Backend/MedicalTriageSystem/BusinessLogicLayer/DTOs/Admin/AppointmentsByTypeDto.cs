using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Admin
{
    public class AppointmentsByTypeDto
    {
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
