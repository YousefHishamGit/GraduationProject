using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class MedicalRecordRepository : GenericRepository<MedicalRecord>, IMedicalRecordRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public MedicalRecordRepository(MedicalTriageDbContext context) : base(context)
        {
            _dbContext = context;
        }

        public async Task<MedicalRecord?> GetByIdWithDetailsAsync(int id)
        {
            return await _dbContext.MedicalRecords
                .Include(m => m.Patient)
                    .ThenInclude(p => p.Person)
                .Include(m => m.Doctor)
                    .ThenInclude(d => d.Person)
                .Include(m => m.Prescriptions)
                .Include(m => m.LabRequests)
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<MedicalRecord?> GetByAppointmentIdAsync(int appointmentId)
        {
            return await _dbContext.MedicalRecords
                .Include(m => m.Patient)
                    .ThenInclude(p => p.Person)
                .Include(m => m.Doctor)
                    .ThenInclude(d => d.Person)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.AppointmentId == appointmentId);
        }

        public async Task<IEnumerable<MedicalRecord>> GetByPatientIdAsync(int patientId)
        {
            return await _dbContext.MedicalRecords
                .Include(m => m.Doctor)
                    .ThenInclude(d => d.Person)
                .AsNoTracking()
                .Where(m => m.PatientId == patientId)
                .ToListAsync();
        }
    }
}

