using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.AI
{
    public class DiagnosisRequestDto
    {
        [Required] public string Symptoms { get; set; } = string.Empty;
    }
}
