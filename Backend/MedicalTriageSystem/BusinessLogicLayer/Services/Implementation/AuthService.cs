using AutoMapper;
using BusinessLogicLayer.DTOs.Auth;
using BusinessLogicLayer.Services.Interfaces;
using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Implementation
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public AuthService(
            IUnitOfWork unitOfWork,
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IMapper mapper,
            IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _signInManager = signInManager;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<AuthResponseDto> RegisterPatientAsync(RegisterPatientDto dto)
        {
          
            var person = _mapper.Map<Person>(dto);
            if (!string.IsNullOrWhiteSpace(dto.ImgPath))
                person.ImgPath = dto.ImgPath;

            var user = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                Role = UserRole.Patient,
                Person = person
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        
            var patient = new Patient
            {
                UserId = user.Id,
                PersonId = person.Id,
                BloodType = dto.BloodType,
                Allergies = dto.Allergies,
                MedicalHistory = dto.MedicalHistory,
                EmergencyContactName = dto.EmergencyContactName,
                EmergencyContactPhone = dto.EmergencyContactPhone
            };

            await _unitOfWork.Patients.AddAsync(patient);
            await _unitOfWork.SaveChangesAsync();

            return GenerateToken(user, person);
        }

        public async Task<AuthResponseDto> RegisterDoctorAsync(RegisterDoctorDto dto)
        {
            
            if (!await _unitOfWork.Doctors.IsLicenseNumberUniqueAsync(dto.LicenseNumber))
                throw new Exception("License number already exists");

         
            var person = _mapper.Map<Person>(dto);
            if (!string.IsNullOrWhiteSpace(dto.ImgPath))
                person.ImgPath = dto.ImgPath;

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

            var doctor = new Doctor
            {
                UserId = user.Id,
                PersonId = person.Id,
                LicenseNumber = dto.LicenseNumber,
                Specialization = dto.Specialization,
                DepartmentId = dto.DepartmentId,
                YearsOfExperience = dto.YearsOfExperience,
                ConsultationFee = dto.ConsultationFee,
                HireDate = dto.HireDate,
                Bio = dto.Bio,
                ImgPath = dto.ImgPath,
                Status = DoctorStatus.Pending
            };

            await _unitOfWork.Doctors.AddAsync(doctor);
            await _unitOfWork.SaveChangesAsync();

            return new AuthResponseDto
            {
                Token = string.Empty,
                UserId = user.Id,
                FullName = $"{person.FirstName} {person.LastName}",
                Email = user.Email!,
                Role = user.Role.ToString(),
                ExpiresAt = DateTime.UtcNow
            };
        }

        public async Task<AuthResponseDto> RegisterAdminAsync(RegisterAdminDto dto)
        {
            var person = _mapper.Map<Person>(dto);

            var user = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                Role = UserRole.Admin,
                Person = person
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            await _unitOfWork.SaveChangesAsync();
            return GenerateToken(user, person);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                throw new Exception("Invalid email or password");

            var result = await _signInManager.CheckPasswordSignInAsync(user, dto.Password, false);
            if (!result.Succeeded)
                throw new Exception("Invalid email or password");

            if (user.Role == UserRole.Doctor)
            {
                var doctors = await _unitOfWork.Doctors.GetAllAsync(d => d.UserId == user.Id);
                var doctor = doctors.FirstOrDefault();
                if (doctor == null || doctor.Status == DoctorStatus.Pending)
                {
                    throw new UnauthorizedAccessException("Your account is pending admin approval.");
                }
                else if (doctor.Status == DoctorStatus.Inactive)
                {
                    throw new UnauthorizedAccessException("Your account is inactive. Please contact the administrator.");
                }
            }

            user.LastLoginAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var person = await _unitOfWork.Persons.GetByIdAsync(user.PersonId);

            return GenerateToken(user, person!);
        }

        public async Task LogoutAsync(string userId)
        {
            await _signInManager.SignOutAsync();
        }

        private AuthResponseDto GenerateToken(User user, Person person)
        {
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("FullName", $"{person.FirstName} {person.LastName}")
            };

            var expiresAt = DateTime.UtcNow.AddDays(
                double.Parse(_configuration["Jwt:ExpireDays"]!));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials
            );

            return new AuthResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                UserId = user.Id,
                FullName = $"{person.FirstName} {person.LastName}",
                Email = user.Email!,
                Role = user.Role.ToString(),
                ExpiresAt = expiresAt
            };
        }
    }
}
