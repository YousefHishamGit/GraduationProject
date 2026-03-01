using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Department
{
    public class DepartmentResponseDto
    {
        public int Id { get; set; }
        public string DepartmentName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImgPath { get; set; }
        public bool IsDeleted { get; set; }
    }
}
