using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Department
{
    public class UpdateDepartmentDto
    {
        public string? DepartmentName { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }
    }
}
