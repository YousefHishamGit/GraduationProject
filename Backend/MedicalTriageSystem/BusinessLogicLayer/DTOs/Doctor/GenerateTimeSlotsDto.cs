using System;
using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.Doctor
{
    public class GenerateTimeSlotsDto
    {
        [Required]
        public DateTime Date { get; set; }
    }
}
