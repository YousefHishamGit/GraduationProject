using AutoMapper;
using BusinessLogicLayer.DTOs.Appointment;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AppointmentService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<AppointmentResponseDto>> GetAllAsync()
        {
            var appointments = await _unitOfWork.Appointments.GetAllWithDetailsAsync();
            return _mapper.Map<IEnumerable<AppointmentResponseDto>>(appointments);
        }

        public async Task<AppointmentResponseDto?> GetByIdAsync(int id)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdWithDetailsAsync(id);
            if (appointment == null) return null;
            return _mapper.Map<AppointmentResponseDto>(appointment);
        }

        public async Task<IEnumerable<AppointmentResponseDto>> GetByDoctorIdAsync(int doctorId)
        {
            var appointments = await _unitOfWork.Appointments.GetByDoctorIdAsync(doctorId);
            return _mapper.Map<IEnumerable<AppointmentResponseDto>>(appointments);
        }

        public async Task<IEnumerable<AppointmentResponseDto>> GetByPatientIdAsync(int patientId)
        {
            var appointments = await _unitOfWork.Appointments.GetByPatientIdAsync(patientId);
            return _mapper.Map<IEnumerable<AppointmentResponseDto>>(appointments);
        }

        public async Task<AppointmentResponseDto> CreateAsync(CreateAppointmentDto dto)
        {
            // 1. ??? ??? TimeSlot
            var slotRepo = _unitOfWork.GetRepository<TimeSlot>();

            var slot = await slotRepo.GetByIdAsync(dto.TimeSlotId);

            if (slot == null)
                throw new Exception("Time slot not found");

            if (slot.IsBooked)
                throw new Exception("This time slot is already booked");

            // 2. ???? ??? slot (??? ????)
            slot.IsBooked = true;
            slotRepo.Update(slot);

            // 3. ???? appointment
            var appointment = new Appointment
            {
                PatientId = dto.PatientId,
                DoctorId = dto.DoctorId,
                TimeSlotId = dto.TimeSlotId,
                AppointmentDate = dto.AppointmentDate,
                Type = Enum.TryParse<AppointmentType>(dto.Type, true, out var typeEnum)
                    ? typeEnum
                    : AppointmentType.InPerson,
                Status = AppointmentStatus.Confirmed, // ?????? ??? Pending
                Notes = dto.Notes,
                CreatedOn = DateTime.UtcNow,
                CreatedBy = "system"
            };

            await _unitOfWork.Appointments.AddAsync(appointment);

            // 4. ??? ??? ?? ???
            await _unitOfWork.SaveChangesAsync();

            // 5. ???? ??????
            var created = await _unitOfWork.Appointments
                .GetByIdWithDetailsAsync(appointment.Id);

            return _mapper.Map<AppointmentResponseDto>(created);
        }

        public async Task<AppointmentResponseDto?> UpdateAsync(int id, UpdateAppointmentDto dto)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdAsync(id);
            if (appointment == null) return null;

            if (dto.AppointmentDate.HasValue)
                appointment.AppointmentDate = dto.AppointmentDate.Value;

            if (!string.IsNullOrWhiteSpace(dto.Type) &&
                Enum.TryParse<AppointmentType>(dto.Type, true, out var typeEnum))
            {
                appointment.Type = typeEnum;
            }

            if (dto.Notes != null)
                appointment.Notes = dto.Notes;

            appointment.ModifiedOn = DateTime.UtcNow;
            appointment.ModifiedBy = "system";

            _unitOfWork.Appointments.Update(appointment);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _unitOfWork.Appointments.GetByIdWithDetailsAsync(id);
            return _mapper.Map<AppointmentResponseDto>(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdAsync(id);
            if (appointment == null) return false;

            _unitOfWork.Appointments.Delete(appointment);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<AppointmentResponseDto?> ConfirmAsync(int id)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdAsync(id);
            if (appointment == null) return null;

            appointment.Status = AppointmentStatus.Confirmed;
            appointment.ModifiedOn = DateTime.UtcNow;
            appointment.ModifiedBy = "system";

            _unitOfWork.Appointments.Update(appointment);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _unitOfWork.Appointments.GetByIdWithDetailsAsync(id);
            return _mapper.Map<AppointmentResponseDto>(updated);
        }

        public async Task<AppointmentResponseDto?> CancelAsync(int id, string? reason)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdAsync(id);
            if (appointment == null) return null;

            appointment.Status = AppointmentStatus.Cancelled;
            appointment.CancellationReason = reason;
            appointment.ModifiedOn = DateTime.UtcNow;
            appointment.ModifiedBy = "system";

            _unitOfWork.Appointments.Update(appointment);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _unitOfWork.Appointments.GetByIdWithDetailsAsync(id);
            return _mapper.Map<AppointmentResponseDto>(updated);
        }

        public async Task<AppointmentResponseDto?> CompleteAsync(int id)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdAsync(id);
            if (appointment == null) return null;

            appointment.Status = AppointmentStatus.Completed;
            appointment.ModifiedOn = DateTime.UtcNow;
            appointment.ModifiedBy = "system";

            _unitOfWork.Appointments.Update(appointment);
            await _unitOfWork.SaveChangesAsync();

            var updated = await _unitOfWork.Appointments.GetByIdWithDetailsAsync(id);
            return _mapper.Map<AppointmentResponseDto>(updated);
        }
    }
}

