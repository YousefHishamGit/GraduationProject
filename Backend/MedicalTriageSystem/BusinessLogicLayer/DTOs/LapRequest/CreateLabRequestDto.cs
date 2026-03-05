using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.LapRequest
{
    public class CreateLabRequestDto
    {
        [Required] public int MedicalRecordId { get; set; }
        [Required] public string TestName { get; set; } = string.Empty;
    }
}
