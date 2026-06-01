using System;

namespace BusinessLogicLayer.DTOs.Notification
{
    public class NotificationResponseDto
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public string Message { get; set; } = null!;
        public bool IsRead { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
