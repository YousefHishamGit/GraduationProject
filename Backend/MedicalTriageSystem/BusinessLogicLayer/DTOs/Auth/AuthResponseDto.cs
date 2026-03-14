using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
    }
}
