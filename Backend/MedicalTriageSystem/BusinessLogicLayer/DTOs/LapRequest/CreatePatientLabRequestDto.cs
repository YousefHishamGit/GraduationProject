using System.ComponentModel.DataAnnotations;

namespace BusinessLogicLayer.DTOs.LapRequest
{
    public class CreatePatientLabRequestDto
    {
        [Required] public int PatientId { get; set; }
        [Required] public string TestName { get; set; } = string.Empty;
    }
}
