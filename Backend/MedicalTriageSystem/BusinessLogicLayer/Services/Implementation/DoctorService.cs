using AutoMapper;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.DTOs.Patient;
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

        public DoctorService(
            IUnitOfWork unitOfWork,
            UserManager<User> userManager,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _mapper = mapper;
        }

        // ?????????????????????????????????????????????
        // Doctors
        // ?????????????????????????????????????????????

        public async Task<IEnumerable<DoctorResponseDto>> GetAllDoctorsAsync()
        {
            var doctors = await _unitOfWork.Doctors.GetAllWithDetailsAsync();

            return _mapper.Map<IEnumerable<DoctorResponseDto>>(doctors);
        }

        public async Task<DoctorResponseDto?> GetDoctorByIdAsync(int id)
        {
            var doctor = await _unitOfWork.Doctors.GetDoctorWithDetailsAsync(id);

            if (doctor == null)
                return null;

            return _mapper.Map<DoctorResponseDto>(doctor);
        }

        public async Task<DoctorResponseDto?> GetDoctorByUserIdAsync(string userId)
        {
            var doctors = await _unitOfWork.Doctors
                .GetAllAsync(d => d.UserId == userId);

            var doctor = doctors.FirstOrDefault();

            if (doctor == null)
                return null;

            var doctorWithDetails =
                await _unitOfWork.Doctors.GetDoctorWithDetailsAsync(doctor.Id);

            return _mapper.Map<DoctorResponseDto>(doctorWithDetails);
        }

        public async Task<IEnumerable<DoctorResponseDto>> GetDoctorsByDepartmentAsync(int departmentId)
        {
            var doctors = await _unitOfWork.Doctors
                .GetByDepartmentAsync(departmentId);

            return _mapper.Map<IEnumerable<DoctorResponseDto>>(doctors);
        }

        public async Task<IEnumerable<DoctorResponseDto>> SearchAsync(
            string? name,
            int? departmentId,
            string? specialization)
        {
            var doctors = await _unitOfWork.Doctors
                .SearchAsync(name, departmentId, specialization);

            return _mapper.Map<IEnumerable<DoctorResponseDto>>(doctors);
        }

        public async Task<DoctorResponseDto> CreateDoctorAsync(CreateDoctorDto dto)
        {
            if (!await _unitOfWork.Doctors
                .IsLicenseNumberUniqueAsync(dto.LicenseNumber))
            {
                throw new Exception("License number already exists");
            }

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
            {
                throw new Exception(
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            var doctor = _mapper.Map<Doctor>(dto);

            doctor.UserId = user.Id;
            doctor.Person = person;
            doctor.Status = DoctorStatus.Active;

            await _unitOfWork.Doctors.AddAsync(doctor);

            await _unitOfWork.SaveChangesAsync();

            var createdDoctor =
                await _unitOfWork.Doctors.GetDoctorWithDetailsAsync(doctor.Id);

            return _mapper.Map<DoctorResponseDto>(createdDoctor);
        }

        public async Task<DoctorResponseDto?> UpdateDoctorAsync(
            int id,
            UpdateDoctorDto dto)
        {
            var doctor = await _unitOfWork.Doctors
                .GetDoctorWithDetailsAsync(id);

            if (doctor == null)
                return null;

            if (dto.Phone != null)
                doctor.Person.Phone = dto.Phone;

            if (dto.Address != null)
                doctor.Person.Address = dto.Address;

            _mapper.Map(dto, doctor);

            _unitOfWork.Doctors.Update(doctor);

            await _unitOfWork.SaveChangesAsync();

            var updatedDoctor =
                await _unitOfWork.Doctors.GetDoctorWithDetailsAsync(id);

            return _mapper.Map<DoctorResponseDto>(updatedDoctor);
        }

        public async Task<bool> DeleteDoctorAsync(int id)
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(id);

            if (doctor == null)
                return false;

            _unitOfWork.Doctors.Delete(doctor);

            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        // ?????????????????????????????????????????????
        // Patients
        // ?????????????????????????????????????????????

        public async Task<IEnumerable<PatientResponseDto>> GetPatientsByDoctorAsync(int doctorId)
        {
            var appointments = await _unitOfWork
                .GetRepository<Appointment>()
                .GetAllAsync(a => a.DoctorId == doctorId);

            var patientIds = appointments
                .Select(a => a.PatientId)
                .Distinct()
                .ToList();

            var patients = await _unitOfWork.Patients
                .GetAllWithPersonAsync();

            var doctorPatients = patients
                .Where(p => patientIds.Contains(p.Id))
                .ToList();

            return _mapper.Map<IEnumerable<PatientResponseDto>>(doctorPatients);
        }

        // ?????????????????????????????????????????????
        // Reviews
        // ?????????????????????????????????????????????

        public async Task<IEnumerable<DTOs.Review.ReviewResponseDto>>
            GetDoctorReviewsAsync(int doctorId)
        {
            var reviews = await _unitOfWork.Doctors
                .GetDoctorReviewsAsync(doctorId);

            return _mapper.Map<IEnumerable<DTOs.Review.ReviewResponseDto>>(reviews);
        }

        // ?????????????????????????????????????????????
        // Leaves
        // ?????????????????????????????????????????????

        public async Task<IEnumerable<DoctorLeaveResponseDto>>
            GetDoctorLeavesAsync(int doctorId)
        {
            var leaves = await _unitOfWork.Doctors
                .GetDoctorLeavesAsync(doctorId);

            return _mapper.Map<IEnumerable<DoctorLeaveResponseDto>>(leaves);
        }

        public async Task<DoctorLeaveResponseDto> CreateLeaveAsync(
            int doctorId,
            CreateDoctorLeaveDto dto)
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(doctorId);

            if (doctor == null)
                throw new Exception("Doctor not found");

            var leave = _mapper.Map<DoctorLeave>(dto);

            leave.DoctorId = doctorId;

            await _unitOfWork
                .GetRepository<DoctorLeave>()
                .AddAsync(leave);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<DoctorLeaveResponseDto>(leave);
        }

        public async Task<DoctorLeaveResponseDto?> UpdateLeaveAsync(
            int leaveId,
            UpdateDoctorLeaveDto dto)
        {
            var leave = await _unitOfWork
                .GetRepository<DoctorLeave>()
                .GetByIdAsync(leaveId);

            if (leave == null)
                return null;

            _mapper.Map(dto, leave);

            _unitOfWork.GetRepository<DoctorLeave>().Update(leave);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<DoctorLeaveResponseDto>(leave);
        }

        public async Task<bool> DeleteLeaveAsync(int leaveId)
        {
            var leave = await _unitOfWork
                .GetRepository<DoctorLeave>()
                .GetByIdAsync(leaveId);

            if (leave == null)
                return false;

            _unitOfWork.GetRepository<DoctorLeave>().Delete(leave);

            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<DoctorLeaveResponseDto?> GetLeaveByIdAsync(int leaveId)
        {
            var leave = await _unitOfWork
                .GetRepository<DoctorLeave>()
                .GetByIdAsync(leaveId);

            return _mapper.Map<DoctorLeaveResponseDto?>(leave);
        }

        // ?????????????????????????????????????????????
        // Schedule
        // ?????????????????????????????????????????????

        public async Task<IEnumerable<DoctorScheduleResponseDto>>
            GetDoctorScheduleAsync(int doctorId)
        {
            var schedules = await _unitOfWork
                .GetRepository<DoctorSchedule>()
                .GetAllAsync(s => s.DoctorId == doctorId);

            return _mapper.Map<IEnumerable<DoctorScheduleResponseDto>>(schedules);
        }

        public async Task<DoctorScheduleResponseDto?>
            GetScheduleByIdAsync(int id)
        {
            var schedule = await _unitOfWork
                .GetRepository<DoctorSchedule>()
                .GetByIdAsync(id);

            return _mapper.Map<DoctorScheduleResponseDto?>(schedule);
        }

        public async Task<DoctorScheduleResponseDto> CreateScheduleAsync(
            int doctorId,
            CreateDoctorScheduleDto dto)
        {
            var doctor = await _unitOfWork.Doctors.GetByIdAsync(doctorId);

            if (doctor == null)
                throw new Exception("Doctor not found");

            var schedule = new DoctorSchedule
            {
                DoctorId = doctorId,
                DayOfWeek = dto.DayOfWeek,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                SlotDurationMinutes = dto.SlotDurationMinutes,
                IsAvailable = true
            };

            await _unitOfWork
                .GetRepository<DoctorSchedule>()
                .AddAsync(schedule);

            await _unitOfWork.SaveChangesAsync();

            await GenerateSlotsForScheduleAsync(schedule);

            return _mapper.Map<DoctorScheduleResponseDto>(schedule);
        }

        public async Task<DoctorScheduleResponseDto?> UpdateScheduleAsync(
            int id,
            UpdateDoctorScheduleDto dto)
        {
            var schedule = await _unitOfWork
                .GetRepository<DoctorSchedule>()
                .GetByIdAsync(id);

            if (schedule == null)
                return null;

            if (dto.StartTime.HasValue)
                schedule.StartTime = dto.StartTime.Value;

            if (dto.EndTime.HasValue)
                schedule.EndTime = dto.EndTime.Value;

            if (dto.SlotDurationMinutes.HasValue)
                schedule.SlotDurationMinutes = dto.SlotDurationMinutes.Value;

            if (dto.IsAvailable.HasValue)
                schedule.IsAvailable = dto.IsAvailable.Value;

            _unitOfWork
                .GetRepository<DoctorSchedule>()
                .Update(schedule);

            await DeleteFutureUnbookedSlotsAsync(
                schedule.DoctorId,
                schedule.DayOfWeek);

            await GenerateSlotsForScheduleAsync(schedule);

            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<DoctorScheduleResponseDto>(schedule);
        }

        public async Task<bool> DeleteScheduleAsync(int id)
        {
            var schedule = await _unitOfWork
                .GetRepository<DoctorSchedule>()
                .GetByIdAsync(id);

            if (schedule == null)
                return false;

            await DeleteFutureUnbookedSlotsAsync(
                schedule.DoctorId,
                schedule.DayOfWeek);

            _unitOfWork
                .GetRepository<DoctorSchedule>()
                .Delete(schedule);

            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        // ?????????????????????????????????????????????
        // Time Slots
        // ?????????????????????????????????????????????

        public async Task<IEnumerable<TimeSlotResponseDto>>
     GetDoctorTimeSlotsAsync(int doctorId)
        {
            var slots = await _unitOfWork
                .GetRepository<TimeSlot>()
                .GetAllAsync(t =>
                    t.DoctorId == doctorId &&
                    !t.IsBooked &&
                    t.SlotStart > DateTime.Now);

            return _mapper.Map<IEnumerable<TimeSlotResponseDto>>(
                slots.OrderBy(s => s.SlotStart));
        }

        public async Task<IEnumerable<TimeSlotResponseDto>>
    GetAvailableTimeSlotsAsync(int doctorId)
        {
            var slots = await _unitOfWork
                .GetRepository<TimeSlot>()
                .GetAllAsync(t =>
                    t.DoctorId == doctorId &&
                    !t.IsBooked &&
                    t.SlotStart > DateTime.Now);

            return _mapper.Map<IEnumerable<TimeSlotResponseDto>>(
                slots.OrderBy(s => s.SlotStart));
        }

        public async Task<IEnumerable<TimeSlotResponseDto>>
            GetAvailableTimeSlotsByDateAsync(
                int doctorId,
                DateTime date)
        {
            var slots = await _unitOfWork
                .GetRepository<TimeSlot>()
                .GetAllAsync(t =>
                    t.DoctorId == doctorId &&
                    t.SlotStart.Date == date.Date &&
                    !t.IsBooked);

            return _mapper.Map<IEnumerable<TimeSlotResponseDto>>(slots);
        }

        public async Task<IEnumerable<TimeSlotResponseDto>>
            GetAllTimeSlotsAsync(int doctorId)
        {
            var slots = await _unitOfWork
                .GetRepository<TimeSlot>()
                .GetAllAsync(t => t.DoctorId == doctorId);

            return _mapper.Map<IEnumerable<TimeSlotResponseDto>>(
                slots.OrderBy(s => s.SlotStart));
        }

        public async Task<TimeSlotResponseDto?> GetTimeSlotByIdAsync(int id)
        {
            var slot = await _unitOfWork
                .GetRepository<TimeSlot>()
                .GetByIdAsync(id);

            if (slot == null)
                return null;

            return _mapper.Map<TimeSlotResponseDto>(slot);
        }

        // ?????????????????????????????????????????????
        // Helpers
        // ?????????????????????????????????????????????

        private async Task GenerateSlotsForScheduleAsync(
            DoctorSchedule schedule)
        {
            var newSlots = new List<TimeSlot>();

            var existingSlots = await _unitOfWork
                .GetRepository<TimeSlot>()
                .GetAllAsync(s => s.DoctorId == schedule.DoctorId);

            for (int i = 0; i <= 14; i++)
            {
                var date = DateTime.Today.AddDays(i);

                if ((int)date.DayOfWeek != schedule.DayOfWeek)
                    continue;

                var currentStart = date.Date + schedule.StartTime;

                var endTime = date.Date + schedule.EndTime;

                while (
                    currentStart.AddMinutes(schedule.SlotDurationMinutes)
                    <= endTime)
                {
                    bool exists = existingSlots.Any(s =>
                        s.DoctorId == schedule.DoctorId &&
                        s.SlotStart == currentStart);

                    if (!exists)
                    {
                        newSlots.Add(new TimeSlot
                        {
                            DoctorId = schedule.DoctorId,
                            SlotStart = currentStart,
                            SlotEnd = currentStart.AddMinutes(
                                schedule.SlotDurationMinutes),
                            IsBooked = false
                        });
                    }

                    currentStart = currentStart.AddMinutes(
                        schedule.SlotDurationMinutes);
                }
            }

            if (newSlots.Any())
            {
                var repo = _unitOfWork.GetRepository<TimeSlot>();

                foreach (var slot in newSlots)
                {
                    await repo.AddAsync(slot);
                }

                await _unitOfWork.SaveChangesAsync();
            }
        }

        private async Task DeleteFutureUnbookedSlotsAsync(
            int doctorId,
            int dayOfWeek)
        {
            var allSlots = await _unitOfWork
                .GetRepository<TimeSlot>()
                .GetAllAsync(s => s.DoctorId == doctorId);

            var toDelete = allSlots
                .Where(s =>
                    (int)s.SlotStart.DayOfWeek == dayOfWeek &&
                    s.SlotStart > DateTime.Now &&
                    !s.IsBooked)
                .ToList();

            foreach (var slot in toDelete)
            {
                _unitOfWork
                    .GetRepository<TimeSlot>()
                    .Delete(slot);
            }
        }
    }
}