using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Doctor
{
    public class CreateDoctorScheduleDto
    {
        [Required, Range(0, 6)]
        public int DayOfWeek { get; set; } 

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required, Range(5, 120)]
        public int SlotDurationMinutes { get; set; }

        public bool IsAvailable { get; set; } = true;
    }
}