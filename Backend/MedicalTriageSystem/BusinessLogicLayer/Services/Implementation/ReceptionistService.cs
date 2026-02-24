using AutoMapper;
using BusinessLogicLayer.DTOs.Receptionist;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class ReceptionistService : IReceptionistService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly IMapper _mapper;

        public ReceptionistService(IUnitOfWork unitOfWork, UserManager<User> userManager, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ReceptionistResponseDto>> GetAllAsync()
        {
            var receptionists = await _unitOfWork.Receptionists.GetAllWithDetailsAsync();
            return _mapper.Map<IEnumerable<ReceptionistResponseDto>>(receptionists);
        }

        public async Task<ReceptionistResponseDto?> GetByIdAsync(int id)
        {
            var receptionist = await _unitOfWork.Receptionists.GetReceptionistWithDetailsAsync(id);
            if (receptionist == null) return null;
            return _mapper.Map<ReceptionistResponseDto>(receptionist);
        }

        public async Task<ReceptionistResponseDto> CreateAsync(CreateReceptionistDto dto)
        {
            
            var person = _mapper.Map<Person>(dto);

            
            var user = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                Role = UserRole.Receptionist,
                Person = person
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            var receptionist = _mapper.Map<Receptionist>(dto);
            receptionist.UserId = user.Id;
            receptionist.PersonId = person.Id;

            await _unitOfWork.Receptionists.AddAsync(receptionist);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ReceptionistResponseDto>(
                await _unitOfWork.Receptionists.GetReceptionistWithDetailsAsync(receptionist.Id));
        }

        public async Task<ReceptionistResponseDto?> UpdateAsync(int id, UpdateReceptionistDto dto)
        {
            var receptionist = await _unitOfWork.Receptionists.GetReceptionistWithDetailsAsync(id);
            if (receptionist == null) return null;

            if (dto.Phone != null) receptionist.Person.Phone = dto.Phone;
            if (dto.Address != null) receptionist.Person.Address = dto.Address;

            _mapper.Map(dto, receptionist);

            _unitOfWork.Receptionists.Update(receptionist);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ReceptionistResponseDto>(
                await _unitOfWork.Receptionists.GetReceptionistWithDetailsAsync(id));
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var receptionist = await _unitOfWork.Receptionists.GetByIdAsync(id);
            if (receptionist == null) return false;

            _unitOfWork.Receptionists.Delete(receptionist);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
