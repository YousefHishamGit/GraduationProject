using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.LapRequest
{
    public class LabRequestResponseDto
    {
        public int Id { get; set; }
        public int MedicalRecordId { get; set; }
        public string TestName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ResultFilePath { get; set; }
        public DateTime RequestedOn { get; set; }
        public DateTime? ResultOn { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
