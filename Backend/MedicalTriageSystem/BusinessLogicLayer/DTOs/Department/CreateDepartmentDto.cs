using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Department
{
    public class CreateDepartmentDto
    {
        [Required] public string DepartmentName { get; set; } = string.Empty;
        [Required] public string Description { get; set; } = string.Empty;
        public string? Image { get; set; }
    }
}
