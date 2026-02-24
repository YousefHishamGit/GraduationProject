using AutoMapper;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.DTOs.Receptionist;
using DataAccessLayer.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer
{
    public class MappingProfile:Profile
    {
        public MappingProfile()
        {
            DoctorMap();
        }

        private void DoctorMap()
        {
           
            CreateMap<CreateDoctorDto, Person>();
                

            CreateMap<CreateDoctorDto, Doctor>()
                .ForMember(dest => dest.ImgPath, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.PersonId, opt => opt.Ignore());

            
            CreateMap<UpdateDoctorDto, Doctor>()
                .ForMember(dest => dest.ImgPath, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition(
                    (src, dest, srcMember) => srcMember != null)); // not allow null values to overwrite existing data (Put old values)

            
            CreateMap<Doctor, DoctorResponseDto>()
                .ForMember(dest => dest.FullName,
                    opt => opt.MapFrom(src => $"{src.Person.FirstName} {src.Person.LastName}"))
                .ForMember(dest => dest.Phone,
                    opt => opt.MapFrom(src => src.Person.Phone))
                .ForMember(dest => dest.Gender,
                    opt => opt.MapFrom(src => src.Person.Gender))
                .ForMember(dest => dest.DepartmentName,
                    opt => opt.MapFrom(src => src.Department.DepartmentName))
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(src => src.Status.ToString()));


            CreateMap<DoctorSchedule, DoctorScheduleResponseDto>();

            CreateMap<DoctorLeave, DoctorLeaveResponseDto>();

            CreateMap<TimeSlot, TimeSlotResponseDto>();

            CreateMap<Review, ReviewResponseDto>()
                .ForMember(dest => dest.PatientName,
                    opt => opt.MapFrom(src =>
                        $"{src.Patient.Person.FirstName} {src.Patient.Person.LastName}"));
        }
        private void ReservationMap()
        {
            CreateMap<CreateReceptionistDto, Person>();
            CreateMap<CreateReceptionistDto, Receptionist>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.PersonId, opt => opt.Ignore());

            CreateMap<UpdateReceptionistDto, Receptionist>()
                .ForAllMembers(opt => opt.Condition(
                (src, dest, srcMember) => srcMember != null));

            CreateMap<Receptionist, ReceptionistResponseDto>()
            .ForMember(dest => dest.FullName,
        opt => opt.MapFrom(src => $"{src.Person.FirstName} {src.Person.LastName}"))
            .ForMember(dest => dest.Phone,
        opt => opt.MapFrom(src => src.Person.Phone))
            .ForMember(dest => dest.Gender,
        opt => opt.MapFrom(src => src.Person.Gender.ToString()))
            .ForMember(dest => dest.Email,
        opt => opt.MapFrom(src => src.User.Email));
        }

            

    }
}
