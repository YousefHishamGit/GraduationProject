using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Auth
{
    public class VerifyOtpDto
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }
}
