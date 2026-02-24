using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Receptionist
{
    public class UpdateReceptionistDto
    {
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; }
        public string? Image { get; set; }
    }
}
