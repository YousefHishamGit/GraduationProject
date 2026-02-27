using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public AppointmentRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<IEnumerable<Appointment>> GetAllWithDetailsAsync()
        {
            return await _dbContext.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p.Person)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.Person)
                .Include(a => a.TimeSlot)
                .Include(a => a.Receptionist)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Appointment?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbContext.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p.Person)
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.Person)
                .Include(a => a.TimeSlot)
                .Include(a => a.Receptionist)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<IEnumerable<Appointment>> GetByDoctorIdAsync(int doctorId)
        {
            return await _dbContext.Appointments
                .Include(a => a.Patient)
                    .ThenInclude(p => p.Person)
                .Include(a => a.TimeSlot)
                .AsNoTracking()
                .Where(a => a.DoctorId == doctorId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetByPatientIdAsync(int patientId)
        {
            return await _dbContext.Appointments
                .Include(a => a.Doctor)
                    .ThenInclude(d => d.Person)
                .Include(a => a.TimeSlot)
                .AsNoTracking()
                .Where(a => a.PatientId == patientId)
                .ToListAsync();
        }
    }
}

