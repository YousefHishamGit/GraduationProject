using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.LapRequest
{
    public class UploadLabResultDto
    {
        [Required] public string ResultFilePath { get; set; } = string.Empty;
    }
}
