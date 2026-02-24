using DataAccessLayer.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Doctor
{
    public class UpdateDoctorDto
    {
        public string? Phone { get; set; }
        public string? Address { get; set; }

        public string? Specialization { get; set; }
        public int? DepartmentId { get; set; }

        [Range(0, 60)]
        public int? YearsOfExperience { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? ConsultationFee { get; set; }

        public string? Bio { get; set; }
        public string? Status { get; set; }
        public string? ImgPath { get; set; }
    }
}
