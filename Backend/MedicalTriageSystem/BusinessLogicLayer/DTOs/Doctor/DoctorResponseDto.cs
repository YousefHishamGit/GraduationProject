using DataAccessLayer.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Doctor
{
    public class DoctorResponseDto
    {
        public int Id { get; set; }

        
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string Gender { get; set; } = string.Empty;

    
        public string DepartmentName { get; set; } = string.Empty;

        public string LicenseNumber { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public int YearsOfExperience { get; set; }
        public decimal ConsultationFee { get; set; }
        public string Status { get; set; }
        public string? Bio { get; set; }
        public string? ImgPath { get; set; }
        public DateTime HireDate { get; set; }
    }
}
