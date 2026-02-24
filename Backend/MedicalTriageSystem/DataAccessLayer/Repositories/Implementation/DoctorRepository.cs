using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class DoctorRepository : GenericRepository<Doctor>, IDoctorRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public DoctorRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<Doctor?> GetDoctorWithDetailsAsync(int id)
        {
            return await _dbContext.Doctors
                .Include(d => d.Person)
                .Include(d => d.Department)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<Doctor>> GetAllWithDetailsAsync()
        {
            return await _dbContext.Doctors
                .Include(d => d.Person)
                .Include(d => d.Department)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<Doctor>> GetByDepartmentAsync(int departmentId)
        {
            return await _dbContext.Doctors
                .Include(d => d.Person)
                .Include(d => d.Department)
                .AsNoTracking()
                .Where(d => d.DepartmentId == departmentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Doctor>> SearchAsync(string? name, int? departmentId, string? specialization)
        {
            var query = _dbContext.Doctors
                .Include(d => d.Person)
                .Include(d => d.Department)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrEmpty(name))
                query = query.Where(d =>
                    d.Person.FirstName.Contains(name) ||
                    d.Person.LastName.Contains(name));

            if (departmentId.HasValue)
                query = query.Where(d => d.DepartmentId == departmentId);

            if (!string.IsNullOrEmpty(specialization))
                query = query.Where(d => d.Specialization.Contains(specialization));

            return await query.ToListAsync();
        }

        public async Task<bool> IsLicenseNumberUniqueAsync(string licenseNumber, int? excludeDoctorId = null)
        {
            return !await _dbContext.Doctors
                .AnyAsync(d => d.LicenseNumber == licenseNumber && d.Id != excludeDoctorId);
        }

        public async Task<IEnumerable<DoctorSchedule>> GetDoctorScheduleAsync(int doctorId)
        {
            return await _dbContext.DoctorSchedules
                .AsNoTracking()
                .Where(s => s.DoctorId == doctorId)
                .ToListAsync();
        }

        public async Task<IEnumerable<DoctorLeave>> GetDoctorLeavesAsync(int doctorId)
        {
            return await _dbContext.DoctorLeaves
                .AsNoTracking()
                .Where(l => l.DoctorId == doctorId)
                .ToListAsync();
        }

        public async Task<IEnumerable<TimeSlot>> GetDoctorTimeSlotsAsync(int doctorId)
        {
            return await _dbContext.TimeSlots
                .AsNoTracking()
                .Where(t => t.DoctorId == doctorId && !t.IsBooked)
                .ToListAsync();
        }

        public async Task<IEnumerable<Review>> GetDoctorReviewsAsync(int doctorId)
        {
            return await _dbContext.Reviews
                .Include(r => r.Patient)
                    .ThenInclude(p => p.Person)
                .AsNoTracking()
                .Where(r => r.DoctorId == doctorId)
                .ToListAsync();
        }
    }
}
