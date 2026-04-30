using DataAccessLayer.Enums;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Auth
{
    public class RegisterAdminDto
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
    }
}
