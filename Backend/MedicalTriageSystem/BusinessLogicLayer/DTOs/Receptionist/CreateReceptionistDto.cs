using DataAccessLayer.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Receptionist
{
    public class CreateReceptionistDto
    {
        [Required] 
        public string FirstName { get; set; } = string.Empty;
        [Required] 
        public string LastName { get; set; } = string.Empty;
        [Required] 
        public string NationalID { get; set; } = string.Empty;
        [Required] 
        public DateTime BirthDate { get; set; }
        [Required] 
        public Gender Gender { get; set; }
        public string? Address { get; set; }
        [Phone] 
        public string? Phone { get; set; }
        [Required][EmailAddress] 
        public string Email { get; set; } = string.Empty;
        [Required][MinLength(8)]
        public string Password { get; set; } = string.Empty;
        [Required] 
        public DateTime HireDate { get; set; }
        public string? Image { get; set; }
    }
}
