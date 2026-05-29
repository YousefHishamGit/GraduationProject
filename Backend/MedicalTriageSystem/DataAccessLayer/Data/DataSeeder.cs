using DataAccessLayer.Entities;
using DataAccessLayer.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Data
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(
            MedicalTriageDbContext context,
            UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            // ══════════════════════════════════════
            // 1. ROLES
            // ══════════════════════════════════════
            string[] roles = ["Admin", "Doctor", "Patient", "Receptionist"];
            foreach (var role in roles)
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            if (await context.Departments.AnyAsync()) return; // منع إعادة الـ Seed

            // ══════════════════════════════════════
            // 2. DEPARTMENTS
            // ══════════════════════════════════════
            var departments = new List<Department>
            {
                new() { DepartmentName = "Cardiology",       Description = "Diagnosis and treatment of heart and cardiovascular diseases" },
                new() { DepartmentName = "Neurology",        Description = "Disorders of the brain, spinal cord, and nervous system" },
                new() { DepartmentName = "Orthopedics",      Description = "Bones, joints, ligaments, and musculoskeletal conditions" },
                new() { DepartmentName = "Pediatrics",       Description = "Medical care for infants, children, and adolescents" },
                new() { DepartmentName = "Dermatology",      Description = "Skin, hair, and nail disorders" },
                new() { DepartmentName = "General Surgery",  Description = "Surgical procedures for abdominal organs and general conditions" },
                new() { DepartmentName = "Internal Medicine",Description = "Diagnosis and non-surgical treatment of adult diseases" },
                new() { DepartmentName = "Ophthalmology",    Description = "Eye diseases, vision disorders, and eye surgery" }
            };
            await context.Departments.AddRangeAsync(departments);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 3. ADMIN
            // ══════════════════════════════════════
            var adminPerson = new Person
            {
                FirstName = "System", LastName = "Admin",
                NationalID = "00000000000000",
                BirthDate = new DateTime(1985, 1, 1),
                Gender = Gender.Male,
                Address = "Cairo, Egypt", Phone = "01000000000"
            };
            context.Persons.Add(adminPerson);
            await context.SaveChangesAsync();

            var adminUser = new User
            {
                UserName = "admin@medicare.com",
                Email = "admin@medicare.com",
                EmailConfirmed = true,
                PersonId = adminPerson.Id,
                IsActive = true,
                Role = UserRole.Admin
            };
            await userManager.CreateAsync(adminUser, "Admin@123456");
            await userManager.AddToRoleAsync(adminUser, "Admin");

            // ══════════════════════════════════════
            // 4. PERSONS
            // ══════════════════════════════════════
            var persons = new List<Person>
            {
                // Doctors (1-8)
                new() { FirstName="Khaled",  LastName="Mansour",  NationalID="29001011234501", BirthDate=new DateTime(1990,1,1),  Gender=Gender.Male,   Address="15 Tahrir Square, Cairo",     Phone="01001111001" },
                new() { FirstName="Nour",    LastName="El-Sayed", NationalID="29503022345602", BirthDate=new DateTime(1995,3,2),  Gender=Gender.Female, Address="22 Corniche St, Alexandria",  Phone="01001111002" },
                new() { FirstName="Tarek",   LastName="Fahmy",    NationalID="19805033456703", BirthDate=new DateTime(1988,5,3),  Gender=Gender.Male,   Address="5 El-Nasr Rd, Giza",          Phone="01001111003" },
                new() { FirstName="Rania",   LastName="Hosny",    NationalID="19807044567804", BirthDate=new DateTime(1987,7,4),  Gender=Gender.Female, Address="88 Shubra St, Cairo",         Phone="01001111004" },
                new() { FirstName="Mohamed", LastName="Gamal",    NationalID="19903055678905", BirthDate=new DateTime(1999,3,5),  Gender=Gender.Male,   Address="3 Port Said St, Mansoura",   Phone="01001111005" },
                new() { FirstName="Dina",    LastName="Shawky",   NationalID="19810066789006", BirthDate=new DateTime(1988,10,6), Gender=Gender.Female, Address="10 El-Geish St, Tanta",      Phone="01001111006" },
                new() { FirstName="Amr",     LastName="Zaki",     NationalID="19906077890107", BirthDate=new DateTime(1999,6,7),  Gender=Gender.Male,   Address="7 El-Hurriya Rd, Aswan",     Phone="01001111007" },
                new() { FirstName="Yasmine", LastName="Kamal",    NationalID="19912088901208", BirthDate=new DateTime(1999,12,8), Gender=Gender.Female, Address="33 Luxor Rd, Luxor",         Phone="01001111008" },
                // Patients (9-23)
                new() { FirstName="Hassan",  LastName="Abdalla",  NationalID="19701099012309", BirthDate=new DateTime(1975,1,9),  Gender=Gender.Male,   Address="14 Ramses St, Cairo",        Phone="01001111009" },
                new() { FirstName="Mona",    LastName="Nasser",   NationalID="19803100123410", BirthDate=new DateTime(1983,3,10), Gender=Gender.Female, Address="6 Salah Salem St, Cairo",    Phone="01001111010" },
                new() { FirstName="Ahmed",   LastName="Rashad",   NationalID="19811111234511", BirthDate=new DateTime(1985,11,11),Gender=Gender.Male,   Address="9 Dokki St, Giza",           Phone="01001111011" },
                new() { FirstName="Laila",   LastName="Fouad",    NationalID="19912122345612", BirthDate=new DateTime(1999,12,12),Gender=Gender.Female, Address="20 Zamalek St, Cairo",       Phone="01001111012" },
                new() { FirstName="Omar",    LastName="Fawzi",    NationalID="19705133456713", BirthDate=new DateTime(1977,5,13), Gender=Gender.Male,   Address="5 Maadi St, Cairo",          Phone="01001111013" },
                new() { FirstName="Salma",   LastName="Mohsen",   NationalID="19906144567814", BirthDate=new DateTime(1999,6,14), Gender=Gender.Female, Address="12 New Cairo, Cairo",        Phone="01001111014" },
                new() { FirstName="Karim",   LastName="Selim",    NationalID="19803155678915", BirthDate=new DateTime(1983,3,15), Gender=Gender.Male,   Address="3 Heliopolis, Cairo",        Phone="01001111015" },
                new() { FirstName="Rana",    LastName="Tawfik",   NationalID="19801166789016", BirthDate=new DateTime(1988,1,16), Gender=Gender.Female, Address="7 Mohandessin, Giza",        Phone="01001111016" },
                // Receptionists (17-18)
                new() { FirstName="Sherif",  LastName="Badr",     NationalID="19707177890117", BirthDate=new DateTime(1977,7,17), Gender=Gender.Male,   Address="30 October City, Giza",      Phone="01001111017" },
                new() { FirstName="Noha",    LastName="Ramadan",  NationalID="19805188901218", BirthDate=new DateTime(1985,5,18), Gender=Gender.Female, Address="22 Nasr City, Cairo",        Phone="01001111018" },
                // More Patients (19-23)
                new() { FirstName="Walid",   LastName="Saber",    NationalID="19809199012319", BirthDate=new DateTime(1981,9,19), Gender=Gender.Male,   Address="11 Smouha, Alexandria",      Phone="01001111019" },
                new() { FirstName="Heba",    LastName="Wahid",    NationalID="19901200123420", BirthDate=new DateTime(1990,1,20), Gender=Gender.Female, Address="4 Agami, Alexandria",        Phone="01001111020" },
                new() { FirstName="Bassem",  LastName="Lotfy",    NationalID="19904211234521", BirthDate=new DateTime(1994,4,21), Gender=Gender.Male,   Address="8 Shorouk City, Cairo",      Phone="01001111021" },
                new() { FirstName="Iman",    LastName="Ghazi",    NationalID="19902222345622", BirthDate=new DateTime(1999,2,22), Gender=Gender.Female, Address="15 Asyut City, Asyut",       Phone="01001111022" },
                new() { FirstName="Fady",    LastName="Hanna",    NationalID="19806233456723", BirthDate=new DateTime(1982,6,23), Gender=Gender.Male,   Address="19 Sohag, Sohag",            Phone="01001111023" }
            };
            await context.Persons.AddRangeAsync(persons);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 5. DOCTOR USERS & DOCTORS
            // ══════════════════════════════════════
            var doctorSeedImages = new[]
            {
                "/assets/img/person/Khaled Mahmoud.webp",
                "/assets/img/person/Nour Ibrahim.webp",
                "/assets/img/person/Tarek Saad.webp",
                "/assets/img/person/Mona Fawzy.webp",
                "/assets/img/person/Omar Ali.webp",
                "/assets/img/person/Hana Youssef.webp",
                "/assets/img/person/Ahmed Hassan.webp",
                "/assets/img/person/Sara Mohamed.webp"
            };

            var doctorData = new[]
            {
                new { Idx=0, Email="dr.khaled@nile-hospital.com",  DeptIdx=0, License="LIC-CARD-001", Spec="Interventional Cardiology",     Exp=14, Fee=600m, Status=DoctorStatus.Active,   Bio="Expert in coronary angioplasty and heart failure management.",   Hire=new DateTime(2020,1,15) },
                new { Idx=1, Email="dr.nour@nile-hospital.com",    DeptIdx=0, License="LIC-CARD-002", Spec="Echocardiography",               Exp=9,  Fee=500m, Status=DoctorStatus.Active,   Bio="Specializes in non-invasive cardiac imaging.",                   Hire=new DateTime(2021,3,1)  },
                new { Idx=2, Email="dr.tarek@nile-hospital.com",   DeptIdx=1, License="LIC-NEUR-001", Spec="Clinical Neurology",             Exp=12, Fee=650m, Status=DoctorStatus.Active,   Bio="Specialist in stroke management, epilepsy, and movement disorders.", Hire=new DateTime(2020,6,1) },
                new { Idx=3, Email="dr.rania@nile-hospital.com",   DeptIdx=2, License="LIC-ORTH-001", Spec="Joint Replacement Surgery",      Exp=11, Fee=700m, Status=DoctorStatus.Active,   Bio="Expert in knee and hip replacement and sports injuries.",         Hire=new DateTime(2019,9,1)  },
                new { Idx=4, Email="dr.mohamed@nile-hospital.com", DeptIdx=3, License="LIC-PEDI-001", Spec="Neonatal & Pediatric Medicine",  Exp=7,  Fee=400m, Status=DoctorStatus.Active,   Bio="Dedicated to newborn care and pediatric infectious diseases.",    Hire=new DateTime(2022,2,1)  },
                new { Idx=5, Email="dr.dina@nile-hospital.com",    DeptIdx=4, License="LIC-DERM-001", Spec="Clinical & Cosmetic Dermatology",Exp=10, Fee=550m, Status=DoctorStatus.Active,   Bio="Expert in acne, psoriasis, and aesthetic dermatology.",           Hire=new DateTime(2020,11,1) },
                new { Idx=6, Email="dr.amr@nile-hospital.com",     DeptIdx=5, License="LIC-SURG-001", Spec="Laparoscopic Surgery",           Exp=8,  Fee=750m, Status=DoctorStatus.Active,   Bio="Specializes in minimally invasive abdominal surgeries.",          Hire=new DateTime(2021,5,1)  },
                new { Idx=7, Email="dr.yasmine@nile-hospital.com", DeptIdx=6, License="LIC-INTM-001", Spec="Internal Medicine & Diabetology",Exp=6,  Fee=450m, Status=DoctorStatus.Inactive, Bio="Focused on diabetes management and metabolic syndromes.",         Hire=new DateTime(2023,1,1)  }
            };

            var doctorEntities = new List<Doctor>();

            foreach (var d in doctorData)
            {
                var person = persons[d.Idx];
                person.ImgPath = doctorSeedImages[d.Idx];
                var user = new User
                {
                    UserName = d.Email, Email = d.Email,
                    EmailConfirmed = true, PersonId = person.Id,
                    IsActive = true, Role = UserRole.Doctor
                };
                await userManager.CreateAsync(user, "Doctor@123456");
                await userManager.AddToRoleAsync(user, "Doctor");

                var doctor = new Doctor
                {
                    PersonId = person.Id, UserId = user.Id,
                    DepartmentId = departments[d.DeptIdx].Id,
                    LicenseNumber = d.License,
                    Specialization = d.Spec,
                    YearsOfExperience = d.Exp,
                    ConsultationFee = d.Fee,
                    Status = d.Status,
                    Bio = d.Bio,
                    HireDate = d.Hire,
                    ImgPath = doctorSeedImages[d.Idx]
                };
                context.Doctors.Add(doctor);
                await context.SaveChangesAsync();
                doctorEntities.Add(doctor);
            }

            // ══════════════════════════════════════
            // 6. PATIENT USERS & PATIENTS
            // ══════════════════════════════════════
            var patientData = new[]
            {
                new { PIdx=8,  Email="hassan.abdalla@gmail.com",  Blood=BloodType.BPositive,  Allergy="Penicillin",      History="Hypertension since 2018, Type 2 Diabetes diagnosed 2020",     ECName="Karima Abdalla",  ECPhone="01099110001" },
                new { PIdx=9,  Email="mona.nasser@gmail.com",     Blood=BloodType.APositive,  Allergy=(string?)null,     History="Asthma since childhood, Seasonal allergies",                  ECName="Hossam Nasser",   ECPhone="01099110002" },
                new { PIdx=10, Email="ahmed.rashad@yahoo.com",    Blood=BloodType.OPositive,  Allergy="Sulfa drugs",     History="Peptic ulcer 2019, No major surgeries",                       ECName="Nevin Rashad",    ECPhone="01099110003" },
                new { PIdx=11, Email="laila.fouad@hotmail.com",   Blood=BloodType.ANegative,  Allergy="Aspirin",         History="Migraine with aura, Iron deficiency anemia",                  ECName="Mariam Fouad",    ECPhone="01099110004" },
                new { PIdx=12, Email="omar.fawzi@gmail.com",      Blood=BloodType.BNegative,  Allergy=(string?)null,     History="Hyperlipidemia, Ex-smoker",                                   ECName="Samira Fawzi",    ECPhone="01099110005" },
                new { PIdx=13, Email="salma.mohsen@gmail.com",    Blood=BloodType.ABPositive, Allergy="Latex",           History="No significant history",                                      ECName="Ahmed Mohsen",    ECPhone="01099110006" },
                new { PIdx=14, Email="karim.selim@gmail.com",     Blood=BloodType.ONegative,  Allergy="Codeine",         History="Osteoarthritis right knee, Appendectomy 2015",                ECName="Hoda Selim",      ECPhone="01099110007" },
                new { PIdx=15, Email="rana.tawfik@gmail.com",     Blood=BloodType.ABNegative, Allergy=(string?)null,     History="Hypothyroidism on Levothyroxine, GERD",                       ECName="Sameh Tawfik",    ECPhone="01099110008" },
                new { PIdx=18, Email="walid.saber@gmail.com",     Blood=BloodType.BPositive,  Allergy="NSAIDs",          History="Chronic lower back pain, Disc herniation L4-L5",              ECName="Rasha Saber",     ECPhone="01099110009" },
                new { PIdx=19, Email="heba.wahid@gmail.com",      Blood=BloodType.APositive,  Allergy=(string?)null,     History="Polycystic ovary syndrome, Vitamin D deficiency",             ECName="Essam Wahid",     ECPhone="01099110010" },
                new { PIdx=20, Email="bassem.lotfy@gmail.com",    Blood=BloodType.OPositive,  Allergy="Amoxicillin",     History="Recurrent sinusitis, Tonsillectomy 2010",                     ECName="Soha Lotfy",      ECPhone="01099110011" },
                new { PIdx=21, Email="iman.ghazi@gmail.com",      Blood=BloodType.BNegative,  Allergy=(string?)null,     History="Anxiety disorder, on SSRIs",                                  ECName="Alaa Ghazi",      ECPhone="01099110012" },
                new { PIdx=22, Email="fady.hanna@gmail.com",      Blood=BloodType.ANegative,  Allergy="Iodine contrast", History="Type 1 Diabetes since age 12, on insulin pump",               ECName="Marian Hanna",    ECPhone="01099110013" }
            };

            var patientEntities = new List<Patient>();

            foreach (var p in patientData)
            {
                var person = persons[p.PIdx];
                var user = new User
                {
                    UserName = p.Email, Email = p.Email,
                    EmailConfirmed = true, PersonId = person.Id,
                    IsActive = true, Role = UserRole.Patient
                };
                await userManager.CreateAsync(user, "Patient@123456");
                await userManager.AddToRoleAsync(user, "Patient");

                var patient = new Patient
                {
                    PersonId = person.Id, UserId = user.Id,
                    BloodType = p.Blood,
                    Allergies = p.Allergy,
                    MedicalHistory = p.History,
                    EmergencyContactName = p.ECName,
                    EmergencyContactPhone = p.ECPhone
                };
                context.Patients.Add(patient);
                await context.SaveChangesAsync();
                patientEntities.Add(patient);
            }

            // ══════════════════════════════════════
            // 7. RECEPTIONISTS
            // ══════════════════════════════════════
            var recData = new[]
            {
                new { PIdx=16, Email="sherif.badr@nile-hospital.com",  Hire=new DateTime(2022,2,1) },
                new { PIdx=17, Email="noha.ramadan@nile-hospital.com", Hire=new DateTime(2023,6,1) }
            };

            var recEntities = new List<Receptionist>();

            foreach (var r in recData)
            {
                var person = persons[r.PIdx];
                var user = new User
                {
                    UserName = r.Email, Email = r.Email,
                    EmailConfirmed = true, PersonId = person.Id,
                    IsActive = true, Role = UserRole.Receptionist
                };
                await userManager.CreateAsync(user, "Rec@123456");
                await userManager.AddToRoleAsync(user, "Receptionist");

                var rec = new Receptionist
                {
                    PersonId = person.Id, UserId = user.Id,
                    HireDate = r.Hire, Status = "Active"
                };
                context.Receptionists.Add(rec);
                await context.SaveChangesAsync();
                recEntities.Add(rec);
            }

            // ══════════════════════════════════════
            // 8. DOCTOR SCHEDULES
            // ══════════════════════════════════════
            var schedules = new List<DoctorSchedule>
            {
                new() { DoctorId=doctorEntities[0].Id, DayOfWeek=0, StartTime=new TimeSpan(8,0,0),  EndTime=new TimeSpan(14,0,0), SlotDurationMinutes=30, IsAvailable=true },
                new() { DoctorId=doctorEntities[0].Id, DayOfWeek=2, StartTime=new TimeSpan(8,0,0),  EndTime=new TimeSpan(14,0,0), SlotDurationMinutes=30, IsAvailable=true },
                new() { DoctorId=doctorEntities[0].Id, DayOfWeek=4, StartTime=new TimeSpan(9,0,0),  EndTime=new TimeSpan(13,0,0), SlotDurationMinutes=30, IsAvailable=true },
                new() { DoctorId=doctorEntities[1].Id, DayOfWeek=1, StartTime=new TimeSpan(9,0,0),  EndTime=new TimeSpan(15,0,0), SlotDurationMinutes=30, IsAvailable=true },
                new() { DoctorId=doctorEntities[1].Id, DayOfWeek=3, StartTime=new TimeSpan(9,0,0),  EndTime=new TimeSpan(15,0,0), SlotDurationMinutes=30, IsAvailable=true },
                new() { DoctorId=doctorEntities[2].Id, DayOfWeek=0, StartTime=new TimeSpan(10,0,0), EndTime=new TimeSpan(16,0,0), SlotDurationMinutes=30, IsAvailable=true },
                new() { DoctorId=doctorEntities[2].Id, DayOfWeek=3, StartTime=new TimeSpan(10,0,0), EndTime=new TimeSpan(16,0,0), SlotDurationMinutes=30, IsAvailable=true },
                new() { DoctorId=doctorEntities[3].Id, DayOfWeek=1, StartTime=new TimeSpan(8,0,0),  EndTime=new TimeSpan(14,0,0), SlotDurationMinutes=45, IsAvailable=true },
                new() { DoctorId=doctorEntities[3].Id, DayOfWeek=4, StartTime=new TimeSpan(8,0,0),  EndTime=new TimeSpan(14,0,0), SlotDurationMinutes=45, IsAvailable=true },
                new() { DoctorId=doctorEntities[4].Id, DayOfWeek=0, StartTime=new TimeSpan(9,0,0),  EndTime=new TimeSpan(13,0,0), SlotDurationMinutes=20, IsAvailable=true },
                new() { DoctorId=doctorEntities[4].Id, DayOfWeek=2, StartTime=new TimeSpan(9,0,0),  EndTime=new TimeSpan(13,0,0), SlotDurationMinutes=20, IsAvailable=true },
                new() { DoctorId=doctorEntities[4].Id, DayOfWeek=4, StartTime=new TimeSpan(9,0,0),  EndTime=new TimeSpan(13,0,0), SlotDurationMinutes=20, IsAvailable=true },
                new() { DoctorId=doctorEntities[5].Id, DayOfWeek=1, StartTime=new TimeSpan(11,0,0), EndTime=new TimeSpan(17,0,0), SlotDurationMinutes=30, IsAvailable=true },
                new() { DoctorId=doctorEntities[5].Id, DayOfWeek=3, StartTime=new TimeSpan(11,0,0), EndTime=new TimeSpan(17,0,0), SlotDurationMinutes=30, IsAvailable=true },
                new() { DoctorId=doctorEntities[6].Id, DayOfWeek=2, StartTime=new TimeSpan(8,0,0),  EndTime=new TimeSpan(12,0,0), SlotDurationMinutes=60, IsAvailable=true },
                new() { DoctorId=doctorEntities[6].Id, DayOfWeek=6, StartTime=new TimeSpan(9,0,0),  EndTime=new TimeSpan(13,0,0), SlotDurationMinutes=60, IsAvailable=true },
                new() { DoctorId=doctorEntities[7].Id, DayOfWeek=1, StartTime=new TimeSpan(10,0,0), EndTime=new TimeSpan(16,0,0), SlotDurationMinutes=30, IsAvailable=false }
            };
            await context.DoctorSchedules.AddRangeAsync(schedules);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 9. DOCTOR LEAVES
            // ══════════════════════════════════════
            var leaves = new List<DoctorLeave>
            {
                new() { DoctorId=doctorEntities[0].Id, LeaveDate=new DateTime(2024,6,20), Reason="Medical conference in Dubai",  IsApproved=true  },
                new() { DoctorId=doctorEntities[2].Id, LeaveDate=new DateTime(2024,6,15), Reason="Annual leave",                IsApproved=true  },
                new() { DoctorId=doctorEntities[7].Id, LeaveDate=new DateTime(2024,6,1),  Reason="Maternity leave",             IsApproved=true  },
                new() { DoctorId=doctorEntities[4].Id, LeaveDate=new DateTime(2024,6,25), Reason="Personal emergency",          IsApproved=false }
            };
            await context.DoctorLeaves.AddRangeAsync(leaves);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 10. TIME SLOTS
            // ══════════════════════════════════════
            var slots = new List<TimeSlot>
            {
                new() { DoctorId=doctorEntities[0].Id, SlotStart=new DateTime(2024,6,5,8,0,0),   SlotEnd=new DateTime(2024,6,5,8,30,0),  IsBooked=true  },
                new() { DoctorId=doctorEntities[0].Id, SlotStart=new DateTime(2024,6,5,8,30,0),  SlotEnd=new DateTime(2024,6,5,9,0,0),   IsBooked=true  },
                new() { DoctorId=doctorEntities[0].Id, SlotStart=new DateTime(2024,6,5,9,0,0),   SlotEnd=new DateTime(2024,6,5,9,30,0),  IsBooked=false },
                new() { DoctorId=doctorEntities[0].Id, SlotStart=new DateTime(2024,6,5,9,30,0),  SlotEnd=new DateTime(2024,6,5,10,0,0),  IsBooked=false },
                new() { DoctorId=doctorEntities[1].Id, SlotStart=new DateTime(2024,6,6,9,0,0),   SlotEnd=new DateTime(2024,6,6,9,30,0),  IsBooked=true  },
                new() { DoctorId=doctorEntities[1].Id, SlotStart=new DateTime(2024,6,6,9,30,0),  SlotEnd=new DateTime(2024,6,6,10,0,0),  IsBooked=true  },
                new() { DoctorId=doctorEntities[1].Id, SlotStart=new DateTime(2024,6,6,10,0,0),  SlotEnd=new DateTime(2024,6,6,10,30,0), IsBooked=false },
                new() { DoctorId=doctorEntities[2].Id, SlotStart=new DateTime(2024,6,3,10,0,0),  SlotEnd=new DateTime(2024,6,3,10,30,0), IsBooked=true  },
                new() { DoctorId=doctorEntities[2].Id, SlotStart=new DateTime(2024,6,3,10,30,0), SlotEnd=new DateTime(2024,6,3,11,0,0),  IsBooked=true  },
                new() { DoctorId=doctorEntities[2].Id, SlotStart=new DateTime(2024,6,3,11,0,0),  SlotEnd=new DateTime(2024,6,3,11,30,0), IsBooked=false },
                new() { DoctorId=doctorEntities[3].Id, SlotStart=new DateTime(2024,6,4,8,0,0),   SlotEnd=new DateTime(2024,6,4,8,45,0),  IsBooked=true  },
                new() { DoctorId=doctorEntities[3].Id, SlotStart=new DateTime(2024,6,4,8,45,0),  SlotEnd=new DateTime(2024,6,4,9,30,0),  IsBooked=true  },
                new() { DoctorId=doctorEntities[4].Id, SlotStart=new DateTime(2024,6,7,9,0,0),   SlotEnd=new DateTime(2024,6,7,9,20,0),  IsBooked=true  },
                new() { DoctorId=doctorEntities[4].Id, SlotStart=new DateTime(2024,6,7,9,20,0),  SlotEnd=new DateTime(2024,6,7,9,40,0),  IsBooked=false },
                new() { DoctorId=doctorEntities[5].Id, SlotStart=new DateTime(2024,6,6,11,0,0),  SlotEnd=new DateTime(2024,6,6,11,30,0), IsBooked=true  },
                new() { DoctorId=doctorEntities[5].Id, SlotStart=new DateTime(2024,6,6,11,30,0), SlotEnd=new DateTime(2024,6,6,12,0,0),  IsBooked=true  },
                new() { DoctorId=doctorEntities[6].Id, SlotStart=new DateTime(2024,6,5,8,0,0),   SlotEnd=new DateTime(2024,6,5,9,0,0),   IsBooked=true  },
                new() { DoctorId=doctorEntities[6].Id, SlotStart=new DateTime(2024,6,5,9,0,0),   SlotEnd=new DateTime(2024,6,5,10,0,0),  IsBooked=false },
                new() { DoctorId=doctorEntities[0].Id, SlotStart=new DateTime(2024,6,10,8,0,0),  SlotEnd=new DateTime(2024,6,10,8,30,0), IsBooked=true  },
                new() { DoctorId=doctorEntities[1].Id, SlotStart=new DateTime(2024,6,11,9,0,0),  SlotEnd=new DateTime(2024,6,11,9,30,0), IsBooked=true  },
                // Future Available Slots
                new() { DoctorId=doctorEntities[0].Id, SlotStart=DateTime.Today.AddDays(1).AddHours(9),  SlotEnd=DateTime.Today.AddDays(1).AddHours(9).AddMinutes(30),  IsBooked=false },
                new() { DoctorId=doctorEntities[0].Id, SlotStart=DateTime.Today.AddDays(1).AddHours(10), SlotEnd=DateTime.Today.AddDays(1).AddHours(10).AddMinutes(30), IsBooked=false },
                new() { DoctorId=doctorEntities[1].Id, SlotStart=DateTime.Today.AddDays(2).AddHours(9),  SlotEnd=DateTime.Today.AddDays(2).AddHours(9).AddMinutes(30),  IsBooked=false },
                new() { DoctorId=doctorEntities[2].Id, SlotStart=DateTime.Today.AddDays(3).AddHours(10), SlotEnd=DateTime.Today.AddDays(3).AddHours(10).AddMinutes(30), IsBooked=false },
                new() { DoctorId=doctorEntities[3].Id, SlotStart=DateTime.Today.AddDays(2).AddHours(8),  SlotEnd=DateTime.Today.AddDays(2).AddHours(8).AddMinutes(45),  IsBooked=false },
                new() { DoctorId=doctorEntities[4].Id, SlotStart=DateTime.Today.AddDays(1).AddHours(9),  SlotEnd=DateTime.Today.AddDays(1).AddHours(9).AddMinutes(20),  IsBooked=false },
                new() { DoctorId=doctorEntities[5].Id, SlotStart=DateTime.Today.AddDays(3).AddHours(11), SlotEnd=DateTime.Today.AddDays(3).AddHours(11).AddMinutes(30), IsBooked=false },
                new() { DoctorId=doctorEntities[6].Id, SlotStart=DateTime.Today.AddDays(4).AddHours(8),  SlotEnd=DateTime.Today.AddDays(4).AddHours(9),                 IsBooked=false },
            };
            await context.TimeSlots.AddRangeAsync(slots);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 11. APPOINTMENTS
            // ══════════════════════════════════════
            var appointments = new List<Appointment>
            {
                new() { PatientId=patientEntities[0].Id, DoctorId=doctorEntities[0].Id, TimeSlotId=slots[0].Id,  ReceptionistId=recEntities[0].Id, AppointmentDate=new DateTime(2024,6,5,8,0,0),   Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Follow-up for hypertension and diabetes" },
                new() { PatientId=patientEntities[1].Id, DoctorId=doctorEntities[0].Id, TimeSlotId=slots[1].Id,  ReceptionistId=null,              AppointmentDate=new DateTime(2024,6,5,8,30,0),  Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Chest pain evaluation" },
                new() { PatientId=patientEntities[2].Id, DoctorId=doctorEntities[1].Id, TimeSlotId=slots[4].Id,  ReceptionistId=recEntities[1].Id, AppointmentDate=new DateTime(2024,6,6,9,0,0),   Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Palpitations and shortness of breath" },
                new() { PatientId=patientEntities[3].Id, DoctorId=doctorEntities[2].Id, TimeSlotId=slots[7].Id,  ReceptionistId=recEntities[0].Id, AppointmentDate=new DateTime(2024,6,3,10,0,0),  Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Severe headache and visual disturbances" },
                new() { PatientId=patientEntities[4].Id, DoctorId=doctorEntities[3].Id, TimeSlotId=slots[10].Id, ReceptionistId=null,              AppointmentDate=new DateTime(2024,6,4,8,0,0),   Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Right knee pain worsening over 3 months" },
                new() { PatientId=patientEntities[5].Id, DoctorId=doctorEntities[4].Id, TimeSlotId=slots[12].Id, ReceptionistId=recEntities[1].Id, AppointmentDate=new DateTime(2024,6,7,9,0,0),   Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Routine pediatric wellness check - 4 years old" },
                new() { PatientId=patientEntities[6].Id, DoctorId=doctorEntities[5].Id, TimeSlotId=slots[14].Id, ReceptionistId=recEntities[0].Id, AppointmentDate=new DateTime(2024,6,6,11,0,0),  Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Persistent acne and rash on face" },
                new() { PatientId=patientEntities[7].Id, DoctorId=doctorEntities[6].Id, TimeSlotId=slots[16].Id, ReceptionistId=null,              AppointmentDate=new DateTime(2024,6,5,8,0,0),   Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Abdominal pain, suspected gallstones" },
                new() { PatientId=patientEntities[8].Id, DoctorId=doctorEntities[3].Id, TimeSlotId=slots[11].Id, ReceptionistId=recEntities[1].Id, AppointmentDate=new DateTime(2024,6,4,8,45,0),  Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Lower back pain radiating to left leg" },
                new() { PatientId=patientEntities[9].Id, DoctorId=doctorEntities[2].Id, TimeSlotId=slots[8].Id,  ReceptionistId=recEntities[0].Id, AppointmentDate=new DateTime(2024,6,3,10,30,0), Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Dizziness and numbness in right hand" },
                new() { PatientId=patientEntities[10].Id,DoctorId=doctorEntities[1].Id, TimeSlotId=slots[5].Id,  ReceptionistId=null,              AppointmentDate=new DateTime(2024,6,6,9,30,0),  Type=AppointmentType.Online,   Status=AppointmentStatus.Cancelled, Notes="Echo follow-up", CancellationReason="Patient travel conflict" },
                new() { PatientId=patientEntities[11].Id,DoctorId=doctorEntities[5].Id, TimeSlotId=slots[15].Id, ReceptionistId=recEntities[1].Id, AppointmentDate=new DateTime(2024,6,6,11,30,0), Type=AppointmentType.InPerson, Status=AppointmentStatus.Completed, Notes="Scalp psoriasis management" },
                new() { PatientId=patientEntities[12].Id,DoctorId=doctorEntities[0].Id, TimeSlotId=slots[18].Id, ReceptionistId=recEntities[0].Id, AppointmentDate=new DateTime(2024,6,10,8,0,0),  Type=AppointmentType.InPerson, Status=AppointmentStatus.Confirmed,  Notes="Diabetic cardiomyopathy monitoring" },
                new() { PatientId=patientEntities[2].Id, DoctorId=doctorEntities[1].Id, TimeSlotId=slots[19].Id, ReceptionistId=null,              AppointmentDate=new DateTime(2024,6,11,9,0,0),  Type=AppointmentType.Online,   Status=AppointmentStatus.Confirmed,  Notes="Echo results review - online follow-up" },
                new() { PatientId=patientEntities[0].Id, DoctorId=doctorEntities[2].Id, TimeSlotId=slots[9].Id,  ReceptionistId=recEntities[1].Id, AppointmentDate=new DateTime(2024,6,3,11,0,0),  Type=AppointmentType.InPerson, Status=AppointmentStatus.Pending,    Notes="TIA evaluation referred by cardiologist" }
            };
            await context.Appointments.AddRangeAsync(appointments);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 12. MEDICAL RECORDS
            // ══════════════════════════════════════
            var records = new List<MedicalRecord>
            {
                new() { AppointmentId=appointments[0].Id,  PatientId=patientEntities[0].Id,  DoctorId=doctorEntities[0].Id, Diagnosis="Essential Hypertension Stage 2 with Type 2 Diabetes Mellitus",        Notes="BP 158/96 mmHg. HbA1c 8.2%. Increased antihypertensive dose. Referred to neurologist.", VitalSigns="{\"BP\":\"158/96\",\"Pulse\":88,\"Temp\":37.0}" },
                new() { AppointmentId=appointments[1].Id,  PatientId=patientEntities[1].Id,  DoctorId=doctorEntities[0].Id, Diagnosis="Stable Angina Pectoris",                                                Notes="ECG shows T-wave inversion V4-V6. Troponin negative. Stress test ordered.",             VitalSigns="{\"BP\":\"130/85\",\"Pulse\":76,\"Temp\":36.8}" },
                new() { AppointmentId=appointments[2].Id,  PatientId=patientEntities[2].Id,  DoctorId=doctorEntities[1].Id, Diagnosis="Paroxysmal Atrial Fibrillation",                                         Notes="Echo shows left atrial dilation. EF 55%. Started on anticoagulation.",                   VitalSigns="{\"BP\":\"128/80\",\"Pulse\":102,\"Temp\":36.9}" },
                new() { AppointmentId=appointments[3].Id,  PatientId=patientEntities[3].Id,  DoctorId=doctorEntities[2].Id, Diagnosis="Migraine with Aura - Hemiplegic Type",                                   Notes="MRI brain normal. Prophylactic treatment started. Advised headache diary.",              VitalSigns="{\"BP\":\"118/72\",\"Pulse\":72,\"Temp\":36.7}" },
                new() { AppointmentId=appointments[4].Id,  PatientId=patientEntities[4].Id,  DoctorId=doctorEntities[3].Id, Diagnosis="Osteoarthritis Right Knee Grade III",                                    Notes="X-ray shows joint space narrowing. Injection given. Knee replacement discussed.",       VitalSigns="{\"BP\":\"135/88\",\"Pulse\":80,\"Temp\":37.1}" },
                new() { AppointmentId=appointments[5].Id,  PatientId=patientEntities[5].Id,  DoctorId=doctorEntities[4].Id, Diagnosis="Normal Pediatric Development - Age 4",                                   Notes="Weight 17kg, Height 102cm. Vaccinations up to date. Growth normal.",                    VitalSigns="{\"BP\":\"90/60\",\"Pulse\":95,\"Temp\":36.8}" },
                new() { AppointmentId=appointments[6].Id,  PatientId=patientEntities[6].Id,  DoctorId=doctorEntities[5].Id, Diagnosis="Moderate Acne Vulgaris with Seborrheic Dermatitis",                     Notes="Comedones on face. Started topical retinoid and benzoyl peroxide.",                     VitalSigns="{\"BP\":\"120/78\",\"Pulse\":70,\"Temp\":36.6}" },
                new() { AppointmentId=appointments[7].Id,  PatientId=patientEntities[7].Id,  DoctorId=doctorEntities[6].Id, Diagnosis="Symptomatic Cholelithiasis (Gallstones)",                                Notes="Ultrasound confirms gallstones. Elective laparoscopic cholecystectomy planned.",         VitalSigns="{\"BP\":\"122/80\",\"Pulse\":74,\"Temp\":37.2}" },
                new() { AppointmentId=appointments[8].Id,  PatientId=patientEntities[8].Id,  DoctorId=doctorEntities[3].Id, Diagnosis="Lumbar Disc Herniation L4-L5 with Left Sciatica",                        Notes="MRI confirms L4-L5 herniation with nerve root compression. Surgery discussed.",          VitalSigns="{\"BP\":\"138/90\",\"Pulse\":82,\"Temp\":37.0}" },
                new() { AppointmentId=appointments[9].Id,  PatientId=patientEntities[9].Id,  DoctorId=doctorEntities[2].Id, Diagnosis="Transient Ischemic Attack (TIA) - Carotid Territory",                    Notes="MRI shows small restricted diffusion right MCA. Antiplatelet therapy started.",          VitalSigns="{\"BP\":\"152/94\",\"Pulse\":86,\"Temp\":36.9}" },
                new() { AppointmentId=appointments[11].Id, PatientId=patientEntities[11].Id, DoctorId=doctorEntities[5].Id, Diagnosis="Scalp Psoriasis with Plaque Psoriasis",                                  Notes="PASI score 12. Topical corticosteroids prescribed.",                                    VitalSigns="{\"BP\":\"115/70\",\"Pulse\":68,\"Temp\":36.5}" }
            };
            await context.MedicalRecords.AddRangeAsync(records);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 13. PRESCRIPTIONS
            // ══════════════════════════════════════
            var prescriptions = new List<Prescription>
            {
                // Record 1 (HTN + DM)
                new() { MedicalRecordId=records[0].Id, MedicineName="Amlodipine",           Dosage="10mg",       Frequency="Once daily",          DurationDays=30, Instructions="Take in the morning with water" },
                new() { MedicalRecordId=records[0].Id, MedicineName="Losartan",              Dosage="100mg",      Frequency="Once daily",          DurationDays=30, Instructions="Take at bedtime" },
                new() { MedicalRecordId=records[0].Id, MedicineName="Metformin",             Dosage="1000mg",     Frequency="Twice daily",         DurationDays=30, Instructions="Take with meals to reduce GI side effects" },
                // Record 2 (Angina)
                new() { MedicalRecordId=records[1].Id, MedicineName="Isosorbide Mononitrate",Dosage="20mg",      Frequency="Twice daily",         DurationDays=14, Instructions="Take first dose in morning, second at 2pm. Avoid evening use." },
                new() { MedicalRecordId=records[1].Id, MedicineName="Aspirin",               Dosage="75mg",      Frequency="Once daily",          DurationDays=90, Instructions="Take with food. Do not crush or chew." },
                new() { MedicalRecordId=records[1].Id, MedicineName="Atorvastatin",          Dosage="40mg",      Frequency="Once daily at night", DurationDays=90, Instructions="Take at bedtime" },
                // Record 3 (AFib)
                new() { MedicalRecordId=records[2].Id, MedicineName="Rivaroxaban",           Dosage="20mg",      Frequency="Once daily",          DurationDays=90, Instructions="Take with the evening meal" },
                new() { MedicalRecordId=records[2].Id, MedicineName="Bisoprolol",            Dosage="5mg",       Frequency="Once daily",          DurationDays=30, Instructions="Take in the morning" },
                // Record 4 (Migraine)
                new() { MedicalRecordId=records[3].Id, MedicineName="Topiramate",            Dosage="50mg",      Frequency="Twice daily",         DurationDays=90, Instructions="Start with 25mg for 2 weeks then increase. Stay hydrated." },
                new() { MedicalRecordId=records[3].Id, MedicineName="Sumatriptan",           Dosage="50mg",      Frequency="As needed for attack",DurationDays=30, Instructions="Take at onset of migraine. Max 2 tablets per 24 hours." },
                // Record 5 (OA Knee)
                new() { MedicalRecordId=records[4].Id, MedicineName="Celecoxib",             Dosage="200mg",     Frequency="Once daily",          DurationDays=14, Instructions="Take with food. Monitor for GI symptoms." },
                new() { MedicalRecordId=records[4].Id, MedicineName="Glucosamine Sulfate",   Dosage="1500mg",    Frequency="Once daily",          DurationDays=90, Instructions="Take with breakfast" },
                // Record 7 (Acne)
                new() { MedicalRecordId=records[6].Id, MedicineName="Adapalene",             Dosage="0.1% gel",  Frequency="Once nightly",        DurationDays=60, Instructions="Apply thin layer to affected area. Avoid eyes and mouth." },
                new() { MedicalRecordId=records[6].Id, MedicineName="Benzoyl Peroxide",      Dosage="2.5% wash", Frequency="Twice daily",         DurationDays=60, Instructions="Use as face wash morning and evening" },
                // Record 9 (Disc Herniation)
                new() { MedicalRecordId=records[8].Id, MedicineName="Pregabalin",            Dosage="75mg",      Frequency="Twice daily",         DurationDays=30, Instructions="May cause drowsiness. Avoid driving initially." },
                new() { MedicalRecordId=records[8].Id, MedicineName="Diclofenac Sodium",     Dosage="75mg",      Frequency="Twice daily",         DurationDays=10, Instructions="Take with food. Not for long-term use." },
                // Record 10 (TIA)
                new() { MedicalRecordId=records[9].Id, MedicineName="Clopidogrel",           Dosage="75mg",      Frequency="Once daily",          DurationDays=90, Instructions="Take at same time each day. Do not stop without doctor advice." },
                new() { MedicalRecordId=records[9].Id, MedicineName="Rosuvastatin",          Dosage="20mg",      Frequency="Once daily at night", DurationDays=90, Instructions="Take at bedtime" },
                // Record 11 (Psoriasis)
                new() { MedicalRecordId=records[10].Id, MedicineName="Betamethasone Valerate",Dosage="0.1% cream",Frequency="Twice daily",        DurationDays=28, Instructions="Apply to affected areas only. Do not use on face." },
                new() { MedicalRecordId=records[10].Id, MedicineName="Calcipotriol",         Dosage="50mcg/g",   Frequency="Once daily",          DurationDays=28, Instructions="Apply to plaques on scalp at bedtime" }
            };
            await context.Prescriptions.AddRangeAsync(prescriptions);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 14. LAB REQUESTS
            // ══════════════════════════════════════
            var labs = new List<LabRequest>
            {
                new() { MedicalRecordId=records[0].Id,  TestName="HbA1c",                          Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/HbA1c.pdf",      RequestedOn=new DateTime(2024,6,5,9,0,0),   ResultOn=new DateTime(2024,6,7,10,0,0) },
                new() { MedicalRecordId=records[0].Id,  TestName="Fasting Blood Glucose",          Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/FBG.pdf",        RequestedOn=new DateTime(2024,6,5,9,0,0),   ResultOn=new DateTime(2024,6,7,10,0,0) },
                new() { MedicalRecordId=records[0].Id,  TestName="Complete Metabolic Panel",       Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/CMP.pdf",        RequestedOn=new DateTime(2024,6,5,9,0,0),   ResultOn=new DateTime(2024,6,7,10,0,0) },
                new() { MedicalRecordId=records[1].Id,  TestName="Troponin I (High Sensitivity)",  Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/Troponin.pdf",   RequestedOn=new DateTime(2024,6,5,9,10,0),  ResultOn=new DateTime(2024,6,5,11,30,0) },
                new() { MedicalRecordId=records[1].Id,  TestName="Lipid Profile",                  Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/Lipids.pdf",     RequestedOn=new DateTime(2024,6,5,9,10,0),  ResultOn=new DateTime(2024,6,7,8,0,0) },
                new() { MedicalRecordId=records[2].Id,  TestName="Coagulation Profile (PT/INR)",   Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/Coag.pdf",       RequestedOn=new DateTime(2024,6,6,9,50,0),  ResultOn=new DateTime(2024,6,7,9,0,0) },
                new() { MedicalRecordId=records[2].Id,  TestName="Thyroid Function Tests (TSH/T4)",Status=LabRequestStatus.Requested, ResultFilePath=null,                          RequestedOn=new DateTime(2024,6,6,9,50,0),  ResultOn=null },
                new() { MedicalRecordId=records[3].Id,  TestName="Brain MRI with Contrast",        Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/MRI_Brain.pdf",  RequestedOn=new DateTime(2024,6,3,11,0,0),  ResultOn=new DateTime(2024,6,5,14,0,0) },
                new() { MedicalRecordId=records[4].Id,  TestName="Right Knee X-Ray (AP & Lateral)",Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/KneeXray.pdf",   RequestedOn=new DateTime(2024,6,4,8,50,0),  ResultOn=new DateTime(2024,6,4,10,0,0) },
                new() { MedicalRecordId=records[7].Id,  TestName="Abdominal Ultrasound",            Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/AbdoUS.pdf",     RequestedOn=new DateTime(2024,6,5,8,55,0),  ResultOn=new DateTime(2024,6,5,10,30,0) },
                new() { MedicalRecordId=records[7].Id,  TestName="Liver Function Tests",            Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/LFT.pdf",        RequestedOn=new DateTime(2024,6,5,8,55,0),  ResultOn=new DateTime(2024,6,7,8,0,0) },
                new() { MedicalRecordId=records[8].Id,  TestName="Lumbar Spine MRI",                Status=LabRequestStatus.Done,      ResultFilePath="/results/lab/LumbarMRI.pdf",  RequestedOn=new DateTime(2024,6,4,9,35,0),  ResultOn=new DateTime(2024,6,6,9,0,0) },
                new() { MedicalRecordId=records[9].Id,  TestName="Carotid Doppler Ultrasound",      Status=LabRequestStatus.Requested, ResultFilePath=null,                          RequestedOn=new DateTime(2024,6,3,11,10,0), ResultOn=null },
                new() { MedicalRecordId=records[9].Id,  TestName="Fasting Lipid Profile",           Status=LabRequestStatus.Requested, ResultFilePath=null,                          RequestedOn=new DateTime(2024,6,3,11,10,0), ResultOn=null }
            };
            await context.LabRequests.AddRangeAsync(labs);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 15. PAYMENTS
            // ══════════════════════════════════════
            var payments = new List<Payment>
            {
                new() { AppointmentId=appointments[0].Id,  Amount=600m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Cash,      PaidAt=new DateTime(2024,6,5,7,50,0)  },
                new() { AppointmentId=appointments[1].Id,  Amount=600m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Insurance,  PaidAt=new DateTime(2024,6,5,8,20,0)  },
                new() { AppointmentId=appointments[2].Id,  Amount=500m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Stripe,     PaidAt=new DateTime(2024,6,6,8,50,0), StripeSessionId="cs_test_stripe003", PaymentIntentId="pi_test_003" },
                new() { AppointmentId=appointments[3].Id,  Amount=650m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Cash,       PaidAt=new DateTime(2024,6,3,9,50,0)  },
                new() { AppointmentId=appointments[4].Id,  Amount=700m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Insurance,  PaidAt=new DateTime(2024,6,4,7,55,0)  },
                new() { AppointmentId=appointments[5].Id,  Amount=400m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Cash,       PaidAt=new DateTime(2024,6,7,8,50,0)  },
                new() { AppointmentId=appointments[6].Id,  Amount=550m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Stripe,     PaidAt=new DateTime(2024,6,6,10,50,0), StripeSessionId="cs_test_stripe007", PaymentIntentId="pi_test_007" },
                new() { AppointmentId=appointments[7].Id,  Amount=750m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Cash,       PaidAt=new DateTime(2024,6,5,7,45,0)  },
                new() { AppointmentId=appointments[8].Id,  Amount=700m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Insurance,  PaidAt=new DateTime(2024,6,4,8,40,0)  },
                new() { AppointmentId=appointments[9].Id,  Amount=650m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Cash,       PaidAt=new DateTime(2024,6,3,9,50,0)  },
                new() { AppointmentId=appointments[10].Id, Amount=500m,  Currency="EGP", Status=PaymentStatus.Refunded,Method=PaymentMethod.Stripe,     PaidAt=null, StripeSessionId="cs_test_stripe011", PaymentIntentId="pi_test_011" },
                new() { AppointmentId=appointments[11].Id, Amount=550m,  Currency="EGP", Status=PaymentStatus.Paid,    Method=PaymentMethod.Stripe,     PaidAt=new DateTime(2024,6,6,11,20,0), StripeSessionId="cs_test_stripe012", PaymentIntentId="pi_test_012" },
                new() { AppointmentId=appointments[12].Id, Amount=600m,  Currency="EGP", Status=PaymentStatus.Pending, Method=PaymentMethod.Cash,       PaidAt=null },
                new() { AppointmentId=appointments[13].Id, Amount=500m,  Currency="EGP", Status=PaymentStatus.Pending, Method=PaymentMethod.Stripe,     PaidAt=null, StripeSessionId="cs_test_stripe014" }
            };
            await context.Payments.AddRangeAsync(payments);
            await context.SaveChangesAsync();

            // ══════════════════════════════════════
            // 16. REVIEWS
            // ══════════════════════════════════════
            var reviews = new List<Review>
            {
                new() { AppointmentId=appointments[0].Id,  PatientId=patientEntities[0].Id,  DoctorId=doctorEntities[0].Id, Rating=5, Comment="Dr. Khaled is very thorough and takes his time to explain everything. Excellent doctor!" },
                new() { AppointmentId=appointments[1].Id,  PatientId=patientEntities[1].Id,  DoctorId=doctorEntities[0].Id, Rating=4, Comment="Very professional. The clinic was well organized. Slightly long wait time." },
                new() { AppointmentId=appointments[2].Id,  PatientId=patientEntities[2].Id,  DoctorId=doctorEntities[1].Id, Rating=5, Comment="Dr. Nour was fantastic. Very patient and explained my condition in detail." },
                new() { AppointmentId=appointments[3].Id,  PatientId=patientEntities[3].Id,  DoctorId=doctorEntities[2].Id, Rating=5, Comment="Best neurologist I have ever seen. Diagnosed my condition correctly after years of misdiagnosis." },
                new() { AppointmentId=appointments[4].Id,  PatientId=patientEntities[4].Id,  DoctorId=doctorEntities[3].Id, Rating=4, Comment="Dr. Rania was knowledgeable and kind. The injection helped a lot." },
                new() { AppointmentId=appointments[5].Id,  PatientId=patientEntities[5].Id,  DoctorId=doctorEntities[4].Id, Rating=5, Comment="Wonderful pediatrician. My daughter was comfortable and not scared at all." },
                new() { AppointmentId=appointments[6].Id,  PatientId=patientEntities[6].Id,  DoctorId=doctorEntities[5].Id, Rating=3, Comment="Doctor was good but waiting room was crowded and appointment started 30 minutes late." },
                new() { AppointmentId=appointments[7].Id,  PatientId=patientEntities[7].Id,  DoctorId=doctorEntities[6].Id, Rating=5, Comment="Dr. Amr explained the surgery clearly and I feel much more reassured. Very professional." },
                new() { AppointmentId=appointments[8].Id,  PatientId=patientEntities[8].Id,  DoctorId=doctorEntities[3].Id, Rating=4, Comment="Good consultation. The MRI results were explained well. Surgery option is still scary." },
                new() { AppointmentId=appointments[9].Id,  PatientId=patientEntities[9].Id,  DoctorId=doctorEntities[2].Id, Rating=5, Comment="Dr. Tarek acted quickly and professionally. I am grateful for the urgent care." },
                new() { AppointmentId=appointments[11].Id, PatientId=patientEntities[11].Id, DoctorId=doctorEntities[5].Id, Rating=4, Comment="Treatment is working well so far. Doctor was informative about long-term management." }
            };
            await context.Reviews.AddRangeAsync(reviews);
            await context.SaveChangesAsync();

            Console.WriteLine("✅ Database seeded successfully with full data!");
        }

        /// <summary>
        /// Replaces legacy template image paths (person-m-*.webp) with real asset paths.
        /// </summary>
        public static async Task FixDoctorPlaceholderImagesAsync(MedicalTriageDbContext context)
        {
            var imageByName = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Khaled Mansour"] = "/assets/img/person/Khaled Mahmoud.webp",
                ["Nour El-Sayed"] = "/assets/img/person/Nour Ibrahim.webp",
                ["Tarek Fahmy"] = "/assets/img/person/Tarek Saad.webp",
                ["Rania Hosny"] = "/assets/img/person/Mona Fawzy.webp",
                ["Mohamed Gamal"] = "/assets/img/person/Omar Ali.webp",
                ["Dina Shawky"] = "/assets/img/person/Hana Youssef.webp",
                ["Amr Zaki"] = "/assets/img/person/Ahmed Hassan.webp",
                ["Amira Zaki"] = "/assets/img/person/Ahmed Hassan.webp",
                ["Yasmine Kamal"] = "/assets/img/person/Sara Mohamed.webp",
            };

            var doctors = await context.Doctors
                .Include(d => d.Person)
                .ToListAsync();

            var changed = false;
            foreach (var doctor in doctors)
            {
                var currentPath = doctor.Person?.ImgPath ?? doctor.ImgPath;
                if (string.IsNullOrEmpty(currentPath) ||
                    (!currentPath.Contains("person-m-", StringComparison.OrdinalIgnoreCase) &&
                     !currentPath.Contains("person-f-", StringComparison.OrdinalIgnoreCase)))
                {
                    continue;
                }

                var fullName = $"{doctor.Person!.FirstName} {doctor.Person.LastName}";
                if (!imageByName.TryGetValue(fullName, out var newPath))
                    continue;

                doctor.ImgPath = newPath;
                doctor.Person.ImgPath = newPath;
                changed = true;
            }

            if (changed)
                await context.SaveChangesAsync();
        }
    }
}