using AutoMapper;
using BusinessLogicLayer.DTOs.Admin;
using BusinessLogicLayer.DTOs.Patient;
using BusinessLogicLayer.DTOs.Appointment;
using BusinessLogicLayer.DTOs.Department;
using BusinessLogicLayer.DTOs.Doctor;
using BusinessLogicLayer.DTOs.LapRequest;
using BusinessLogicLayer.DTOs.MedicalRecord;
using BusinessLogicLayer.DTOs.Person;
using BusinessLogicLayer.DTOs.Prescription;
using BusinessLogicLayer.DTOs.Receptionist;
using BusinessLogicLayer.DTOs.Review;
using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
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
            ReservationMap();
            PersonMap();
            AppointmentMap();
            MedicalRecordMap();
            PrescriptionMap();
            DepartmentMap();
            LabRequestMap();
            ReviewMap();
            AdminMap();
            PatientMap();

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

            CreateMap<CreateDoctorLeaveDto, DoctorLeave>();
            
            CreateMap<UpdateDoctorLeaveDto, DoctorLeave>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<CreateDoctorScheduleDto, DoctorSchedule>();
     
            CreateMap<UpdateDoctorScheduleDto, DoctorSchedule>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<DoctorSchedule, DoctorScheduleResponseDto>();

            CreateMap<DoctorLeave, DoctorLeaveResponseDto>();

            CreateMap<TimeSlot, TimeSlotResponseDto>();

            CreateMap<Review, DTOs.Review.ReviewResponseDto>()
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
       
        private void AppointmentMap()
        {
            
            CreateMap<CreateAppointmentDto, Appointment>()
                .ForMember(dest => dest.Type,
                    opt => opt.MapFrom(src => Enum.Parse<AppointmentType>(src.Type)))
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(src => AppointmentStatus.Pending));

            
            CreateMap<UpdateAppointmentDto, Appointment>()
                .ForMember(dest => dest.Type,
                    opt => opt.MapFrom(src => src.Type != null
                        ? Enum.Parse<AppointmentType>(src.Type)
                        : (AppointmentType?)null))
                .ForAllMembers(opt => opt.Condition(
                    (src, dest, srcMember) => srcMember != null));

            
            CreateMap<Appointment, AppointmentResponseDto>()
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.Type,
                    opt => opt.MapFrom(src => src.Type.ToString()));
        }

        private void MedicalRecordMap()
        {
            
            CreateMap<CreateMedicalRecordDto, MedicalRecord>()
                .ForMember(dest => dest.CreatedOn,
                    opt => opt.MapFrom(src => DateTime.UtcNow));

            
            CreateMap<UpdateMedicalRecordDto, MedicalRecord>()
                .ForAllMembers(opt => opt.Condition(
                    (src, dest, srcMember) => srcMember != null));

            CreateMap<MedicalRecord, MedicalRecordResponseDto>();
        }

        private void PrescriptionMap()
        {
            CreateMap<CreatePrescriptionDto, Prescription>();

            CreateMap<UpdatePrescriptionDto, Prescription>()
                .ForAllMembers(opt => opt.Condition(
                    (src, dest, srcMember) => srcMember != null));

            CreateMap<Prescription, PrescriptionResponseDto>();
        }
        
        private void PersonMap() {
            CreateMap<Person, PersonResponseDto>()
              .ForMember(dest => dest.FullName,
          opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"))
             .ForMember(dest => dest.Gender,
        opt => opt.MapFrom(src => src.Gender.ToString()));
            CreateMap<UpdatePersonDto, Person>()
                    .ForAllMembers(opt => opt.Condition(
        (src, dest, srcMember) => srcMember != null));
        }

        private void DepartmentMap()
        {
            CreateMap<CreateDepartmentDto, Department>();
     

            CreateMap<UpdateDepartmentDto, Department>()
                .ForAllMembers(opt => opt.Condition(
                    (src, dest, srcMember) => srcMember != null));

            CreateMap<Department, DepartmentResponseDto>();
        }

        private void LabRequestMap()
        {
            CreateMap<CreateLabRequestDto, LabRequest>()
    .ForMember(dest => dest.Status,
        opt => opt.MapFrom(src => LabRequestStatus.Requested))
    .ForMember(dest => dest.RequestedOn,
        opt => opt.MapFrom(src => DateTime.UtcNow));

            CreateMap<UpdateLabRequestDto, LabRequest>()
                .ForAllMembers(opt => opt.Condition(
                    (src, dest, srcMember) => srcMember != null));

            CreateMap<LabRequest, LabRequestResponseDto>()
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(src => src.Status.ToString()));
        }

        private void ReviewMap()
        {
            CreateMap<CreateReviewDto, Review>();

            CreateMap<UpdateReviewDto, Review>()
                .ForAllMembers(opt => opt.Condition(
                    (src, dest, srcMember) => srcMember != null));

            CreateMap<Review, DTOs.Review.ReviewResponseDto>()
                .ForMember(dest => dest.PatientName,
                    opt => opt.MapFrom(src =>
                        $"{src.Patient.Person.FirstName} {src.Patient.Person.LastName}"));
        }

        private void AdminMap()
        {
            
            CreateMap<User, UserListDto>()
                .ForMember(dest => dest.FullName,
                    opt => opt.MapFrom(src => $"{src.Person.FirstName} {src.Person.LastName}"))
                .ForMember(dest => dest.Phone,
                    opt => opt.MapFrom(src => src.Person.Phone))
                .ForMember(dest => dest.Role,
                    opt => opt.MapFrom(src => src.Role.ToString()))
                .ForMember(dest => dest.CreatedOn,
                    opt => opt.MapFrom(src => src.Person.CreatedOn));

            CreateMap<Appointment, AppointmentsByDoctorDto>()
                .ForMember(dest => dest.DoctorId,
                    opt => opt.MapFrom(src => src.DoctorId))
                .ForMember(dest => dest.DoctorName,
                    opt => opt.MapFrom(src =>
                        $"{src.Doctor.Person.FirstName} {src.Doctor.Person.LastName}"))
                .ForMember(dest => dest.Count,
                    opt => opt.Ignore()); 

          
            CreateMap<Appointment, AppointmentsByTypeDto>()
                .ForMember(dest => dest.Type,
                    opt => opt.MapFrom(src => src.Type.ToString()))
                .ForMember(dest => dest.Count,
                    opt => opt.Ignore()); 
        }
  
        private void PatientMap()
        {
            CreateMap<UpdatePatientDto, Patient>()
                .ForAllMembers(opt => opt.Condition(
                    (src, dest, srcMember) => srcMember != null));

            CreateMap<Patient, PatientResponseDto>()
                .ForMember(dest => dest.FullName,
                    opt => opt.MapFrom(src => $"{src.Person.FirstName} {src.Person.LastName}"))
                .ForMember(dest => dest.BirthDate,
                    opt => opt.MapFrom(src => src.Person.BirthDate))
                .ForMember(dest => dest.Gender,
                    opt => opt.MapFrom(src => src.Person.Gender.ToString()))
                .ForMember(dest => dest.Phone,
                    opt => opt.MapFrom(src => src.Person.Phone))
                .ForMember(dest => dest.Address,
                    opt => opt.MapFrom(src => src.Person.Address))
                .ForMember(dest => dest.BloodType,
                    opt => opt.MapFrom(src => src.BloodType.HasValue ? src.BloodType.Value.ToString() : null));
        }




    }
}
