using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class MedicalRecordRepository : IMedicalRecordRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public MedicalRecordRepository(MedicalTriageDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<MedicalRecord?> GetByIdAsync(int id)
        {
            return await _dbContext.MedicalRecords
                .Include(m => m.Prescriptions)
                .Include(m => m.LabRequests)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<MedicalRecord?> GetTrackedByIdAsync(int id)
        {
            return await _dbContext.MedicalRecords.FindAsync(id);
        }

        public async Task<MedicalRecord?> GetByAppointmentIdAsync(int appointmentId)
        {
            return await _dbContext.MedicalRecords
                .Include(m => m.Prescriptions)
                .Include(m => m.LabRequests)
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.AppointmentId == appointmentId);
        }

        public async Task<IEnumerable<MedicalRecord>> GetByPatientIdAsync(int patientId)
        {
            return await _dbContext.MedicalRecords
                .AsNoTracking()
                .Where(m => m.PatientId == patientId)
                .OrderByDescending(m => m.CreatedOn)
                .ToListAsync();
        }

        public async Task AddAsync(MedicalRecord entity)
        {
            await _dbContext.MedicalRecords.AddAsync(entity);
        }

        public void Update(MedicalRecord entity)
        {
            _dbContext.MedicalRecords.Update(entity);
        }
    }
}

