using System;

namespace BusinessLogicLayer.DTOs.Doctor
{
	public class UpdateDoctorScheduleDto
	{
		public int? DayOfWeek { get; set; }
		public TimeSpan? StartTime { get; set; }
		public TimeSpan? EndTime { get; set; }
		public int? SlotDurationMinutes { get; set; }
		public bool? IsAvailable { get; set; }
	}
}