using Microsoft.AspNetCore.Identity;
using DataAccessLayer.Enums;

namespace DataAccessLayer.Entities
{
    public class User : IdentityUser
    {
        public int PersonId { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime? LastLoginAt { get; set; }
        public UserRole Role { get; set; }

        // Navigation Properties
        public virtual Person Person { get; set; } = null!;
        public virtual Doctor? Doctor { get; set; }
        public virtual Patient? Patient { get; set; }
        public virtual Receptionist? Receptionist { get; set; }
    }
}