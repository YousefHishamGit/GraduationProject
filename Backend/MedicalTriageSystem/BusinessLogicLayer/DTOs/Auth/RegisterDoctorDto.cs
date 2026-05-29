using DataAccessLayer.Enums;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Auth
{
    public class RegisterDoctorDto
    {
       
        [Required] public string FirstName { get; set; } = string.Empty;
        [Required] public string LastName { get; set; } = string.Empty;
        [Required] public string NationalID { get; set; } = string.Empty;
        [Required] public DateTime BirthDate { get; set; }
        [Required] public Gender Gender { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }

     
        [Required][EmailAddress] public string Email { get; set; } = string.Empty;
        [Required][MinLength(8)] public string Password { get; set; } = string.Empty;
        public string? ImgPath { get; set; }
        public IFormFile? Image { get; set; }

       
        [Required] public string LicenseNumber { get; set; } = string.Empty;
        [Required] public string Specialization { get; set; } = string.Empty;
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Please select a department.")]
        public int DepartmentId { get; set; }
        [Range(0, 60)] public int YearsOfExperience { get; set; }
        [Range(0, double.MaxValue)] public decimal ConsultationFee { get; set; }
        public DateTime HireDate { get; set; }
        public string? Bio { get; set; }
    }
}
