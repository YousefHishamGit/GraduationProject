using DataAccessLayer.Data;
using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class PrescriptionRepository : IPrescriptionRepository
    {
        private readonly MedicalTriageDbContext _dbContext;

        public PrescriptionRepository(MedicalTriageDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Prescription?> GetByIdAsync(int id)
        {
            return await _dbContext.Prescriptions
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Prescription?> GetTrackedByIdAsync(int id)
        {
            return await _dbContext.Prescriptions.FindAsync(id);
        }

        public async Task<IEnumerable<Prescription>> GetByMedicalRecordIdAsync(int medicalRecordId)
        {
            return await _dbContext.Prescriptions
                .AsNoTracking()
                .Where(p => p.MedicalRecordId == medicalRecordId)
                .ToListAsync();
        }

        public async Task AddAsync(Prescription entity)
        {
            await _dbContext.Prescriptions.AddAsync(entity);
        }

        public void Update(Prescription entity)
        {
            _dbContext.Prescriptions.Update(entity);
        }

        public void Delete(Prescription entity)
        {
            _dbContext.Prescriptions.Remove(entity);
        }
    }
}

