using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.DTOs.MedicalRecord
{
    public class UpdateMedicalRecordDto
    {
        public string? Diagnosis { get; set; }
        public string? Notes { get; set; }
        public string? VitalSigns { get; set; }
    }
}
