using AutoMapper;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace BusinessLogicLayer.Services.Implementation
{
    public class DoctorService : IDoctorService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;

        public DoctorService(IUnitOfWork unitOfWork, UserManager<User> userManager, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<IEnumerable<DoctorResponseDto>> GetAllDoctorsAsync()
        {
            var doctors = await _unitOfWork.Doctors.GetAllWithDetailsAsync();
            return _mapper.Map<IEnumerable<DoctorResponseDto>>(doctors);
        }

        public async Task<DoctorResponseDto?> GetDoctorByIdAsync(int id)
        {
            var doctor = await _unitOfWork.Doctors.GetDoctorWithDetailsAsync(id);
            if (doctor == null) return null;
            return _mapper.Map<DoctorResponseDto>(doctor);
        }

        public async Task<IEnumerable<DoctorResponseDto>> GetDoctorsByDepartmentAsync(int departmentId)
        {
            var doctors = await _unitOfWork.Doctors.GetByDepartmentAsync(departmentId);
            return _mapper.Map<IEnumerable<DoctorResponseDto>>(doctors);
        }

        public async Task<IEnumerable<DoctorResponseDto>> SearchAsync(string? name, int? departmentId, string? specialization)
        {
            var doctors = await _unitOfWork.Doctors.SearchAsync(name, departmentId, specialization);
            return _mapper.Map<IEnumerable<DoctorResponseDto>>(doctors);
        }

        public async Task<DoctorResponseDto> CreateDoctorAsync(CreateDoctorDto dto)
        {
            
            if (!await _unitOfWork.Doctors.IsLicenseNumberUniqueAsync(dto.LicenseNumber))
                throw new Exception("License number already exists");

            var person = _mapper.Map<Person>(dto);

           
            var user = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                Role = UserRole.Doctor,
                Person = person
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

           
            var doctor = _mapper.Map<Doctor>(dto);
            doctor.UserId = user.Id;
            doctor.PersonId = person.Id;
            doctor.Status = DoctorStatus.Active;

            await _unitOfWork.Doctors.AddAsync(doctor);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<DoctorResponseDto>(
                await _unitOfWork.Doctors.GetDoctorWithDetailsAsync(doctor.Id));
        }

        public async Task<DoctorResponseDto?> UpdateDoctorAsync(int id, UpdateDoctorDto dto)
        {
            var doctor = await _unitOfWork.Doctors.GetDoctorWithDetailsAsync(id);
            if (doctor == null) return null;

            if (dto.Phone != null) doctor.Person.Phone = dto.Phone;
            if (dto.Address != null) doctor.Person.Address = dto.Address;

           
            _mapper.Map(dto, doctor);

            _unitOfWork.Doctors.Update(doctor);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<DoctorResponseDto>(
                await _unitOfWork.Doctors.GetDoctorWithDetailsAsync(id));
        }

        public async Task<bool> DeleteDoctorAsync(int id)
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(id);
            if (doctor == null) return false;

            _unitOfWork.Doctors.Delete(doctor);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<DoctorScheduleResponseDto>> GetDoctorScheduleAsync(int doctorId)
        {
            var schedules = await _unitOfWork.Doctors.GetDoctorScheduleAsync(doctorId);
            return _mapper.Map<IEnumerable<DoctorScheduleResponseDto>>(schedules);
        }

        public async Task<IEnumerable<DoctorLeaveResponseDto>> GetDoctorLeavesAsync(int doctorId)
        {
            var leaves = await _unitOfWork.Doctors.GetDoctorLeavesAsync(doctorId);
            return _mapper.Map<IEnumerable<DoctorLeaveResponseDto>>(leaves);
        }

        public async Task<IEnumerable<TimeSlotResponseDto>> GetDoctorTimeSlotsAsync(int doctorId)
        {
            var slots = await _unitOfWork.Doctors.GetDoctorTimeSlotsAsync(doctorId);
            return _mapper.Map<IEnumerable<TimeSlotResponseDto>>(slots);
        }

        public async Task<IEnumerable<DTOs.Review.ReviewResponseDto>> GetDoctorReviewsAsync(int doctorId)
        {
            var reviews = await _unitOfWork.Doctors.GetDoctorReviewsAsync(doctorId);
            return _mapper.Map<IEnumerable<DTOs.Review.ReviewResponseDto>>(reviews);
        }

        public async Task<DoctorScheduleResponseDto> CreateScheduleAsync(int doctorId, CreateDoctorScheduleDto dto)
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(doctorId);
            if (doctor == null)
                throw new Exception("Doctor not found");

            var schedule = _mapper.Map<DoctorSchedule>(dto);
            schedule.DoctorId = doctorId;

            await _unitOfWork.GetRepository<DoctorSchedule>().AddAsync(schedule);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<DoctorScheduleResponseDto>(schedule);
        }

        public async Task<DoctorScheduleResponseDto?> UpdateScheduleAsync(int scheduleId, UpdateDoctorScheduleDto dto)
        {
            var schedule = await _unitOfWork.GetRepository<DoctorSchedule>().GetByIdAsync(scheduleId);
            if (schedule == null) return null;

            _mapper.Map(dto, schedule);
            _unitOfWork.GetRepository<DoctorSchedule>().Update(schedule);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<DoctorScheduleResponseDto>(schedule);
        }

        public async Task<bool> DeleteScheduleAsync(int scheduleId)
        {
            var schedule = await _unitOfWork.GetRepository<DoctorSchedule>().GetByIdAsync(scheduleId);
            if (schedule == null) return false;

            _unitOfWork.GetRepository<DoctorSchedule>().Delete(schedule);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<DoctorScheduleResponseDto?> GetScheduleByIdAsync(int scheduleId)
        {
            var schedule = await _unitOfWork.GetRepository<DoctorSchedule>().GetByIdAsync(scheduleId);
            return _mapper.Map<DoctorScheduleResponseDto?>(schedule);
        }

        public async Task<DoctorLeaveResponseDto> CreateLeaveAsync(int doctorId, CreateDoctorLeaveDto dto)
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(doctorId);
            if (doctor == null)
                throw new Exception("Doctor not found");

            var leave = _mapper.Map<DoctorLeave>(dto);
            leave.DoctorId = doctorId;

            await _unitOfWork.GetRepository<DoctorLeave>().AddAsync(leave);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<DoctorLeaveResponseDto>(leave);
        }

        public async Task<DoctorLeaveResponseDto?> UpdateLeaveAsync(int leaveId, UpdateDoctorLeaveDto dto)
        {
            var leave = await _unitOfWork.GetRepository<DoctorLeave>().GetByIdAsync(leaveId);
            if (leave == null) return null;

            _mapper.Map(dto, leave);
            _unitOfWork.GetRepository<DoctorLeave>().Update(leave);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<DoctorLeaveResponseDto>(leave);
        }

        public async Task<bool> DeleteLeaveAsync(int leaveId)
        {
            var leave = await _unitOfWork.GetRepository<DoctorLeave>().GetByIdAsync(leaveId);
            if (leave == null) return false;

            _unitOfWork.GetRepository<DoctorLeave>().Delete(leave);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<DoctorLeaveResponseDto?> GetLeaveByIdAsync(int leaveId)
        {
            var leave = await _unitOfWork.GetRepository<DoctorLeave>().GetByIdAsync(leaveId);
            return _mapper.Map<DoctorLeaveResponseDto?>(leave);
        }

        public async Task<IEnumerable<TimeSlotResponseDto>> GenerateTimeSlotsAsync(int doctorId, GenerateTimeSlotsDto dto)
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(doctorId);
            if (doctor == null)
                throw new Exception("Doctor not found");

            int dayOfWeek = (int)dto.Date.DayOfWeek; 
            var schedules = await _unitOfWork.GetRepository<DoctorSchedule>()
                .GetAllAsync(s => s.DoctorId == doctorId && s.DayOfWeek == dayOfWeek && s.IsAvailable);

            if (!schedules.Any())
                throw new Exception("No available schedule for this day");

            var generatedSlots = new List<TimeSlot>();

            foreach (var schedule in schedules)
            {
                var current = dto.Date.Date + schedule.StartTime;
                var end = dto.Date.Date + schedule.EndTime;

                while (current < end)
                {
                    var slotEnd = current.AddMinutes(schedule.SlotDurationMinutes);
                    if (slotEnd > end) slotEnd = end;

                    var existing = await _unitOfWork.GetRepository<TimeSlot>()
                        .GetAllAsync(t => t.DoctorId == doctorId && t.SlotStart == current);
                    if (!existing.Any())
                    {
                        var slot = new TimeSlot
                        {
                            DoctorId = doctorId,
                            SlotStart = current,
                            SlotEnd = slotEnd,
                            IsBooked = false
                        };
                        await _unitOfWork.GetRepository<TimeSlot>().AddAsync(slot);
                        generatedSlots.Add(slot);
                    }

                    current = slotEnd;
                }
            }

            await _unitOfWork.SaveChangesAsync();
            return _mapper.Map<IEnumerable<TimeSlotResponseDto>>(generatedSlots);
        }

        public async Task<bool> DeleteTimeSlotAsync(int timeSlotId)
        {
            var slot = await _unitOfWork.GetRepository<TimeSlot>().GetByIdAsync(timeSlotId);
            if (slot == null) return false;

            if (slot.IsBooked)
                throw new Exception("Cannot delete a booked time slot");

            _unitOfWork.GetRepository<TimeSlot>().Delete(slot);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        
        public async Task<IEnumerable<TimeSlotResponseDto>> GetAvailableTimeSlotsByDateAsync(int doctorId, DateTime date)
        {
            var slots = await _unitOfWork.GetRepository<TimeSlot>()
                .GetAllAsync(t => t.DoctorId == doctorId && t.SlotStart.Date == date.Date && !t.IsBooked);
            return _mapper.Map<IEnumerable<TimeSlotResponseDto>>(slots);
        }
    }
}