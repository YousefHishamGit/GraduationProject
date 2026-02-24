using DataAccessLayer.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Doctor
{
    public class CreateDoctorDto
    {
        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        [Required]
        public string NationalId { get; set; } = string.Empty;

        [Required]
        public DateTime BirthDate { get; set; }

        [Required]
        public Gender Gender { get; set; } 

        public string? Address { get; set; }

        [Phone]
        public string? Phone { get; set; }
        //============
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required]
        public string Specialization { get; set; } = string.Empty;

        [Required]
        public int DepartmentId { get; set; }

        [Range(0, 60)]
        public int YearsOfExperience { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ConsultationFee { get; set; }

        public DateTime HireDate { get; set; }

        public string? Bio { get; set; }

        public string? ImgPath { get; set; }

    }
}
