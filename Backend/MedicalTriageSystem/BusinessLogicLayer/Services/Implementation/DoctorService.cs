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

        public async Task<IEnumerable<ReviewResponseDto>> GetDoctorReviewsAsync(int doctorId)
        {
            var reviews = await _unitOfWork.Doctors.GetDoctorReviewsAsync(doctorId);
            return _mapper.Map<IEnumerable<ReviewResponseDto>>(reviews);
        }
    }
}