using AutoMapper;
using BusinessLogicLayer.DTOs.Person;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class PersonService : IPersonService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PersonService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<PersonResponseDto?> GetByIdAsync(int id)
        {
            var person = await _unitOfWork.Persons.GetPersonWithDetailsAsync(id);
            if (person == null) return null;
            return _mapper.Map<PersonResponseDto>(person);
        }
        public async Task<PersonResponseDto?> UpdateAsync(int id, UpdatePersonDto dto)
        {
            var person = await _unitOfWork.Persons.GetByIdAsync(id);
            if (person == null) return null;

            if (dto.Phone != null) person.Phone = dto.Phone;
            if (dto.Address != null) person.Address = dto.Address;

            _unitOfWork.Persons.Update(person);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<PersonResponseDto>(person);
        }


        public async Task<bool> DeleteAsync(int id)
        {
            var person = await _unitOfWork.Persons.GetByIdAsync(id);
            if (person == null) return false;

            _unitOfWork.Persons.Delete(person);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
    }
}
