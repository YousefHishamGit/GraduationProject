using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using DataAccessLayer.Entities;

namespace DataAccessLayer.Data
{
    public class MedicalTriageDbContext : IdentityDbContext<User>
    {
        public MedicalTriageDbContext(DbContextOptions<MedicalTriageDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<Person> Persons { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Doctor> Doctors { get; set; }
        public DbSet<Receptionist> Receptionists { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<MedicalRecord> MedicalRecords { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<LabRequest> LabRequests { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<DoctorSchedule> DoctorSchedules { get; set; }
        public DbSet<DoctorLeave> DoctorLeaves { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Person Configuration
            modelBuilder.Entity<Person>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.NationalID)
                      .IsUnique();

                entity.Property(e => e.FirstName)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(e => e.LastName)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(e => e.NationalID)
                      .IsRequired()
                      .HasMaxLength(14);

                entity.Property(e => e.Phone)
                      .HasMaxLength(15);

                // One-to-One with User
                entity.HasOne(e => e.User)
                      .WithOne(e => e.Person)
                      .HasForeignKey<User>(e => e.PersonId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // User Configuration (Identity)
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.PersonId)
                      .IsUnique();

                entity.Property(e => e.Role)
                      .HasConversion<string>()
                      .HasMaxLength(20);
            });

            // Department Configuration
            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.DepartmentName)
                      .IsRequired()
                      .HasMaxLength(100);

                // Soft Delete Filter
                entity.HasQueryFilter(e => !e.IsDeleted);
            });

            // Doctor Configuration
            modelBuilder.Entity<Doctor>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.LicenseNumber)
                      .IsUnique();

                entity.HasIndex(e => e.PersonId)
                      .IsUnique();

                entity.HasIndex(e => e.UserId)
                      .IsUnique();

                entity.Property(e => e.LicenseNumber)
                      .IsRequired()
                      .HasMaxLength(50);

                entity.Property(e => e.Specialization)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.Status)
                      .HasConversion<string>()
                      .HasMaxLength(20);

                // Relationships
                entity.HasOne(e => e.Person)
                      .WithOne(e => e.Doctor)
                      .HasForeignKey<Doctor>(e => e.PersonId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                      .WithOne(e => e.Doctor)
                      .HasForeignKey<Doctor>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Department)
                      .WithMany(e => e.Doctors)
                      .HasForeignKey(e => e.DepartmentId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Patient Configuration
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.PersonId)
                      .IsUnique();

                entity.HasIndex(e => e.UserId)
                      .IsUnique();

                entity.Property(e => e.BloodType)
                      .HasConversion<string>()
                      .HasMaxLength(5);

                entity.Property(e => e.EmergencyContactPhone)
                      .HasMaxLength(15);

                // Relationships
                entity.HasOne(e => e.Person)
                      .WithOne(e => e.Patient)
                      .HasForeignKey<Patient>(e => e.PersonId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                      .WithOne(e => e.Patient)
                      .HasForeignKey<Patient>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Receptionist Configuration
            modelBuilder.Entity<Receptionist>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.PersonId)
                      .IsUnique();

                entity.HasIndex(e => e.UserId)
                      .IsUnique();

                // Relationships
                entity.HasOne(e => e.Person)
                      .WithOne(e => e.Receptionist)
                      .HasForeignKey<Receptionist>(e => e.PersonId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                      .WithOne(e => e.Receptionist)
                      .HasForeignKey<Receptionist>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // TimeSlot Configuration
            modelBuilder.Entity<TimeSlot>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.TimeSlots)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Appointment Configuration
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Type)
                      .HasConversion<string>()
                      .HasMaxLength(20);

                entity.Property(e => e.Status)
                      .HasConversion<string>()
                      .HasMaxLength(20);

                // Relationships
                entity.HasOne(e => e.Patient)
                      .WithMany(e => e.Appointments)
                      .HasForeignKey(e => e.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.Appointments)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.TimeSlot)
                      .WithOne(e => e.Appointment)
                      .HasForeignKey<Appointment>(e => e.TimeSlotId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Receptionist)
                      .WithMany(e => e.Appointments)
                      .HasForeignKey(e => e.ReceptionistId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            // Payment Configuration
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.AppointmentId)
                      .IsUnique();

                entity.Property(e => e.Status)
                      .HasConversion<string>()
                      .HasMaxLength(20);

                entity.Property(e => e.Method)
                      .HasConversion<string>()
                      .HasMaxLength(20);

                entity.Property(e => e.Currency)
                      .HasMaxLength(3);

                entity.HasOne(e => e.Appointment)
                      .WithOne(e => e.Payment)
                      .HasForeignKey<Payment>(e => e.AppointmentId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // MedicalRecord Configuration
            modelBuilder.Entity<MedicalRecord>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.AppointmentId)
                      .IsUnique();

                entity.HasOne(e => e.Appointment)
                      .WithOne(e => e.MedicalRecord)
                      .HasForeignKey<MedicalRecord>(e => e.AppointmentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Patient)
                      .WithMany(e => e.MedicalRecords)
                      .HasForeignKey(e => e.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.MedicalRecords)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Prescription Configuration
            modelBuilder.Entity<Prescription>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.MedicalRecord)
                      .WithMany(e => e.Prescriptions)
                      .HasForeignKey(e => e.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // LabRequest Configuration
            modelBuilder.Entity<LabRequest>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Status)
                      .HasConversion<string>()
                      .HasMaxLength(20);

                entity.HasOne(e => e.MedicalRecord)
                      .WithMany(e => e.LabRequests)
                      .HasForeignKey(e => e.MedicalRecordId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Review Configuration
            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.AppointmentId)
                      .IsUnique();

                entity.Property(e => e.Rating)
                      .HasDefaultValue(5);

                entity.HasOne(e => e.Appointment)
                      .WithOne(e => e.Review)
                      .HasForeignKey<Review>(e => e.AppointmentId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Patient)
                      .WithMany(e => e.Reviews)
                      .HasForeignKey(e => e.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.Reviews)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // DoctorSchedule Configuration
            modelBuilder.Entity<DoctorSchedule>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.Schedules)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // DoctorLeave Configuration
            modelBuilder.Entity<DoctorLeave>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Doctor)
                      .WithMany(e => e.Leaves)
                      .HasForeignKey(e => e.DoctorId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}