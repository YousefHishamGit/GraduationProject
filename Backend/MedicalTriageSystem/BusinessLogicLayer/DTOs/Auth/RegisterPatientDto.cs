using DataAccessLayer.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Auth
{
    public class RegisterPatientDto
    {
        
        [Required] public string FirstName { get; set; } = string.Empty;
        [Required] public string LastName { get; set; } = string.Empty;
        [Required] public string NationalID { get; set; } = string.Empty;
        [Required] public DateTime BirthDate { get; set; }
        [Required] public Gender Gender { get; set; }
        public string? Address { get; set; }
        [Phone] public string? Phone { get; set; }

        
        [Required][EmailAddress] public string Email { get; set; } = string.Empty;
        [Required][MinLength(8)] public string Password { get; set; } = string.Empty;

        
        public BloodType? BloodType { get; set; }
        public string? Allergies { get; set; }
        public string? MedicalHistory { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
    }

}
