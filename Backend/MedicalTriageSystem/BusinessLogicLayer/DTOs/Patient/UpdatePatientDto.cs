using DataAccessLayer.Enums;

namespace BusinessLogicLayer.DTOs.Patient
{
	public class UpdatePatientDto
	{
		public string? Allergies { get; set; }
		public string? MedicalHistory { get; set; }
		public string? EmergencyContactName { get; set; }
		public string? EmergencyContactPhone { get; set; }
		public string? ImgPath { get; set; }
		public BloodType? BloodType { get; set; }
	}
}